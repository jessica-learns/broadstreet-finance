// api/sec-proxy.ts
// Proxies SEC EDGAR requests to avoid CORS issues in production

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SEC_USER_AGENT = 'BroadstreetFinance Jessica_Croll@kenan-flagler.unc.edu';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET' });

    try {
        const { url } = req.query;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'Missing url parameter' });
        }

        // Only allow SEC domains
        if (!url.startsWith('https://www.sec.gov/') && !url.startsWith('https://data.sec.gov/')) {
            return res.status(400).json({ error: 'Only SEC URLs allowed' });
        }

        const secRes = await fetch(url, {
            headers: {
                'User-Agent': SEC_USER_AGENT,
                'Accept-Encoding': 'gzip, deflate',
            },
        });

        if (!secRes.ok) {
            return res.status(secRes.status).json({ error: `SEC returned ${secRes.status}` });
        }

        const contentType = secRes.headers.get('content-type') || 'application/json';
        const data = await secRes.text();

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
        return res.status(200).send(data);

    } catch (err: unknown) {
        console.error('SEC proxy error:', err);
        const message = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ error: message });
    }
}
