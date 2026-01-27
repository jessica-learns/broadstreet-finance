import React from 'react';
import { Header } from './components/Header';
import { ThemeLeaderboard } from './components/Leaderboard';
import { TopMovers } from './components/TopMovers';
import { DeepDive } from './components/DeepDive';
import { RiskRadar } from './components/RiskRadar';
import { EvidenceFeed } from './components/EvidenceFeed';
import { FinancialTruthCard } from './components/FinancialTruthCard';

function App() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans selection:bg-accent/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        <div className="space-y-8">
          {/* Upper Section: Leaderboard/Movers vs Financial Truth */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Box */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <ThemeLeaderboard />
              <TopMovers />
            </div>

            {/* Right Box (Hero Chart) - Stretches to match height of Left Box */}
            <div className="lg:col-span-8">
              <FinancialTruthCard ticker="NVDA" />
            </div>
          </div>

          {/* Lower Section: Deep Dive vs Risk/Evidence */}
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
  );
}

export default App;
