import React from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { Header } from './components/Header';
import { ThemeLeaderboard } from './components/Leaderboard';
import { TopMovers } from './components/TopMovers';
import { GrowthAnalysis } from './components/GrowthAnalysis';
import { FinancialTruthCard } from './components/FinancialTruthCard';
import { RiskRadar } from './components/RiskRadar';
import { EvidenceFeed } from './components/EvidenceFeed';
import { TickerInput } from './components/TickerInput';
import { MomentumCard } from './components/MomentumCard';
import { Disclaimer } from './components/Disclaimer';

function App() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background p-8 md:p-12 font-sans selection:bg-accent/30">
        <div className="max-w-[1400px] mx-auto">
          <Header />
          <div className="space-y-8">
            {/* Main Dashboard: Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Ticker Input + Relative Strength */}
              <div className="lg:col-span-4 lg:sticky lg:top-6 flex flex-col gap-6">
                <TickerInput />
                <MomentumCard />
              </div>

              {/* Right Column: Charts + Financial Truth */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {/* 2x2 Chart Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GrowthAnalysis />
                </div>

                {/* Financial Truth Card - full width of right column */}
                <FinancialTruthCard />
              </div>
            </div>

            {/* Demo Section - Visually Separated */}
            <div className="mt-16 pt-8 border-t-2 border-dashed border-secondary/20">
              <p className="text-center text-sm font-bold text-secondary/40 uppercase tracking-widest mb-8">
                Example Components — Planned Features Requiring Licensed Data
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4 flex flex-col gap-8">
                  <ThemeLeaderboard />
                  <TopMovers />
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <RiskRadar />
                  <EvidenceFeed />
                </div>
              </div>
            </div>
          </div>
          <Disclaimer />
        </div>
      </div>
    </DashboardProvider>
  );
}

export default App;
