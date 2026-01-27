import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export function FinancialTruthCard({ pricingPower = 1.2, revenueAccel = 0.8 }) {
    const { selectedTicker: ticker, stockData: data, loading, error } = useDashboard();

    if (!ticker) return null;

    // Latest Quarterly Data for Hero Metrics
    const latestQ = data?.chartData && data.chartData.length > 0 ? data.chartData[data.chartData.length - 1] : null;
    const previousQ = data?.chartData && data.chartData.length > 1 ? data.chartData[data.chartData.length - 2] : null;

    // Helper to format currency
    const fmtB = (val) => `$${(val / 1e9).toFixed(1)}B`;
    const fmtP = (val) => `${(val * 100).toFixed(1)}%`;

    return (
        <Card className="rounded-[32px] h-full min-h-[500px] flex flex-col relative overflow-hidden">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-4 px-2 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-primary tracking-tighter flex items-baseline gap-3">
                        {ticker}
                        {latestQ && (
                            <span className="text-lg font-bold tracking-tight text-primary">
                                {latestQ.growth > 0 ? '+' : ''}{(latestQ.growth * 100).toFixed(1)}% QoQ
                            </span>
                        )}
                    </h2>
                    <div className="text-xs text-slate-600 font-black uppercase tracking-widest mt-1 ml-1 flex items-center gap-2">
                        Stock Analysis <div className="w-1 h-1 rounded-full bg-slate-400" /> Live SEC Data
                    </div>
                </div>
                {data && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${data.evidence.sentiment.includes("Low Conviction") ? "border-accent text-accent bg-accent/5" : "bg-primary text-white"}`}>
                        {data.evidence.sentiment}
                    </div>
                )}
            </div>

            {/* Hedge Fund Signals: Soft Glass Row */}
            {data && !loading && !error && (
                <div className="px-2 mb-8 relative z-10 animate-in fade-in slide-in-from-top-2 duration-700">
                    <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[24px] p-5 flex items-center justify-between shadow-sm ring-1 ring-black/5">
                        <div className="flex items-center gap-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">Pricing Power</span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black tracking-tighter text-primary">
                                        {pricingPower > 0 ? '+' : ''}{pricingPower}%
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">6m Delta</span>
                                </div>
                            </div>
                            <div className="w-px h-10 bg-slate-200/60" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">Rev Velocity</span>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl font-black tracking-tighter text-primary">
                                        {revenueAccel > 0 ? '+' : ''}{revenueAccel}%
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter opacity-70">Acceleration</span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex flex-col items-end">
                                <Badge variant="outline" className="text-[10px] border-slate-300 text-slate-500 bg-white/60 py-0.5 px-2.5 font-black uppercase tracking-widest rounded-lg">
                                    Hedge Fund Signals
                                </Badge>
                                <span className="text-[8px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">Proprietary Alpha Stream</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-secondary gap-4">
                    <Loader2 className="animate-spin text-primary/30" size={48} />
                    <span className="text-sm font-medium animate-pulse tracking-wide">Analysing 10-K Structures...</span>
                </div>
            )}

            {error && (
                <div className="flex-1 flex flex-col items-center justify-center text-secondary gap-3">
                    <AlertTriangle size={32} />
                    <span className="text-sm font-medium text-center px-6">{error}</span>
                </div>
            )}

            {!loading && !error && data && latestQ && (
                <div className="flex-1 flex flex-col space-y-8 relative z-10">

                    {/* Hero Grid: High Signal Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Revenue */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph-sm">
                            <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">Revenue</div>
                            <div className="text-2xl font-black text-primary mb-1">{fmtB(latestQ.revenue)}</div>
                            {previousQ && (
                                <div className="text-xs font-bold flex items-center gap-1 text-secondary">
                                    {latestQ.growth > 0 ? "▲" : latestQ.growth < 0 ? "▼" : ""}
                                    {Math.abs(latestQ.growth * 100).toFixed(1)}% QoQ
                                </div>
                            )}
                        </div>

                        {/* Gross Margin */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph-sm">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Gross</div>
                            <div className="text-2xl font-black text-slate-700 mb-1">{fmtP(latestQ.grossMargin)}</div>
                            {previousQ && (
                                <div className="text-xs font-bold flex items-center gap-1 text-secondary">
                                    {latestQ.grossMargin >= previousQ.grossMargin ? "▲" : "▼"}
                                    {Math.abs((latestQ.grossMargin - previousQ.grossMargin) * 10000).toFixed(0)} bps QoQ
                                </div>
                            )}
                        </div>

                        {/* Operating Margin */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph-sm">
                            <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">Operating</div>
                            <div className="text-2xl font-black text-primary mb-1">{fmtP(latestQ.opMargin)}</div>
                            {previousQ && (
                                <div className="text-xs font-bold flex items-center gap-1 text-secondary">
                                    {latestQ.opMargin >= previousQ.opMargin ? "▲" : "▼"}
                                    {Math.abs((latestQ.opMargin - previousQ.opMargin) * 10000).toFixed(0)} bps QoQ
                                </div>
                            )}
                        </div>

                        {/* Net Margin */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph-sm flex flex-col justify-between">
                            <div>
                                <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">Net</div>
                                <div className="text-2xl font-black text-primary mb-1">{fmtP(latestQ.netMargin)}</div>
                                {previousQ && (
                                    <div className="text-xs font-bold flex items-center gap-1 text-secondary">
                                        {latestQ.netMargin >= previousQ.netMargin ? "▲" : "▼"}
                                        {Math.abs((latestQ.netMargin - previousQ.netMargin) * 10000).toFixed(0)} bps QoQ
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Business Description */}
                    {data?.evidence?.businessDescription && (
                        <div className="mt-6 pt-6 border-t border-primary/5">
                            <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">About {ticker}</div>
                            <p className="text-sm text-secondary leading-relaxed">
                                {data.evidence.businessDescription}
                            </p>
                        </div>
                    )}

                    {/* Legend / Verdict Footer */}
                    <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                        {/* Dynamic Verdict Text */}
                        <div className="flex items-center gap-3">
                            {data.evidence.sentiment.includes("Fixing") ? (
                                <CheckCircle2 size={16} className="text-primary" />
                            ) : data.evidence.sentiment.includes("Low Conviction") ? (
                                <AlertTriangle size={16} className="text-accent" />
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            )}
                            <span className="text-xs font-bold text-slate-600">
                                {data.evidence.sentiment.includes("Fixing")
                                    ? "High Capex detected matching constraints."
                                    : data.evidence.sentiment.includes("Low Conviction")
                                        ? "Constraints cited, but spend is flat."
                                        : "No major supply chain signals."}
                            </span>
                        </div>

                        {/* Mini Legend */}
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 grayscale opacity-60">
                                <div className="w-2 h-0.5 bg-[#0ea5e9]/40" />
                                <span className="text-xs font-black uppercase text-slate-600">Gross</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-0.5 bg-[#0ea5e9]/70" />
                                <span className="text-xs font-black uppercase text-primary">Op</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-1 rounded-full bg-[#0ea5e9]" />
                                <span className="text-xs font-black uppercase text-primary">Net</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </Card>
    );
}
