import React from 'react';
import { Card } from './ui/Card';
import { useDashboard } from '../context/DashboardContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Loader2, AlertTriangle } from 'lucide-react';

// NeumorphicTooltip component (custom tooltip with neumorphic styling)
const NeumorphicTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface/95 backdrop-blur-xl shadow-neumorph-elevated border border-white/50 rounded-2xl p-4 text-sm min-w-[160px]">
                <div className="font-bold text-primary mb-2 text-sm border-b border-primary/10 pb-2">{label}</div>
                <div className="space-y-1.5">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center gap-4">
                            <span className="text-secondary text-xs">{entry.name}</span>
                            <span className="font-bold text-primary text-sm">
                                {formatter ? formatter(entry.value, entry.name) : entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export function GrowthAnalysis() {
    const { selectedTicker, stockData, loading, error } = useDashboard();

    // Loading state
    if (loading) {
        return (
            <Card className="rounded-[32px] min-h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-secondary">
                    <Loader2 className="animate-spin text-primary/30" size={32} />
                    <span className="text-sm font-medium">Loading growth data...</span>
                </div>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card className="rounded-[32px] min-h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-secondary">
                    <AlertTriangle size={24} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            </Card>
        );
    }

    // No data state
    if (!stockData?.chartData || stockData.chartData.length < 2) return null;

    const { chartData, marginDeltas, revenueGrowthData } = stockData;
    const chartAxisStyle = { fontSize: 11, fill: '#64748B', fontWeight: 600 };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="px-2">
                <h2 className="text-lg font-bold text-primary tracking-tight">{selectedTicker} Growth Analysis</h2>
            </div>

            {/* Three Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Chart 1: Revenue Growth Rate */}
                <Card className="rounded-[24px] p-4 shadow-neumorph-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-primary">Revenue Growth</h3>
                    </div>
                    <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueGrowthData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                                <XAxis dataKey="period" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                <Tooltip content={<NeumorphicTooltip formatter={(v) => `${v > 0 ? '+' : ''}${v}%`} />} cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} />
                                <ReferenceLine y={0} stroke="#64748B" strokeOpacity={0.3} />
                                <Bar dataKey="growth" name="Growth" radius={[4, 4, 0, 0]} maxBarSize={32}>
                                    {revenueGrowthData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#0ea5e9" fillOpacity={index === revenueGrowthData.length - 1 ? 1 : 0.5} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Chart 2: Margin Trajectory */}
                <Card className="rounded-[24px] p-4 shadow-neumorph-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-primary">Margin Trajectory</h3>
                    </div>
                    <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                                <XAxis dataKey="period" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={['auto', 'auto']} />
                                <Tooltip content={<NeumorphicTooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />} cursor={{ stroke: '#64748B', strokeOpacity: 0.2 }} />
                                <Line type="monotone" dataKey="grossMargin" name="Gross" stroke="#0ea5e9" strokeOpacity={0.4} strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9", fillOpacity: 0.4, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="opMargin" name="Operating" stroke="#0ea5e9" strokeOpacity={0.7} strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9", fillOpacity: 0.7, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                                <Line type="monotone" dataKey="netMargin" name="Net" stroke="#0ea5e9" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Chart 3: Sequential Margin Change */}
                <Card className="rounded-[24px] p-4 shadow-neumorph-sm">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-primary">Margin Change</h3>
                    </div>
                    <div className="h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={marginDeltas} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                                <XAxis dataKey="period" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`} />
                                <Tooltip content={<NeumorphicTooltip formatter={(v) => `${v > 0 ? '+' : ''}${v} bps`} />} cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} />
                                <ReferenceLine y={0} stroke="#64748B" strokeOpacity={0.5} />
                                <Bar dataKey="grossDelta" name="Gross Δ" fill="#0ea5e9" fillOpacity={0.4} radius={[2, 2, 0, 0]} maxBarSize={16} />
                                <Bar dataKey="opDelta" name="Op Δ" fill="#0ea5e9" fillOpacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={16} />
                                <Bar dataKey="netDelta" name="Net Δ" fill="#0ea5e9" radius={[2, 2, 0, 0]} maxBarSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
