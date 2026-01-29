// src/services/relativeStrength.js
// Client-side service to call the relative strength API

// When using `vercel dev`, API routes are on the same origin
export const DEFAULT_BENCHMARKS = ['SPY', 'QQQ', 'SMH', 'PAVE', 'XBI', 'SETM'];

/**
 * Fetch relative strength data for one or more tickers
 * @param {string[]} targets - Array of ticker symbols
 * @param {Object} options - Optional settings
 * @param {string} options.asOfDate - Date in YYYY-MM-DD format (defaults to today)
 * @param {string[]} options.benchmarks - Override default benchmarks
 * @returns {Promise<Object>} Relative strength results
 */
export async function getRelativeStrength(targets, options = {}) {
    const { asOfDate, benchmarks } = options;

    const payload = {
        targets: Array.isArray(targets) ? targets : [targets],
    };

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

    return res.json();
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
