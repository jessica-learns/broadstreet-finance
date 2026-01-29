// src/components/MomentumCard.jsx
// Displays relative strength vs benchmarks for the selected stock

import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { useDashboard } from '../context/DashboardContext';
import { getRelativeStrength, formatRSReturn, getRSSignal, DEFAULT_BENCHMARKS } from '../services/relativeStrength';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Benchmark display names and descriptions
const BENCHMARK_INFO = {
    SPY: { name: 'S&P 500', desc: 'Broad market' },
    QQQ: { name: 'Nasdaq 100', desc: 'Large-cap tech' },
    SMH: { name: 'Semiconductors', desc: 'Chip sector' },
    PAVE: { name: 'Infrastructure', desc: 'US infra' },
    XBI: { name: 'Biotech', desc: 'SMID biotech' },
    SETM: { name: 'Metals & Mining', desc: 'Active miners' },
};

function SignalIcon({ signal }) {
    switch (signal) {
        case 'strong':
        case 'bullish':
            return <TrendingUp size={14} className="text-signal" />;
        case 'weak':
        case 'bearish':
            return <TrendingDown size={14} className="text-accent" />;
        default:
            return <Minus size={14} className="text-secondary" />;
    }
}

function RSRow({ benchmark, data }) {
    const info = BENCHMARK_INFO[benchmark] || { name: benchmark, desc: '' };
    const signal = getRSSignal(data);

    const rsReturnFormatted = formatRSReturn(data?.rsReturn);
    const isOutperforming = data?.rsReturn > 0;
    const isAboveMA = data?.rsVsMA === 'above';

    return (
        <div className="flex items-center justify-between py-2 border-b border-primary/5 last:border-0">
            <div className="flex items-center gap-2">
                <SignalIcon signal={signal} />
                <div>
                    <span className="text-sm font-bold text-primary">{info.name}</span>
                    <span className="text-[10px] text-secondary ml-2">{info.desc}</span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                {data?.rsVsMA && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${isAboveMA
                        ? 'bg-signal/10 text-signal'
                        : 'bg-secondary/10 text-secondary'
                        }`}>
                        {isAboveMA ? '▲ MA' : '▼ MA'}
                    </span>
                )}
                <span className={`text-sm font-bold tabular-nums min-w-[60px] text-right ${data?.error
                    ? 'text-secondary'
                    : isOutperforming
                        ? 'text-primary'
                        : 'text-secondary'
                    }`}>
                    {rsReturnFormatted}
                </span>
            </div>
        </div>
    );
}

export function MomentumCard() {
    const { selectedTicker, stockData } = useDashboard();
    const [rsData, setRsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedTicker) return;

        let cancelled = false;

        async function fetchRS() {
            setLoading(true);
            setError(null);

            try {
                const result = await getRelativeStrength([selectedTicker]);
                if (!cancelled) {
                    setRsData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to fetch RS:', err);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchRS();

        return () => { cancelled = true; };
    }, [selectedTicker]);

    const tickerResult = rsData?.results?.find(r => r.ticker === selectedTicker);
    const benchmarkResults = tickerResult?.benchmarks || [];

    const benchmarkLookup = {};
    for (const b of benchmarkResults) {
        benchmarkLookup[b.benchmark] = b;
    }

    const outperformCount = benchmarkResults.filter(b => b.rsReturn > 0).length;
    const totalCount = benchmarkResults.filter(b => b.rsReturn !== null).length;

    return (
        <Card className="rounded-[32px] h-fit">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-primary">Relative Strength</h3>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mt-0.5">
                        252-Day vs Benchmarks
                    </p>
                </div>
                {!loading && totalCount > 0 && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${outperformCount >= 4
                        ? 'bg-signal/10 text-signal border border-signal/20'
                        : outperformCount >= 2
                            ? 'bg-primary/5 text-primary border border-primary/10'
                            : 'bg-secondary/10 text-secondary border border-secondary/20'
                        }`}>
                        {outperformCount}/{totalCount} Outperforming
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-primary/30" size={24} />
                </div>
            ) : error ? (
                <div className="text-center py-6">
                    <p className="text-sm text-secondary">{error}</p>
                    <p className="text-[10px] text-secondary/60 mt-2">
                        Check that Twelve Data API key is configured
                    </p>
                </div>
            ) : !tickerResult ? (
                <div className="text-center py-8">
                    <p className="text-sm text-secondary">No data available</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {DEFAULT_BENCHMARKS.map(bmk => (
                        <RSRow
                            key={bmk}
                            benchmark={bmk}
                            data={benchmarkLookup[bmk]}
                        />
                    ))}
                </div>
            )}

            {rsData?.asOfDate && (
                <div className="mt-4 pt-3 border-t border-primary/5">
                    <p className="text-[10px] text-secondary/50 text-center uppercase tracking-wider">
                        As of {rsData.asOfDate} • Twelve Data
                    </p>
                </div>
            )}
        </Card>
    );
}
