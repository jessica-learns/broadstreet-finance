// api/_providers/twelveData.ts
// Fetches adjusted close prices from Twelve Data API

const TWELVE_DATA_BASE = 'https://api.twelvedata.com';

export type PriceRow = {
    ticker: string;
    date: string;
    adjClose: number;
};

type TwelveDataValue = {
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
};

type TwelveDataResponse = {
    meta?: { symbol: string };
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

export async function fetchTickerPrices(
    ticker: string,
    endDate: string,
    days: number = 300
): Promise<PriceRow[]> {
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    if (!apiKey) {
        throw new Error('TWELVE_DATA_API_KEY environment variable not set');
    }

    const cacheKey = `${ticker}:${endDate}`;
    const cached = priceCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        return cached.data;
    }

    const url = new URL(`${TWELVE_DATA_BASE}/time_series`);
    url.searchParams.set('symbol', ticker);
    url.searchParams.set('interval', '1day');
    url.searchParams.set('outputsize', days.toString());
    url.searchParams.set('end_date', endDate);
    url.searchParams.set('apikey', apiKey);

    const res = await rateLimitedFetch(url.toString());

    if (!res.ok) {
        throw new Error(`Twelve Data API error: ${res.status} ${res.statusText}`);
    }

    const data: TwelveDataResponse = await res.json();

    if (data.status === 'error') {
        throw new Error(`Twelve Data error for ${ticker}: ${data.message}`);
    }

    if (!data.values || data.values.length === 0) {
        return [];
    }

    const prices: PriceRow[] = data.values
        .map(v => ({
            ticker: ticker.toUpperCase(),
            date: v.datetime,
            adjClose: parseFloat(v.close),
        }))
        .filter(p => !isNaN(p.adjClose) && p.adjClose > 0)
        .reverse();

    priceCache.set(cacheKey, { data: prices, fetchedAt: Date.now() });

    return prices;
}

export async function fetchMultipleTickerPrices(
    tickers: string[],
    endDate: string,
    days: number = 300
): Promise<Map<string, PriceRow[]>> {
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

export function clearPriceCache(): void {
    priceCache.clear();
}
