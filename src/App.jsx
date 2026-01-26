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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <ThemeLeaderboard />
            <TopMovers />
            <DeepDive />
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <FinancialTruthCard ticker="NVDA" />
            <RiskRadar />
            <EvidenceFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
