import React, { useState } from 'react';
import { Card } from './ui/Card';
import { useDashboard } from '../context/DashboardContext';
import { Search, Loader2 } from 'lucide-react';

export function TickerInput() {
    const { selectedTicker, stockData, fetchStock, loading } = useDashboard();
    const [input, setInput] = useState(selectedTicker || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        const ticker = input.toUpperCase().trim();
        if (ticker && ticker.length >= 1 && ticker.length <= 5) {
            fetchStock(ticker);
        }
    };

    // Format helpers
    const fmtPct = (val) => `${(val * 100).toFixed(1)}%`;

    const formatPeriod = (period) => {
        if (!period) return '';
        const [year, month] = period.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
    };

    // Get latest quarter data for quick stats
    const latestQ = stockData?.chartData?.[stockData.chartData.length - 1];
    const latestPeriod = latestQ?.period ? formatPeriod(latestQ.period) : '';

    return (
        <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-full flex flex-col justify-between">
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-[10px] font-black text-secondary uppercase tracking-widest">Analyze Stock</h3>
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="space-y-3 mb-5">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value.toUpperCase())}
                        placeholder="NVDA"
                        maxLength={5}
                        className="w-full bg-surface shadow-neumorph-pressed rounded-xl px-4 py-3 text-2xl font-black text-primary text-center uppercase tracking-wider placeholder:text-secondary/30 outline-none focus:ring-2 focus:ring-signal/20 transition-all"
                    />

                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-full bg-primary text-white rounded-xl py-2.5 font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <Search size={14} />
                                Analyze
                            </>
                        )}
                    </button>
                </form>

                {/* Quick Stats - only show when we have data */}
                {latestQ && !loading && (
                    <div className="border-t border-primary/5 pt-4 mb-4">
                        <div className="text-center mb-3">
                            <div className="text-[11px] font-black text-secondary uppercase tracking-widest">Latest Quarter</div>
                            {latestPeriod && <div className="text-sm font-black text-accent uppercase">{latestPeriod}</div>}
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Rev Growth</span>
                                <span className="text-base font-bold text-primary">{latestQ.growth > 0 ? '+' : ''}{(latestQ.growth * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Gross</span>
                                <span className="text-base font-bold text-primary">{fmtPct(latestQ.grossMargin)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Operating</span>
                                <span className="text-base font-bold text-primary">{fmtPct(latestQ.opMargin)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-secondary">Net</span>
                                <span className="text-base font-bold text-primary">{fmtPct(latestQ.netMargin)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* SEC Attribution */}
            <p className="text-[8px] text-secondary/50 text-center uppercase tracking-wider">
                SEC EDGAR Data
            </p>
        </Card>
    );
}
