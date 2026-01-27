import React from 'react';
import { Header } from './components/Header';
import { ThemeLeaderboard } from './components/Leaderboard';
import { TopMovers } from './components/TopMovers';
import { DeepDive } from './components/DeepDive';
import { RiskRadar } from './components/RiskRadar';
import { EvidenceFeed } from './components/EvidenceFeed';
import { FinancialTruthCard } from './components/FinancialTruthCard';

import { DashboardProvider } from './context/DashboardContext';
import { GrowthAnalysis } from './components/GrowthAnalysis';

function App() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background p-6 md:p-10 font-sans selection:bg-accent/30">
        <div className="max-w-[1400px] mx-auto">
          <Header />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column: Leaderboard & Secondary Feed (4 cols) */}
            <div className="xl:col-span-4 space-y-8">
              <ThemeLeaderboard />
              <TopMovers />
              <RiskRadar />
            </div>

            {/* Right Column: Deep Analysis (8 cols) */}
            <div className="xl:col-span-8 space-y-8">
              <FinancialTruthCard />
              <GrowthAnalysis />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DeepDive />
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
