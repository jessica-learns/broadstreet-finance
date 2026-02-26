import React from 'react';
import { DashboardProvider } from './context/DashboardContext';
import { Header } from './components/Header';
import { ThemeLeaderboard } from './components/Leaderboard';
import { TopMovers } from './components/TopMovers';
import { GrowthAnalysis } from './components/GrowthAnalysis';
import { FinancialTruthCard } from './components/FinancialTruthCard';
import { DeepDive } from './components/DeepDive';
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
          <div className="space-y-10">

            {/* Growth Analysis Section - Ticker Input + 2x2 Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Ticker Input - Takes 1 column, spans 2 rows */}
              <div className="lg:row-span-2">
                <TickerInput />
              </div>

              {/* Charts - 2x2 grid taking 4 columns */}
              <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <GrowthAnalysis />
              </div>
            </div>

            {/* Main Content Section - Relative Strength + NVDA Deep Dive */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <MomentumCard />
              </div>
              <div className="lg:col-span-8">
                <FinancialTruthCard />
              </div>
            </div>

            {/* Bottom Section - Hardcoded / Placeholder Components */}
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
          <Disclaimer />
        </div>
      </div>
    </DashboardProvider>
  );
}

export default App;
