import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useDashboard } from '../context/DashboardContext';
import { Search, Loader2 } from 'lucide-react';

export function TickerInput() {
    const { selectedTicker, fetchStock, loading } = useDashboard();
    const [input, setInput] = useState(selectedTicker);

    const handleSubmit = (e) => {
        e.preventDefault();
        const ticker = input.toUpperCase().trim();
        if (ticker && ticker.length >= 1 && ticker.length <= 5) {
            fetchStock(ticker);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <Card className="rounded-[24px] p-6 shadow-neumorph-sm h-full flex flex-col justify-center">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-primary">Analyze Stock</h3>
                <p className="text-[10px] text-secondary uppercase tracking-wider mt-0.5">Enter SEC Ticker</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                        onKeyDown={handleKeyDown}
                        placeholder="NVDA"
                        maxLength={5}
                        className="w-full bg-surface shadow-neumorph-pressed rounded-2xl px-4 py-3 text-xl font-bold text-primary text-center uppercase tracking-wider placeholder:text-secondary/30 outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-full bg-primary text-white rounded-2xl py-3 font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Loading...
                        </>
                    ) : (
                        <>
                            <Search size={16} />
                            Analyze
                        </>
                    )}
                </button>
            </form>

            <p className="text-[9px] text-secondary text-center mt-4 uppercase tracking-wider">
                Direct SEC EDGAR Lookup
            </p>
        </Card>
    );
}
