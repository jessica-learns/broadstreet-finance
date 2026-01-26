// Layer 1: Universe & Identity
const SEC_TICKER_URL = '/api/sec-files/company_tickers.json';
const SEC_FACTS_URL = (cik) => `/api/sec/CIK${cik}/companyfacts.json`;
const SEC_SUBMISSIONS_URL = (cik) => `/api/sec/CIK${cik}/submissions.json`;

const CONSTRAINT_KEYWORDS = [
    'shortage', 'backlog', 'capacity', 'supply chain', 'bottleneck'
];

// Helper: Rate Limiter
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Pad CIK to 10 digits
const padCik = (cik) => cik.toString().padStart(10, '0');

// Layer 1: Fetch Ticker Map
async function fetchTickerMap() {
    try {
        const response = await fetch(SEC_TICKER_URL);
        const data = await response.json();
        // transform {0: {cik_str, ticker, title}, ...} to {TICKER: cik}
        const lookup = {};
        Object.values(data).forEach(company => {
            lookup[company.ticker] = padCik(company.cik_str);
        });
        return lookup;
    } catch (error) {
        console.error("Failed to fetch ticker map:", error);
        return null;
    }
}

// Layer 2: Fundamentals Normalizer
function extractMetric(facts, taxonomy, strategies) {
    // Try US-GAAP strategies first
    const usGaap = facts.facts['us-gaap'];
    if (!usGaap) return [];

    for (const tag of strategies) {
        if (usGaap[tag]) {
            // Get annual data (10-K) or quarterly (10-Q)
            // Filter for 'USD' units and most recent
            const units = usGaap[tag].units['USD'];
            if (!units) continue;

            // Sort by end date descending
            return units.sort((a, b) => new Date(b.end) - new Date(a.end));
        }
    }
    return [];
}

function getLatestValue(series) {
    if (!series || series.length === 0) return 0;
    // filtered for 10-K/10-Q usually prefer "10-K" for annual comparison or just latest
    // For this prototype, pick the absolute latest record
    return series[0].val;
}

// Main Spine Function
export async function getFinancialTruth(ticker) {
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
    const factsData = await factsRes.json();

    // 3. Extract Metrics
    // Revenue Strategies
    const revenueSeries = extractMetric(factsData, 'us-gaap', [
        'Revenues',
        'SalesRevenueNet',
        'RevenueFromContractWithCustomerExcludingAssessedTax'
    ]);

    // Operating Income Strategies
    const opIncomeSeries = extractMetric(factsData, 'us-gaap', ['OperatingIncomeLoss']);

    // Capex Strategies
    const capexSeries = extractMetric(factsData, 'us-gaap', ['PaymentsToAcquirePropertyPlantAndEquipment']);

    // R&D Strategies
    const rndSeries = extractMetric(factsData, 'us-gaap', ['ResearchAndDevelopmentExpense']);

    // Compute Latest Snapshot
    const revenue = getLatestValue(revenueSeries);
    const opIncome = getLatestValue(opIncomeSeries);
    const capex = getLatestValue(capexSeries);
    const rnd = getLatestValue(rndSeries);

    const metrics = {
        capexIntensity: revenue ? (capex / revenue) : 0,
        rndIntensity: revenue ? (rnd / revenue) : 0,
        operatingMargin: revenue ? (opIncome / revenue) : 0,
        revenue,
        opIncome
    };

    // Layer 3: Evidence Harvester (10-K Scan)
    await delay(200);
    const subRes = await fetch(SEC_SUBMISSIONS_URL(cik));
    const subData = await subRes.json();

    // Find latest 10-K
    const recentFilings = subData.filings.recent;
    const form10kIndex = recentFilings.form.indexOf('10-K');

    let keywordCount = 0;
    let sentiment = "Neutral";
    let isRisingCapex = false; // TODO: Compare vs previous year

    if (form10kIndex !== -1) {
        const accessionNumber = recentFilings.accessionNumber[form10kIndex].replace(/-/g, '');
        const primaryDocument = recentFilings.primaryDocument[form10kIndex];

        // Construct detailed URL for the document (requires proxy to sec.gov archives)
        // Proxy route: /api/sec-files/Archives/edgar/data/{cik}/{accession}/{primaryDocument}
        // Note: CIK in URL must not be padded for directories usually, but lets match standard pattern.
        // Actually SEC archives use unpadded CIK in path.
        const unpaddedCik = parseInt(cik).toString();
        const docUrl = `/api/sec-files/Archives/edgar/data/${unpaddedCik}/${accessionNumber}/${primaryDocument}`;

        try {
            await delay(200);
            const docRes = await fetch(docUrl);
            const docText = await docRes.text();

            // Simple count
            const lowerText = docText.toLowerCase();
            CONSTRAINT_KEYWORDS.forEach(word => {
                const regex = new RegExp(word, 'g');
                const matches = lowerText.match(regex);
                if (matches) keywordCount += matches.length;
            });

        } catch (e) {
            console.warn("Failed to fetch/parse 10-K text", e);
        }
    }

    // Determine Verdict
    // Simple logic: If Capex Intensity > 0.05 (5%) it's "High" (Arbitrary for prototype)
    // Or comparing series history. For now, use the derived flag.
    // Logic: Constraint Keywords > 5 AND Capex Intensity > 0.10 => Fixing It

    if (keywordCount > 5) {
        if (metrics.capexIntensity > 0.07) { // 7% threshold
            sentiment = "Fixing It (High Conviction)";
        } else {
            sentiment = "All Talk (Low Conviction)";
        }
    } else {
        sentiment = "No Constraints Detected";
    }

    return {
        ticker,
        metrics,
        evidence: {
            keywordCount,
            latest10K: form10kIndex !== -1,
            sentiment
        },
        chartData: revenueSeries.slice(0, 5).map(r => ({
            year: r.end.substring(0, 4),
            revenue: r.val,
            margin: 0 // Placeholder, requires joining opIncome by date
        })).reverse() // Show oldest to newest
    };
}
