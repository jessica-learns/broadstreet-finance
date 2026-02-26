# Broadstreet — Investment Theme Intelligence Dashboard

A real-time equity analysis dashboard that pulls live financial data from the SEC EDGAR XBRL API and Twelve Data to help portfolio managers evaluate companies across concentrated investment themes.

**Live URL:** [https://broadstreet-finance.vercel.app](https://broadstreet-finance.vercel.app/)

**Repository:** [https://github.com/jessica-learns/broadstreet-finance](https://github.com/jessica-learns/broadstreet-finance.git)

---

## Purpose

Broadstreet is built for an equity portfolio manager running a concentrated, theme-driven sleeve. Rather than tracking broad benchmarks, it focuses on identifying structurally constrained opportunities — semiconductors, energy infrastructure, biotech — where timing is uncertain but payoff asymmetry is large.

The dashboard answers three questions in real-time:

1. **Is the company growing?** Quarterly revenue trajectory, growth rates, and margin structure pulled directly from SEC filings.
2. **Is the stock outperforming its peers?** 252-day relative strength versus sector-specific benchmarks (S&P 500, Nasdaq, and sector ETFs).
3. **Are there supply-chain constraints or capex signals?** Keyword scanning of 10-K filings for bottleneck indicators, combined with capex intensity analysis.

---

## Architecture

```
Vercel (Deployment)
├── React + Vite Frontend
│   ├── TickerInput        → triggers data fetch
│   ├── GrowthAnalysis     → 4 Recharts panels (revenue, growth, margins, margin change)
│   ├── FinancialTruthCard → hero metrics, sentiment, business description
│   ├── MomentumCard       → relative strength vs. benchmarks
│   ├── Leaderboard, TopMovers, RiskRadar, EvidenceFeed (demo data)
│   └── Disclaimer         → required terms of use
│
├── Vercel Serverless Functions
│   ├── /api/sec-proxy           → CORS proxy to SEC EDGAR
│   └── /api/relative-strength   → Twelve Data prices → RS computation
│
└── External APIs
    ├── SEC EDGAR XBRL  (public, free, no key)
    └── Twelve Data     (API key, free tier)
```

### Real-Time Data Flow

1. User enters a ticker → `DashboardContext` calls `getFinancialTruth()`
2. **SEC EDGAR pipeline** (`edgarSpine.js`): resolves ticker to CIK, fetches XBRL company facts, extracts quarterly metrics (revenue, margins, capex), parses 10-K text for constraint keywords, extracts Item 1 business description
3. **Relative strength pipeline** (`relativeStrength.js` → `/api/relative-strength`): fetches 252 days of prices for the stock and sector benchmarks, computes RS ratio and 50-day moving average
4. Frontend renders charts, metrics, and signals

### Caching

| Layer | TTL | Purpose |
|-------|-----|---------|
| Ticker map (CIK lookup) | 24 hours | Rarely changes |
| Company XBRL data | 5 minutes | Freshness vs. SEC rate limits |
| Price data (server) | 6 hours | Twelve Data quota management |
| RS results (browser) | 10 minutes | Avoid redundant API calls |

---

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 3, Recharts 3, Lucide React
- **Backend:** Vercel Serverless Functions (TypeScript)
- **Data:** SEC EDGAR XBRL API, Twelve Data API
- **Design:** Custom neumorphic design system

---

## Installation

### Prerequisites

- Node.js 18+
- A free [Twelve Data](https://twelvedata.com/) API key

### Setup

```bash
git clone https://github.com/jessica-learns/broadstreet-finance.git
cd broadstreet-finance
npm install
echo "TWELVE_DATA_API_KEY=your_key_here" > .env
npm run dev
```

The app runs at `http://localhost:5173`. In development, Vite proxies SEC requests directly. In production on Vercel, the `/api/sec-proxy` serverless function handles CORS.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
vercel env add TWELVE_DATA_API_KEY
vercel --prod
```

---

## Project Structure

```
broadstreet-finance/
├── api/
│   ├── relative-strength.ts       # RS computation endpoint
│   ├── sec-proxy.ts               # CORS proxy for SEC EDGAR
│   ├── _lib/computeRelativeStrength.ts
│   └── _providers/twelveData.ts
├── src/
│   ├── App.jsx                    # Main layout
│   ├── context/DashboardContext.jsx
│   ├── services/
│   │   ├── edgarSpine.js          # SEC EDGAR data pipeline
│   │   └── relativeStrength.js    # RS client service
│   ├── components/
│   │   ├── TickerInput.jsx        # Stock search
│   │   ├── GrowthAnalysis.jsx     # 4-panel chart grid
│   │   ├── FinancialTruthCard.jsx # Hero metrics
│   │   ├── MomentumCard.jsx       # Relative strength
│   │   ├── Leaderboard.jsx        # Theme rankings (demo)
│   │   ├── TopMovers.jsx          # 24h movers (demo)
│   │   ├── RiskRadar.jsx          # Risk indicators (demo)
│   │   ├── EvidenceFeed.jsx       # Evidence feed (demo)
│   │   ├── Header.jsx
│   │   ├── Disclaimer.jsx         # Required terms
│   │   └── ui/                    # Card, Badge, Button
│   └── lib/utils.js
├── tailwind.config.js
├── vite.config.js
├── vercel.json
└── package.json
```

### Live vs. Demo Components

| Component | Data Source | Status |
|-----------|-----------|--------|
| TickerInput | User input | ✅ Live |
| GrowthAnalysis (4 charts) | SEC EDGAR XBRL | ✅ Live |
| FinancialTruthCard | SEC EDGAR XBRL + 10-K | ✅ Live |
| MomentumCard | Twelve Data → RS API | ✅ Live |
| ThemeLeaderboard | Static demo data | ⚠️ Demo |
| TopMovers | Static demo data | ⚠️ Demo |
| RiskRadar | Static demo data | ⚠️ Demo |
| EvidenceFeed | Static demo data | ⚠️ Demo |

---

## Data Sources & Compliance

- **SEC EDGAR:** Public API, no key required. Rate-limited per SEC guidelines. User-Agent header identifies the app per SEC policy.
- **Twelve Data:** Free tier (800 credits/day). API key stored as a Vercel environment variable, never exposed to the client.
- No proprietary, confidential, or NDA-protected data is used.

---

## License

Academic project — UNC Chapel Hill, Kenan-Flagler Business School, Spring 2026. Not endorsed by the university or any instructor. See in-app disclaimer for full terms.
