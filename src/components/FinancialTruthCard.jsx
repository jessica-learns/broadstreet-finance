import React, { useEffect, useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { getFinancialTruth } from '../services/edgarSpine';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function FinancialTruthCard({ ticker }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!ticker || ticker.length < 2) return;

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const result = await getFinancialTruth(ticker);
                setData(result);
            } catch (e) {
                console.error(e);
                setError("Could not fetch SEC data. Ticker might be invalid or SEC API rate limited.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [ticker]);

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
            <div className="flex items-start justify-between mb-8 px-2 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-primary tracking-tighter flex items-baseline gap-3">
                        {ticker}
                        {latestQ && (
                            <span className={`text-lg font-bold tracking-tight ${latestQ.growth >= 0 ? "text-slate-700" : "text-orange-500"}`}>
                                {latestQ.growth > 0 ? '+' : ''}{(latestQ.growth * 100).toFixed(1)}% QoQ
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1 ml-1 flex items-center gap-2">
                        Financial Truth <div className="w-1 h-1 rounded-full bg-secondary/40" /> Live SEC Data
                    </p>
                </div>
                {data && (
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${data.evidence.sentiment.includes("Low Conviction") ? "border-orange-500 text-orange-500 bg-orange-50/50" : "bg-primary text-white"}`}>
                        {data.evidence.sentiment}
                    </div>
                )}
            </div>

            {loading && (
                <div className="flex-1 flex flex-col items-center justify-center text-secondary gap-4">
                    <Loader2 className="animate-spin text-primary/30" size={48} />
                    <span className="text-sm font-medium animate-pulse tracking-wide">Analysing 10-K Structures...</span>
                </div>
            )}

            {error && (
                <div className="flex-1 flex flex-col items-center justify-center text-red-400 gap-3">
                    <AlertTriangle size={32} />
                    <span className="text-sm font-medium text-center px-6">{error}</span>
                </div>
            )}

            {!loading && !error && data && latestQ && (
                <div className="flex-1 flex flex-col space-y-8 relative z-10">

                    {/* Hero Grid: High Signal Metrics */}
                    {/* Hero Grid: High Signal Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* Revenue */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph">
                            <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">Revenue</div>
                            <div className="text-2xl font-black text-primary mb-1">{fmtB(latestQ.revenue)}</div>
                            {previousQ && (
                                <div className={`text-xs font-bold flex items-center gap-1 ${latestQ.growth >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                    {latestQ.growth > 0 ? "▲" : latestQ.growth < 0 ? "▼" : ""}
                                    {Math.abs(latestQ.growth * 100).toFixed(1)}% QoQ
                                </div>
                            )}
                        </div>

                        {/* Gross Margin */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph">
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Gross</div>
                            <div className="text-2xl font-black text-slate-700 mb-1">{fmtP(latestQ.grossMargin)}</div>
                            {previousQ && (
                                <div className={`text-xs font-bold flex items-center gap-1 ${latestQ.grossMargin >= previousQ.grossMargin ? "text-emerald-600" : "text-red-500"}`}>
                                    {latestQ.grossMargin >= previousQ.grossMargin ? "▲" : "▼"}
                                    {Math.abs((latestQ.grossMargin - previousQ.grossMargin) * 10000).toFixed(0)} bps QoQ
                                </div>
                            )}
                        </div>

                        {/* Operating Margin */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph">
                            <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">Operating</div>
                            <div className="text-2xl font-black text-primary mb-1">{fmtP(latestQ.opMargin)}</div>
                            {previousQ && (
                                <div className={`text-xs font-bold flex items-center gap-1 ${latestQ.opMargin >= previousQ.opMargin ? "text-emerald-600" : "text-red-500"}`}>
                                    {latestQ.opMargin >= previousQ.opMargin ? "▲" : "▼"}
                                    {Math.abs((latestQ.opMargin - previousQ.opMargin) * 10000).toFixed(0)} bps QoQ
                                </div>
                            )}
                        </div>

                        {/* Net Margin */}
                        <div className="p-6 rounded-3xl bg-surface shadow-neumorph flex flex-col justify-between">
                            <div>
                                <div className="text-xs text-secondary font-bold uppercase tracking-wider mb-2">Net</div>
                                <div className="text-2xl font-black text-primary mb-1">{fmtP(latestQ.netMargin)}</div>
                                {previousQ && (
                                    <div className={`text-xs font-bold flex items-center gap-1 ${latestQ.netMargin >= previousQ.netMargin ? "text-emerald-600" : "text-red-500"}`}>
                                        {latestQ.netMargin >= previousQ.netMargin ? "▲" : "▼"}
                                        {Math.abs((latestQ.netMargin - previousQ.netMargin) * 10000).toFixed(0)} bps QoQ
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Visualization: The "Layer Cake" */}
                    <div className="flex-1 min-h-[250px] w-full relative group">
                        {/* KPI Title */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity bg-surface/50 backdrop-blur-md border border-white/50 rounded-full py-1 px-4 shadow-sm">
                            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                                Revenue (Bars) vs Margins (Lines)
                            </span>
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#0284c7" stopOpacity={0.8} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="period"
                                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `$${(val / 1e9).toFixed(0)}B`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    unit="%"
                                    domain={[0, 'auto']}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-surface/95 backdrop-blur-xl shadow-2xl border border-white/50 rounded-2xl p-6 text-sm min-w-[220px]">
                                                    <div className="font-bold text-primary mb-4 text-base border-b border-primary/10 pb-3">{label}</div>

                                                    {/* Revenue Section */}
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-secondary font-medium text-sm">Revenue</span>
                                                        <span className="font-bold text-primary text-base">{fmtB(payload[0].value)}</span>
                                                    </div>

                                                    {/* Margins Section */}
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-secondary font-medium">Gross</span>
                                                            <span className="font-bold text-primary text-sm">{fmtP(payload[0].payload.grossMargin)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-secondary font-medium">Operating</span>
                                                            <span className="font-bold text-primary text-sm">{fmtP(payload[0].payload.opMargin)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-secondary font-medium">Net</span>
                                                            <span className="font-bold text-primary text-sm">{fmtP(payload[0].payload.netMargin)}</span>
                                                        </div>
                                                        {payload[0].payload.growth !== undefined && (
                                                            <div className="flex justify-between items-center pt-3 border-t border-primary/5 mt-3">
                                                                <span className="text-secondary font-medium">Growth (QoQ)</span>
                                                                <span className={`font-bold text-base ${payload[0].payload.growth >= 0 ? 'text-primary' : 'text-slate-500'}`}>
                                                                    {payload[0].payload.growth > 0 ? '+' : ''}{(payload[0].payload.growth * 100).toFixed(1)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />

                                {/* Revenue Bar - Bottom Layer */}
                                <Bar
                                    yAxisId="left"
                                    dataKey="revenue"
                                    fill="url(#revGradient)"
                                    radius={[8, 8, 0, 0]}
                                    barSize={42}
                                />

                                {/* Margin Lines - Top Layer (Standardized) */}
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="grossMargin"
                                    stroke="#64748b"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#64748b", strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: "#64748b", strokeWidth: 0 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="opMargin"
                                    stroke="#0f172a"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#0f172a", strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: "#0f172a", strokeWidth: 0 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="netMargin"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: "#f97316", strokeWidth: 0 }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend / Verdict Footer */}
                    <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
                        {/* Dynamic Verdict Text */}
                        <div className="flex items-center gap-3">
                            {data.evidence.sentiment.includes("Fixing") ? (
                                <CheckCircle2 size={16} className="text-primary" />
                            ) : data.evidence.sentiment.includes("Low Conviction") ? (
                                <AlertTriangle size={16} className="text-orange-500" />
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary/50" />
                            )}
                            <span className="text-xs font-medium text-secondary">
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
                                <div className="w-2 h-0.5 bg-slate-400" />
                                <span className="text-xs font-bold uppercase text-secondary">Gross</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-0.5 bg-sky-500" />
                                <span className="text-xs font-bold uppercase text-sky-600">Op</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-1 rounded-full bg-orange-500" />
                                <span className="text-xs font-bold uppercase text-orange-600">Net</span>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </Card>
    );
}
