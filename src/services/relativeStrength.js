// src/services/relativeStrength.js
// Client-side service to call the relative strength API

export const DEFAULT_BENCHMARKS = ['SPY', 'QQQ', 'SMH', 'PAVE', 'XBI', 'SETM'];

// Browser-side cache (persists for session)
const rsCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch relative strength data for one or more tickers
 */
export async function getRelativeStrength(targets, options = {}) {
    const { asOfDate, benchmarks } = options;
    const targetArray = Array.isArray(targets) ? targets : [targets];
    const cacheKey = targetArray.join(',');

    // Check browser cache first
    const cached = rsCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
        console.log('RS: Using cached data for', cacheKey);
        return cached.data;
    }

    const payload = { targets: targetArray };
    if (asOfDate) payload.asOfDate = asOfDate;
    if (benchmarks) payload.benchmarks = benchmarks;

    const res = await fetch('/api/relative-strength', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error.error || `API error: ${res.status}`);
    }

    const data = await res.json();

    // Cache the result
    rsCache.set(cacheKey, { data, fetchedAt: Date.now() });

    return data;
}

/**
 * Format RS return as percentage string with sign
 */
export function formatRSReturn(value) {
    if (value === null || value === undefined) return '—';
    const pct = (value * 100).toFixed(1);
    return value >= 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Format RS level as ratio
 */
export function formatRSLevel(value) {
    if (value === null || value === undefined) return '—';
    return value.toFixed(3);
}

/**
 * Determine if RS is bullish (outperforming and above MA)
 */
export function getRSSignal(benchmarkResult) {
    if (!benchmarkResult || benchmarkResult.error) return 'neutral';

    const { rsReturn, rsVsMA } = benchmarkResult;

    if (rsReturn === null) return 'neutral';

    if (rsReturn > 0.05 && rsVsMA === 'above') return 'strong';
    if (rsReturn > 0 || rsVsMA === 'above') return 'bullish';
    if (rsReturn < -0.05 && rsVsMA === 'below') return 'weak';
    if (rsReturn < 0) return 'bearish';

    return 'neutral';
}
