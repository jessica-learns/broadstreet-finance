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

    return (
        <Card className="rounded-[32px] h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-primary">Financial Truth: {ticker}</h2>
                    <p className="text-xs text-secondary font-medium uppercase tracking-wider">SEC EDGAR CROSS-REFERENCE</p>
                </div>
                {data && (
                    <Badge variant={data.evidence.sentiment.includes("Fixing") ? "navy" : "default"}>
                        {data.evidence.sentiment}
                    </Badge>
                )}
            </div>

            {loading && (
                <div className="h-64 flex flex-col items-center justify-center text-secondary gap-3">
                    <Loader2 className="animate-spin" size={32} />
                    <span className="text-sm font-medium animate-pulse">Scanning 10-K Filings...</span>
                </div>
            )}

            {error && (
                <div className="h-64 flex flex-col items-center justify-center text-red-400 gap-3">
                    <AlertTriangle size={32} />
                    <span className="text-sm font-medium text-center px-6">{error}</span>
                </div>
            )}

            {!loading && !error && data && (
                <div className="space-y-6">
                    {/* Verdict Section */}
                    <div className="flex gap-4">
                        <div className="flex-1 bg-surface shadow-neumorph-pressed rounded-2xl p-4">
                            <div className="text-secondary text-xs font-bold uppercase mb-1">Constraint Mentions</div>
                            <div className="text-2xl font-bold text-primary tabular-nums">{data.evidence.keywordCount}</div>
                        </div>
                        <div className="flex-1 bg-surface shadow-neumorph-pressed rounded-2xl p-4">
                            <div className="text-secondary text-xs font-bold uppercase mb-1">Capex Intensity</div>
                            <div className="text-2xl font-bold text-primary tabular-nums">
                                {(data.metrics.capexIntensity * 100).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data.chartData}>
                                <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" hide />
                                <YAxis yAxisId="right" orientation="right" hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                                <Bar yAxisId="left" dataKey="revenue" barSize={20} fill="#1A2B4C" radius={[4, 4, 0, 0]} />
                                {/* Placeholder Line (Margin) - real data needs join logic, mocking strictly for visual structure as per prompt request */}
                                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FFB347" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </Card>
    );
}
