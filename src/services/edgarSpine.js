// Layer 1: Universe & Identity
const SEC_TICKER_URL = import.meta.env.DEV ? '/api/sec-files/files/company_tickers.json' : 'https://www.sec.gov/files/company_tickers.json';
const SEC_FACTS_URL = (cik) => import.meta.env.DEV ? `/api/sec/api/xbrl/companyfacts/CIK${cik}.json` : `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`;
const SEC_SUBMISSIONS_URL = (cik) => import.meta.env.DEV ? `/api/sec/submissions/CIK${cik}.json` : `https://data.sec.gov/submissions/CIK${cik}.json`;

const CONSTRAINT_KEYWORDS = [
    'shortage', 'backlog', 'capacity', 'supply chain', 'bottleneck'
];

// Helper: Rate Limiter
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Pad CIK to 10 digits
const padCik = (cik) => cik.toString().padStart(10, '0');

const cache = {
    tickerMap: null,
    tickerMapExpiry: 0,
    companyData: new Map(), // ticker -> { data, expiry }
};

const TICKER_MAP_TTL = 24 * 60 * 60 * 1000; // 24 hours
const COMPANY_DATA_TTL = 5 * 60 * 1000; // 5 minutes

// Layer 1: Fetch Ticker Map (CACHED)
async function fetchTickerMap() {
    if (cache.tickerMap && Date.now() < cache.tickerMapExpiry) {
        console.log("SEC: Using cached ticker map");
        return cache.tickerMap;
    }

    try {
        const response = await fetch(SEC_TICKER_URL);
        if (!response.ok) throw new Error("Ticker map fetch failed");
        const data = await response.json();
        const lookup = {};
        Object.values(data).forEach(company => {
            lookup[company.ticker] = padCik(company.cik_str);
        });

        cache.tickerMap = lookup;
        cache.tickerMapExpiry = Date.now() + TICKER_MAP_TTL;
        return lookup;
    } catch (error) {
        console.warn("Failed to fetch ticker map, using fallback for NVDA:", error);
        return { "NVDA": "0001045810", "AAPL": "0000320193", "TSLA": "0001318605" }; // Fallbacks
    }
}

// Layer 2: Fundamentals Normalizer
// Helper to identify Quarterly data (approx 90 days)
function isQuarterly(item) {
    if (!item.start || !item.end) return false;
    const start = new Date(item.start);
    const end = new Date(item.end);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    return diffDays >= 80 && diffDays <= 100; // Allow some slack for 13-week quarters
}

function extractMetric(facts, strategies, filterQuarterly = false) {
    const usGaap = facts.facts['us-gaap'];
    if (!usGaap) return [];

    // Prioritize tags
    for (const tag of strategies) {
        if (usGaap[tag] && usGaap[tag].units && usGaap[tag].units['USD']) {
            const units = usGaap[tag].units['USD'];

            let filtered = units;

            if (filterQuarterly) {
                // Precise filtration for quarterly table
                filtered = units.filter(u => u.form === '10-Q' || u.form === '10-K'); // Ensure standard forms
                filtered = filtered.filter(u => isQuarterly(u)); // Strict date check
            } else {
                // Fallback/Legacy for "Annual" snapshots if needed, but we prefer consistent filtered data
                filtered = units.filter(u => u.form === '10-K' || u.form === '10-Q');
            }

            // Deduplicate by end date (take the specific latest filed value)
            const map = new Map();
            filtered.forEach(item => {
                if (!map.has(item.end) || new Date(item.filed) > new Date(map.get(item.end).filed)) {
                    map.set(item.end, item);
                }
            });

            const deduped = Array.from(map.values());

            // Sort by end date descending (newest first)
            return deduped.sort((a, b) => new Date(b.end) - new Date(a.end));
        }
    }
    return [];
}

// Helper to get matching value
const matchMetric = (series, targetEnd) => series.find(item => item.end === targetEnd)?.val || 0;

// Main Spine Function
export async function getFinancialTruth(ticker) {
    // Check cache
    const cached = cache.companyData.get(ticker);
    if (cached && Date.now() < cached.expiry) {
        console.log(`SEC: Using cached data for ${ticker}`);
        return cached.data;
    }

    await delay(200); // Rate Limit

    // 1. Identity
    const tickerMap = await fetchTickerMap();
    if (!tickerMap || !tickerMap[ticker]) {
        throw new Error(`Ticker ${ticker} not found in SEC database.`);
    }
    const cik = tickerMap[ticker];

    // 2. Fetch Facts
    await delay(200);
    const factsRes = await fetch(SEC_FACTS_URL(cik));
    if (!factsRes.ok) throw new Error(`Failed to fetch facts for CIK ${cik}`);
    const factsData = await factsRes.json();

    // 3. Extract Metrics (QUARTERLY Mode)
    // Revenue Strategies
    const revenueSeries = extractMetric(factsData, [
        'Revenues',
        'SalesRevenueNet',
        'RevenueFromContractWithCustomerExcludingAssessedTax'
    ], true);

    // Operating Income
    const opIncomeSeries = extractMetric(factsData, ['OperatingIncomeLoss'], true);

    // Gross Profit
    const grossProfitSeries = extractMetric(factsData, [
        'GrossProfit',
        'GrossProfitOnSales', // Fallback
        'Revenues' // Absolute fallback if Gross not reported (rare, but banking differs) - Handled by logic below preferably, but sticking to explicit strategies
    ], true);

    // Net Income
    const netIncomeSeries = extractMetric(factsData, ['NetIncomeLoss'], true);

    // Capex (Usually cumulative in 10-K, difficult for Q calcs without YTD diffing. 
    // For simplicity in this prompt, we stick to the basic extraction but acknowledge Q-Capex is noisy in SEC data)
    // We will use the 'Annual' or broad filter for the "Intensity" check to remain stable
    const capexSeriesAnnual = extractMetric(factsData, ['PaymentsToAcquirePropertyPlantAndEquipment'], false);
    const revenueSeriesAnnual = extractMetric(factsData, [
        'Revenues',
        'SalesRevenueNet',
        'RevenueFromContractWithCustomerExcludingAssessedTax'
    ], false);

    if (revenueSeries.length === 0) {
        throw new Error("No quarterly revenue data found for this ticker.");
    }

    // --- LOGIC: CHART DATA (Last 6 Quarters) ---
    // User requested QoQ growth (Sequential) for non-seasonal sectors like Semi/Bio.
    const last10 = revenueSeries.slice(0, 11);
    const chartData = [];

    // Iterate backwards (oldest to newest in the slice) to build the chart
    // We want to generate chart points for indices 0..5 (the top 6 quarters).
    for (let i = 0; i < Math.min(6, last10.length); i++) {
        const r = last10[i];

        // QoQ Growth Calculation: Compare Q(t) with Q(t-1)
        const prevQ = last10[i + 1];

        const revVal = r.val;

        // Growth (QoQ)
        let growth = 0;
        if (prevQ && prevQ.val) {
            growth = (revVal - prevQ.val) / prevQ.val;
        }

        // Margins
        const opC = matchMetric(opIncomeSeries, r.end);
        const grossC = matchMetric(grossProfitSeries, r.end);
        const netC = matchMetric(netIncomeSeries, r.end);

        chartData.unshift({ // Add to front (so array is Oldest -> Newest)
            period: r.end.substring(0, 7), // YYYY-MM
            fullDate: r.end,
            revenue: revVal,
            growth: growth,
            grossMargin: revVal ? (grossC / revVal) : 0,
            opMargin: revVal ? (opC / revVal) : 0,
            netMargin: revVal ? (netC / revVal) : 0
        });
    }

    // New computed data
    const marginDeltas = chartData.slice(1).map((q, i) => {
        const prev = chartData[i];
        return {
            period: q.period,
            grossDelta: Math.round((q.grossMargin - prev.grossMargin) * 10000),
            opDelta: Math.round((q.opMargin - prev.opMargin) * 10000),
            netDelta: Math.round((q.netMargin - prev.netMargin) * 10000),
        };
    });

    const revenueGrowthData = chartData.map(q => ({
        period: q.period,
        growth: Math.round(q.growth * 1000) / 10,
    }));

    // Absolute revenue data (in billions for cleaner display)
    const revenueAbsoluteData = chartData.map(q => ({
        period: q.period,
        revenue: q.revenue / 1e9,  // Convert to billions
    }));

    // --- LOGIC: VERDICT (Uses Annual/LTM proxy for stability) ---
    // We use the most recent "Annual-like" or Quarterly snapshot for the gauge
    const latestRev = revenueSeriesAnnual[0]?.val || 0;
    const latestCapex = matchMetric(capexSeriesAnnual, revenueSeriesAnnual[0]?.end);

    // Intensity
    const capexIntensity = latestRev ? (latestCapex / latestRev) : 0;

    // Trend
    // Trend: Capex Intensity (QoQ Comparison)
    // User requested sequential comparison for non-seasonal sectors.
    let isRisingCapex = false;

    if (revenueSeries.length > 1) {
        const currentQ = revenueSeries[0];
        const prevQ = revenueSeries[1]; // Sequential previous quarter

        const currentRev = currentQ.val;
        const prevRev = prevQ.val;

        if (currentRev > 0 && prevRev > 0) {
            const currentCap = matchMetric(capexSeriesAnnual, currentQ.end); // Use best available capex match
            const prevCap = matchMetric(capexSeriesAnnual, prevQ.end);

            const currentInt = currentCap / currentRev;
            const prevInt = prevCap / prevRev;

            // Logic: Is Intensity Rising? (e.g. 10% -> 12%)
            // We use a 5% threshold for "Rising" tag
            if (currentInt > prevInt * 1.05) {
                isRisingCapex = true;
            }
        }
    }

    // Layer 3: Evidence Harvester (10-K Scan)
    await delay(200);
    const subRes = await fetch(SEC_SUBMISSIONS_URL(cik));
    if (!subRes.ok) throw new Error("Failed to fetch submissions.");
    const subData = await subRes.json();

    const recentFilings = subData.filings.recent;
    const form10kIndex = recentFilings.form.indexOf('10-K');

    let keywordCount = 0;
    let sentiment = "Neutral";
    let businessDescription = '';

    if (form10kIndex !== -1) {
        const accessionNumber = recentFilings.accessionNumber[form10kIndex].replace(/-/g, '');
        const primaryDocument = recentFilings.primaryDocument[form10kIndex];
        const unpaddedCik = parseInt(cik).toString();
        const docUrl = `/api/sec-files/Archives/edgar/data/${unpaddedCik}/${accessionNumber}/${primaryDocument}`;

        try {
            await delay(200);
            const docRes = await fetch(docUrl);
            if (docRes.ok) {
                const docText = await docRes.text();
                const lowerText = docText.toLowerCase();
                CONSTRAINT_KEYWORDS.forEach(word => {
                    const regex = new RegExp(word, 'g');
                    const matches = lowerText.match(regex);
                    if (matches) keywordCount += matches.length;
                });

                // Extract business description from Item 1
                if (docText) {
                    // Step 1: Clean HTML thoroughly
                    let text = docText
                        .replace(/&#\d+;/g, ' ')           // Numeric HTML entities (&#160; etc)
                        .replace(/&nbsp;/g, ' ')            // Non-breaking spaces
                        .replace(/&amp;/g, '&')             // Ampersands
                        .replace(/&[a-z]+;/gi, ' ')         // Other named entities
                        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')  // Remove style blocks
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script blocks
                        .replace(/<[^>]*>/g, ' ')           // Remove all HTML tags
                        .replace(/\s+/g, ' ')               // Normalize whitespace
                        .trim();

                    // Step 2: Find the ACTUAL Item 1 Business section (not table of contents)
                    // TOC entries look like: "Item 1. Business    13"
                    // Real section looks like: "Item 1. Business [paragraph of text]"

                    // Split on "Item 1" variations and find the one with substantial content
                    const sections = text.split(/item\s*1[.\s]+business/i);

                    let bestSnippet = '';

                    for (let i = 1; i < sections.length; i++) {
                        const section = sections[i].trim();

                        // Skip if this looks like TOC (starts with numbers or "Item 1A" within 50 chars)
                        const first50 = section.slice(0, 50);
                        if (/^\s*\d{1,3}\s/.test(first50)) continue;  // Starts with page number
                        if (/item\s*1[a-c]/i.test(first50)) continue; // TOC listing

                        // Get text until next Item section
                        const nextItemMatch = section.search(/item\s*1[a-c]|item\s*2/i);
                        const sectionText = nextItemMatch > 0
                            ? section.slice(0, nextItemMatch)
                            : section.slice(0, 2000);

                        // Look for a real sentence (starts with capital, has verb patterns)
                        const sentences = sectionText.match(/[A-Z][^.!?]{30,}[.!?]/g);

                        if (sentences && sentences.length > 0) {
                            // Collect multiple valid sentences up to ~600 chars
                            const collectedSentences = [];
                            let totalLength = 0;

                            for (const sentence of sentences) {
                                const lower = sentence.toLowerCase();

                                // Skip boilerplate sentences
                                if (lower.includes('table of contents')) continue;
                                if (lower.includes('page intentionally')) continue;
                                if (lower.includes('see item')) continue;
                                if (lower.includes('form 10-k')) continue;
                                if (lower.includes('annual report')) continue;
                                if (/^\s*\d/.test(sentence)) continue;
                                if (sentence.length < 40) continue;

                                // Add sentence if we have room
                                if (totalLength + sentence.length < 1200) {
                                    collectedSentences.push(sentence);
                                    totalLength += sentence.length + 1;
                                }

                                // Stop after collecting enough
                                if (totalLength > 1000) break;
                            }

                            if (collectedSentences.length > 0) {
                                bestSnippet = collectedSentences.join(' ');
                            }
                        }

                        if (bestSnippet) break;
                    }

                    // Step 3: Fallback - search entire doc for company description patterns
                    if (!bestSnippet || bestSnippet.length < 50) {
                        const companyPatterns = [
                            /NVIDIA[^.]*is\s+a[n]?\s+[^.]{30,200}\./i,
                            /(?:the\s+)?company\s+(?:is|was)\s+[^.]{30,200}\./i,
                            /we\s+are\s+a[n]?\s+[^.]{30,200}\./i,
                            /(?:designs?|develops?|manufactures?|provides?)\s+[^.]{30,150}(?:products?|solutions?|services?|platforms?)[^.]*\./i
                        ];

                        for (const pattern of companyPatterns) {
                            const match = text.match(pattern);
                            if (match && match[0].length > 50) {
                                bestSnippet = match[0];
                                break;
                            }
                        }
                    }

                    // Step 4: Final cleanup and truncation
                    if (bestSnippet) {
                        bestSnippet = bestSnippet.replace(/\s+/g, ' ').trim();
                        businessDescription = bestSnippet.length > 1000
                            ? bestSnippet.slice(0, 997) + '...'
                            : bestSnippet;
                    }
                }
            }
        } catch (e) {
            console.warn("Failed to fetch/parse 10-K text", e);
        }
    }

    if (keywordCount > 5) {
        if (isRisingCapex) sentiment = "Fixing It (High Conviction)";
        else sentiment = "Low Conviction";
    } else {
        if (capexIntensity > 0.15) sentiment = "Capital Intensive";
        else sentiment = "Steady State";
    }

    // Return final structure
    const result = {
        ticker,
        metrics: {
            capexIntensity,
            operatingMargin: chartData[chartData.length - 1]?.opMargin || 0,
            revenue: chartData[chartData.length - 1]?.revenue || 0,
            grossMargin: chartData[chartData.length - 1]?.grossMargin || 0,
            netMargin: chartData[chartData.length - 1]?.netMargin || 0,
        },
        evidence: {
            keywordCount,
            latest10K: form10kIndex !== -1,
            sentiment,
            isRisingCapex,
            businessDescription,
        },
        chartData,
        marginDeltas,
        revenueGrowthData,
        revenueAbsoluteData,
        fetchedAt: Date.now(),
    };

    // Cache before returning
    cache.companyData.set(ticker, { data: result, expiry: Date.now() + COMPANY_DATA_TTL });

    return result;
}

export function invalidateCache(ticker = null) {
    if (ticker) {
        cache.companyData.delete(ticker);
    } else {
        cache.companyData.clear();
    }
}

export function getCacheStatus() {
    return {
        tickerMapCached: !!cache.tickerMap,
        cachedTickers: Array.from(cache.companyData.keys()),
    };
}
