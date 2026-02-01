// api/relative-strength.ts
// Vercel Serverless Function - Relative Strength Calculator

import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============ TWELVE DATA PROVIDER ============
const TWELVE_DATA_BASE = 'https://api.twelvedata.com';

type PriceRow = {
    ticker: string;
    date: string;
    adjClose: number;
};

type TwelveDataValue = {
    datetime: string;
    close: string;
};

type TwelveDataResponse = {
    values?: TwelveDataValue[];
    status?: string;
    message?: string;
};

const priceCache = new Map<string, { data: PriceRow[]; fetchedAt: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000;

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 150;

async function rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    lastRequestTime = Date.now();
    return fetch(url);
}

async function fetchTickerPrices(ticker: string, endDate: string, days: number = 300): Promise<PriceRow[]> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
        throw new Error('TWELVE_DATA_API_KEY environment variable not set');
    }

    const upperTicker = ticker.toUpperCase();
    const cacheKey = `${upperTicker}:${endDate}`;
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        console.log(`Cache hit for ${upperTicker}`);
        return cached.data;
    }

    const url = new URL(`${TWELVE_DATA_BASE}/time_series`);
    url.searchParams.set('symbol', upperTicker);
    url.searchParams.set('interval', '1day');
    url.searchParams.set('outputsize', days.toString());
    url.searchParams.set('end_date', endDate);
    url.searchParams.set('apikey', apiKey);

    const res = await rateLimitedFetch(url.toString());
    if (!res.ok) {
        throw new Error(`Twelve Data API error: ${res.status}`);
    }

    const data: TwelveDataResponse = await res.json();
    if (data.status === 'error') {
        throw new Error(`Twelve Data error for ${upperTicker}: ${data.message}`);
    }

    if (!data.values || data.values.length === 0) {
        return [];
    }

    const prices: PriceRow[] = data.values
        .map(v => ({
            ticker: upperTicker,
            date: v.datetime,
            adjClose: parseFloat(v.close),
        }))
        .filter(p => !isNaN(p.adjClose) && p.adjClose > 0)
        .reverse();

    priceCache.set(cacheKey, { data: prices, fetchedAt: Date.now() });
    return prices;
}

async function fetchMultipleTickerPrices(tickers: string[], endDate: string, days: number = 300): Promise<Map<string, PriceRow[]>> {
    const results = new Map<string, PriceRow[]>();

    for (const ticker of tickers) {
        try {
            const prices = await fetchTickerPrices(ticker, endDate, days);
            results.set(ticker.toUpperCase(), prices);
        } catch (err) {
            console.error(`Failed to fetch ${ticker}:`, err);
            results.set(ticker.toUpperCase(), []);
        }
    }

    return results;
}

// ============ RS COMPUTATION ============
const DEFAULT_BENCHMARKS = ['SPY', 'QQQ', 'SMH', 'PAVE', 'XBI', 'SETM'];

type RSSettings = {
    windowTradingDays: number;
    maTradingDays: number;
    minCoveragePct: number;
};

type BenchmarkResult = {
    benchmark: string;
    rsLevel: number | null;
    rsReturn: number | null;
    rsMA: number | null;
    rsVsMA: 'above' | 'below' | null;
    coveragePct: number;
    error: string | null;
};

type TargetResult = {
    ticker: string;
    asOfDate: string;
    benchmarks: BenchmarkResult[];
    error: string | null;
};

const DEFAULT_SETTINGS: RSSettings = {
    windowTradingDays: 252,
    maTradingDays: 50,
    minCoveragePct: 0.6,
};

function buildPriceLookup(prices: PriceRow[]): Map<string, number> {
    const lookup = new Map<string, number>();
    for (const p of prices) {
        if (p.adjClose > 0) lookup.set(p.date, p.adjClose);
    }
    return lookup;
}

function getAllDates(pricesByTicker: Map<string, PriceRow[]>): string[] {
    const dateSet = new Set<string>();
    for (const prices of pricesByTicker.values()) {
        for (const p of prices) dateSet.add(p.date);
    }
    return Array.from(dateSet).sort();
}

function movingAverage(values: number[], n: number): number | null {
    if (values.length < n) return null;
    const slice = values.slice(-n);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function computePairRS(
    targetLookup: Map<string, number>,
    benchLookup: Map<string, number>,
    windowDates: string[],
    lookbackDate: string,
    settings: RSSettings
): Omit<BenchmarkResult, 'benchmark'> {
    const rsSeries: { date: string; rsLevel: number }[] = [];

    for (const date of windowDates) {
        const pTarget = targetLookup.get(date);
        const pBench = benchLookup.get(date);
        if (pTarget && pBench && pBench > 0) {
            rsSeries.push({ date, rsLevel: pTarget / pBench });
        }
    }

    const coveragePct = windowDates.length > 0 ? rsSeries.length / windowDates.length : 0;

    if (coveragePct < settings.minCoveragePct || rsSeries.length < settings.maTradingDays) {
        return {
            rsLevel: null,
            rsReturn: null,
            rsMA: null,
            rsVsMA: null,
            coveragePct,
            error: `Insufficient data (${(coveragePct * 100).toFixed(0)}% coverage)`,
        };
    }

    const latest = rsSeries[rsSeries.length - 1];
    let lookbackRS = rsSeries[0];
    for (const row of rsSeries) {
        if (row.date <= lookbackDate) lookbackRS = row;
        else break;
    }

    const rsReturn = lookbackRS.rsLevel > 0 ? (latest.rsLevel / lookbackRS.rsLevel) - 1 : null;
    const rsLevels = rsSeries.map(r => r.rsLevel);
    const rsMA = movingAverage(rsLevels, settings.maTradingDays);
    const rsVsMA = rsMA !== null ? (latest.rsLevel > rsMA ? 'above' : 'below') : null;

    return { rsLevel: latest.rsLevel, rsReturn, rsMA, rsVsMA, coveragePct, error: null };
}

function computeRelativeStrength(
    targets: string[],
    benchmarks: string[],
    pricesByTicker: Map<string, PriceRow[]>,
    asOfDate: string,
    settings: Partial<RSSettings> = {}
) {
    const finalSettings: RSSettings = { ...DEFAULT_SETTINGS, ...settings };

    const lookups = new Map<string, Map<string, number>>();
    for (const [ticker, prices] of pricesByTicker) {
        lookups.set(ticker.toUpperCase(), buildPriceLookup(prices));
    }

    const allDates = getAllDates(pricesByTicker);
    const asOfIdx = allDates.findIndex(d => d === asOfDate);
    const effectiveAsOfIdx = asOfIdx !== -1 ? asOfIdx : allDates.length - 1;
    const effectiveAsOfDate = allDates[effectiveAsOfIdx] || asOfDate;

    const windowStartIdx = Math.max(0, effectiveAsOfIdx - finalSettings.windowTradingDays);
    const windowDates = allDates.slice(windowStartIdx, effectiveAsOfIdx + 1);
    const lookbackDate = allDates[windowStartIdx] || asOfDate;

    const results: TargetResult[] = [];

    for (const target of targets) {
        const targetUpper = target.toUpperCase();
        const targetLookup = lookups.get(targetUpper);

        if (!targetLookup || targetLookup.size === 0) {
            results.push({ ticker: targetUpper, asOfDate: effectiveAsOfDate, benchmarks: [], error: 'No price data' });
            continue;
        }

        const benchmarkResults: BenchmarkResult[] = [];

        for (const benchmark of benchmarks) {
            const benchUpper = benchmark.toUpperCase();
            const benchLookup = lookups.get(benchUpper);

            if (!benchLookup || benchLookup.size === 0) {
                benchmarkResults.push({ benchmark: benchUpper, rsLevel: null, rsReturn: null, rsMA: null, rsVsMA: null, coveragePct: 0, error: 'No benchmark data' });
                continue;
            }

            const pairResult = computePairRS(targetLookup, benchLookup, windowDates, lookbackDate, finalSettings);
            benchmarkResults.push({ benchmark: benchUpper, ...pairResult });
        }

        results.push({ ticker: targetUpper, asOfDate: effectiveAsOfDate, benchmarks: benchmarkResults, error: null });
    }

    return { asOfDate: effectiveAsOfDate, settings: finalSettings, results };
}

// ============ HANDLER ============
type RequestBody = {
    targets: string[];
    asOfDate?: string;
    benchmarks?: string[];
    settings?: Partial<RSSettings>;
};

function isValidDate(s: unknown): s is string {
    return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function getYesterdayISO(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

    try {
        const body = req.body as RequestBody;

        if (!Array.isArray(body.targets) || body.targets.length === 0) {
            return res.status(400).json({ error: 'Missing targets array' });
        }

        if (body.targets.length > 20) {
            return res.status(400).json({ error: 'Maximum 20 targets per request' });
        }

        const targets = body.targets.map(t => t.toUpperCase().trim()).filter(Boolean);
        const asOfDate = isValidDate(body.asOfDate) ? body.asOfDate : getYesterdayISO();
        const benchmarks = Array.isArray(body.benchmarks) && body.benchmarks.length > 0
            ? body.benchmarks.map(b => b.toUpperCase().trim())
            : [...DEFAULT_BENCHMARKS];

        const allTickers = [...new Set([...targets, ...benchmarks])];
        const pricesByTicker = await fetchMultipleTickerPrices(allTickers, asOfDate, 300);
        const result = computeRelativeStrength(targets, benchmarks, pricesByTicker, asOfDate, body.settings);

        return res.status(200).json(result);
    } catch (err: unknown) {
        console.error('RS API error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
}
