// api/relative-strength.ts
// Vercel Serverless Function
// POST /api/relative-strength
// Body: { targets: ["NVDA"], asOfDate?: "2025-01-27", benchmarks?: ["SPY"] }

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchMultipleTickerPrices } from './_providers/twelveData';
import { computeRelativeStrength, DEFAULT_BENCHMARKS } from './_lib/computeRelativeStrength';

type RequestBody = {
    targets: string[];
    asOfDate?: string;
    benchmarks?: string[];
    settings?: {
        windowTradingDays?: number;
        maTradingDays?: number;
        minCoveragePct?: number;
    };
};

function isValidDate(s: unknown): s is string {
    return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function getTodayISO(): string {
    return new Date().toISOString().split('T')[0];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Use POST' });
    }

    try {
        const body = req.body as RequestBody;

        if (!Array.isArray(body.targets) || body.targets.length === 0) {
            return res.status(400).json({ error: 'Missing or empty targets array' });
        }

        if (body.targets.length > 20) {
            return res.status(400).json({ error: 'Maximum 20 targets per request' });
        }

        const targets = body.targets.map(t => t.toUpperCase().trim()).filter(Boolean);
        const asOfDate = isValidDate(body.asOfDate) ? body.asOfDate : getTodayISO();

        const benchmarks = Array.isArray(body.benchmarks) && body.benchmarks.length > 0
            ? body.benchmarks.map(b => b.toUpperCase().trim())
            : [...DEFAULT_BENCHMARKS];

        const allTickers = [...new Set([...targets, ...benchmarks])];

        console.log(`Fetching prices for ${allTickers.length} tickers, asOfDate: ${asOfDate}`);
        const pricesByTicker = await fetchMultipleTickerPrices(allTickers, asOfDate, 300);

        const result = computeRelativeStrength(
            targets,
            benchmarks,
            pricesByTicker,
            asOfDate,
            body.settings
        );

        return res.status(200).json(result);

    } catch (err: unknown) {
        console.error('Relative strength API error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
}
