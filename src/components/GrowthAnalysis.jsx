import React from 'react';
import { Card } from './ui/Card';
import { useDashboard } from '../context/DashboardContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';

// NeumorphicTooltip component (custom tooltip with neumorphic styling)
const ChartTooltip = ({ active, payload, label, formatter }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface/95 backdrop-blur-xl shadow-neumorph-elevated border border-white/50 rounded-2xl p-4 text-sm min-w-[160px]">
                <div className="font-bold text-primary mb-2 text-sm border-b border-primary/10 pb-2">
                    {label && label.includes('-') ? (() => {
                        const [year, month] = label.split('-');
                        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
                    })() : label}
                </div>
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

const formatPeriod = (period) => {
    const [year, month] = period.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
};

// Custom tick component for multi-line date labels
const CustomXAxisTick = ({ x, y, payload }) => {
    if (!payload || !payload.value) return null;
    const [year, month] = payload.value.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[parseInt(month) - 1];
    const yearStr = `'${year.slice(2)}`;

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#64748B" fontSize={12} fontWeight={600}>
                {monthStr}
            </text>
            <text x={0} y={0} dy={30} textAnchor="middle" fill="#64748B" fontSize={11} fontWeight={500}>
                {yearStr}
            </text>
        </g>
    );
};

export function GrowthAnalysis() {
    const { stockData, loading, error } = useDashboard();

    // Loading state - return four skeleton cards
    if (loading) {
        return (
            <>
                <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary/30" size={24} />
                </Card>
                <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary/30" size={24} />
                </Card>
                <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary/30" size={24} />
                </Card>
                <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px] flex items-center justify-center">
                    <Loader2 className="animate-spin text-primary/30" size={24} />
                </Card>
            </>
        );
    }

    // Error or no data
    if (error || !stockData?.chartData || stockData.chartData.length < 2) {
        return (
            <>
                {[1, 2, 3, 4].map(i => (
                    <Card key={i} className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px] flex items-center justify-center">
                        <span className="text-sm text-secondary font-bold uppercase tracking-wider">No Data</span>
                    </Card>
                ))}
            </>
        );
    }

    const { chartData, marginDeltas, revenueGrowthData, revenueAbsoluteData } = stockData;
    const chartAxisStyle = { fontSize: 14, fill: '#64748B', fontWeight: 600 };

    return (
        <>
            {/* Chart 1: Revenue (Absolute) */}
            <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px]">
                <div className="mb-3 text-center">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Revenue</h3>
                </div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueAbsoluteData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.15} />
                            <XAxis dataKey="period" tick={<CustomXAxisTick />} axisLine={{ stroke: '#64748B', strokeOpacity: 0.3 }} tickLine={false} height={45} interval={0} />
                            <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v.toFixed(0)}B`} />
                            <Tooltip content={<ChartTooltip formatter={(v) => `$${v.toFixed(1)}B`} />} cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} />
                            <Bar dataKey="revenue" name="Revenue" radius={[2, 2, 0, 0]} maxBarSize={20}>
                                {revenueAbsoluteData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#0ea5e9" fillOpacity={index === revenueAbsoluteData.length - 1 ? 1 : 0.5} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Chart 2: Revenue Growth */}
            <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px]">
                <div className="mb-3 text-center">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Revenue Growth</h3>
                </div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueGrowthData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.15} />
                            <XAxis dataKey="period" tick={<CustomXAxisTick />} axisLine={{ stroke: '#64748B', strokeOpacity: 0.3 }} tickLine={false} height={45} interval={0} />
                            <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                            <Tooltip content={<ChartTooltip formatter={(v) => `${v > 0 ? '+' : ''}${v}%`} />} cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} />
                            <ReferenceLine y={0} stroke="#64748B" strokeOpacity={0.3} />
                            <Bar dataKey="growth" name="Growth" radius={[2, 2, 0, 0]} maxBarSize={20}>
                                {revenueGrowthData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#0ea5e9" fillOpacity={index === revenueGrowthData.length - 1 ? 1 : 0.5} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Chart 3: Margin Trajectory */}
            <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px]">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Margin Levels</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-signal/40"></div>
                            <span className="text-[10px] text-secondary">Gross</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-signal/70"></div>
                            <span className="text-[10px] text-secondary">Op</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-signal"></div>
                            <span className="text-[10px] text-secondary">Net</span>
                        </div>
                    </div>
                </div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.15} />
                            <XAxis dataKey="period" tick={<CustomXAxisTick />} axisLine={{ stroke: '#64748B', strokeOpacity: 0.3 }} tickLine={false} height={45} interval={0} />
                            <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} domain={['auto', 'auto']} tickCount={4} />
                            <Tooltip content={<ChartTooltip formatter={(v) => `${(v * 100).toFixed(1)}%`} />} cursor={{ stroke: '#64748B', strokeOpacity: 0.2 }} />
                            <Line type="monotone" dataKey="grossMargin" name="Gross" stroke="#0ea5e9" strokeOpacity={0.4} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                            <Line type="monotone" dataKey="opMargin" name="Operating" stroke="#0ea5e9" strokeOpacity={0.7} strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                            <Line type="monotone" dataKey="netMargin" name="Net" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            {/* Chart 4: Margin Change (in percentage points) */}
            <Card className="rounded-[24px] p-5 shadow-neumorph-sm h-[290px]">
                <div className="mb-3 text-center">
                    <h3 className="text-sm font-black text-primary uppercase tracking-widest">Margin Change</h3>
                </div>
                <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={marginDeltas} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.15} />
                            <XAxis dataKey="period" tick={<CustomXAxisTick />} axisLine={{ stroke: '#64748B', strokeOpacity: 0.3 }} tickLine={false} height={45} interval={0} />
                            <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v > 0 ? '+' : ''}${(v / 100).toFixed(1)}%`} />
                            <Tooltip content={<ChartTooltip formatter={(v) => `${v > 0 ? '+' : ''}${(v / 100).toFixed(2)}%`} />} cursor={{ fill: 'rgba(14, 165, 233, 0.05)' }} />
                            <ReferenceLine y={0} stroke="#64748B" strokeOpacity={0.5} />
                            <Bar dataKey="grossDelta" name="Gross Δ" fill="#0ea5e9" fillOpacity={0.4} radius={[2, 2, 0, 0]} maxBarSize={10} />
                            <Bar dataKey="opDelta" name="Op Δ" fill="#0ea5e9" fillOpacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={10} />
                            <Bar dataKey="netDelta" name="Net Δ" fill="#0ea5e9" radius={[2, 2, 0, 0]} maxBarSize={10} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </>
    );
}
