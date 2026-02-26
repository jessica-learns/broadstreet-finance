# Broadstreet — Investment Theme Intelligence Dashboard

A real-time equity analysis dashboard that pulls live financial data from the SEC EDGAR XBRL API and Twelve Data to help portfolio managers evaluate companies across concentrated investment themes.

**Live URL:** [https://broadstreet-finance.vercel.app](https://broadstreet-finance.vercel.app/)

**Repository:** [https://github.com/jessica-learns/broadstreet-finance](https://github.com/jessica-learns/broadstreet-finance.git)

---

## Purpose

Most financial tools are built for professionals. They assume fluency with complex dashboards, dense tables, and industry jargon. Broadstreet takes the opposite approach: it is designed for **older adults and non-specialist investors** who want to understand a stock's health without navigating the complexity of Bloomberg, Morningstar, or even Yahoo Finance.

When a user enters any U.S. public company ticker, the app pulls live data from two free, publicly available sources — SEC EDGAR (quarterly financial filings, provided at no cost by the U.S. government) and the Twelve Data free tier (daily market prices, 800 API credits/day at no charge) — and distills them into three straightforward questions:

1. **Is revenue going up or down?** Six quarters of revenue shown as a simple bar chart with growth rates as colored badges. No spreadsheet required.
2. **Are margins healthy or shrinking?** Gross, operating, and net margins plotted over time, with quarter-over-quarter changes so the user can see if the company is keeping more or less of each dollar earned.
3. **Is the stock beating the market?** One-year relative strength versus the S&P 500 and sector-specific ETFs. A simple outperforming/underperforming count replaces technical jargon.

The interface uses large fonts, high-contrast text, generous spacing, and a clean neumorphic design — intentionally optimized for readability and ease of use on screens of all sizes. All data is sourced exclusively from free, publicly available APIs. No paid data subscriptions are used.

## Target Audience

**Who:** Retired self-directed investors managing their own portfolios, parents and grandparents checking on their holdings, and older adults new to investing. These users are financially aware but do not specialize in technical analysis or sector-specific terminology.

**How they use it:** Type a ticker symbol. Within seconds, see whether revenue is growing, whether the company's margins are stable, and whether the stock is outperforming the broader market — all on a single screen with no tabs, no menus, and no configuration.

**Why Broadstreet over alternatives:** Professional terminals (Bloomberg, FactSet) cost $20,000+ per year and require training. Free tools like Yahoo Finance and Google Finance present dense tables and small text that are difficult to parse for users with low vision or limited technical comfort. Broadstreet is purpose-built for accessibility: large type, clean visuals, and only the three data points that matter most — revenue trajectory, margin health, and market-relative performance.

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
- **Twelve Data:** Free tier only (800 API credits/day, no paid subscription). API key stored as a Vercel environment variable, never exposed to the client.
- No proprietary, confidential, or NDA-protected data is used.

---

## License

Academic project — UNC Chapel Hill, Kenan-Flagler Business School, Spring 2026. Not endorsed by the university or any instructor. See in-app disclaimer for full terms.
