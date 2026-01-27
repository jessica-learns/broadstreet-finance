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

function App() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background p-6 md:p-10 font-sans selection:bg-accent/30">
        <div className="max-w-[1400px] mx-auto">
          <Header />
          <div className="space-y-8">
            {/* Growth Analysis Section - Full Width */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <TickerInput />
              <div className="lg:col-span-3">
                <GrowthAnalysis />
              </div>
            </div>

            {/* Main Content Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 flex flex-col gap-8">
                <ThemeLeaderboard />
                <TopMovers />
              </div>
              <div className="lg:col-span-8">
                <FinancialTruthCard />
              </div>
            </div>

            {/* Lower Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4">
                <DeepDive />
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <RiskRadar />
                <EvidenceFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
}

export default App;
