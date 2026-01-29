// api/_lib/computeRelativeStrength.ts
// Computes relative strength metrics for targets vs benchmarks

import type { PriceRow } from '../_providers/twelveData';

export const DEFAULT_BENCHMARKS = ['SPY', 'QQQ', 'SMH', 'PAVE', 'XBI', 'SETM'] as const;

export type RSSettings = {
    windowTradingDays: number;
    maTradingDays: number;
    minCoveragePct: number;
};

export type BenchmarkResult = {
    benchmark: string;
    rsLevel: number | null;
    rsReturn: number | null;
    rsMA: number | null;
    rsVsMA: 'above' | 'below' | null;
    coveragePct: number;
    error: string | null;
};

export type TargetResult = {
    ticker: string;
    asOfDate: string;
    benchmarks: BenchmarkResult[];
    error: string | null;
};

export type RSOutput = {
    asOfDate: string;
    settings: RSSettings;
    results: TargetResult[];
};

const DEFAULT_SETTINGS: RSSettings = {
    windowTradingDays: 252,
    maTradingDays: 50,
    minCoveragePct: 0.6,
};

function buildPriceLookup(prices: PriceRow[]): Map<string, number> {
    const lookup = new Map<string, number>();
    for (const p of prices) {
        if (p.adjClose > 0) {
            lookup.set(p.date, p.adjClose);
        }
    }
    return lookup;
}

function getAllDates(pricesByTicker: Map<string, PriceRow[]>): string[] {
    const dateSet = new Set<string>();
    for (const prices of pricesByTicker.values()) {
        for (const p of prices) {
            dateSet.add(p.date);
        }
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
            rsSeries.push({
                date,
                rsLevel: pTarget / pBench,
            });
        }
    }

    const coveragePct = windowDates.length > 0
        ? rsSeries.length / windowDates.length
        : 0;

    if (coveragePct < settings.minCoveragePct || rsSeries.length < settings.maTradingDays) {
        return {
            rsLevel: null,
            rsReturn: null,
            rsMA: null,
            rsVsMA: null,
            coveragePct,
            error: `Insufficient data overlap (${(coveragePct * 100).toFixed(0)}% coverage)`,
        };
    }

    const latest = rsSeries[rsSeries.length - 1];

    let lookbackRS = rsSeries[0];
    for (const row of rsSeries) {
        if (row.date <= lookbackDate) {
            lookbackRS = row;
        } else {
            break;
        }
    }

    const rsReturn = lookbackRS.rsLevel > 0
        ? (latest.rsLevel / lookbackRS.rsLevel) - 1
        : null;

    const rsLevels = rsSeries.map(r => r.rsLevel);
    const rsMA = movingAverage(rsLevels, settings.maTradingDays);

    const rsVsMA = rsMA !== null
        ? (latest.rsLevel > rsMA ? 'above' : 'below')
        : null;

    return {
        rsLevel: latest.rsLevel,
        rsReturn,
        rsMA,
        rsVsMA,
        coveragePct,
        error: null,
    };
}

export function computeRelativeStrength(
    targets: string[],
    benchmarks: string[],
    pricesByTicker: Map<string, PriceRow[]>,
    asOfDate: string,
    settings: Partial<RSSettings> = {}
): RSOutput {
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
            results.push({
                ticker: targetUpper,
                asOfDate: effectiveAsOfDate,
                benchmarks: [],
                error: 'No price data for target',
            });
            continue;
        }

        const benchmarkResults: BenchmarkResult[] = [];

        for (const benchmark of benchmarks) {
            const benchUpper = benchmark.toUpperCase();
            const benchLookup = lookups.get(benchUpper);

            if (!benchLookup || benchLookup.size === 0) {
                benchmarkResults.push({
                    benchmark: benchUpper,
                    rsLevel: null,
                    rsReturn: null,
                    rsMA: null,
                    rsVsMA: null,
                    coveragePct: 0,
                    error: 'No price data for benchmark',
                });
                continue;
            }

            const pairResult = computePairRS(
                targetLookup,
                benchLookup,
                windowDates,
                lookbackDate,
                finalSettings
            );

            benchmarkResults.push({
                benchmark: benchUpper,
                ...pairResult,
            });
        }

        results.push({
            ticker: targetUpper,
            asOfDate: effectiveAsOfDate,
            benchmarks: benchmarkResults,
            error: null,
        });
    }

    return {
        asOfDate: effectiveAsOfDate,
        settings: finalSettings,
        results,
    };
}
