import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { TrendingUp } from 'lucide-react';

const movers = [
    { theme: "Nuclear SMRs", delta: "+2.4", reason: "Policy Shift", tagType: "navy" },
    { theme: "Copper Miners", delta: "+1.8", reason: "Supply Crunch", tagType: "navy" },
    { theme: "Cloud Storage", delta: "+0.6", reason: "Valuation", tagType: "default" },
];

export function TopMovers() {
    return (
        <Card className="rounded-[32px] h-fit">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-surface shadow-neumorph-sm rounded-full text-accent">
                    <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary">Top Movers (24h)</h3>
            </div>

            <div className="space-y-4">
                {movers.map((mover, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl transition-all duration-300 hover:shadow-neumorph-hover hover:-translate-y-1 cursor-pointer border border-transparent hover:border-white/20">
                        <div>
                            <div className="font-bold text-primary">{mover.theme}</div>
                            <div className="mt-1">
                                <Badge variant={mover.tagType}>{mover.reason}</Badge>
                            </div>
                        </div>
                        <div className="text-xl font-bold text-primary tabular-nums">
                            {mover.delta}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
