import React from 'react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { ShieldAlert } from 'lucide-react';

const risks = [
    { label: "Japan Yield Curve Control", status: "red" },
    { label: "Taiwan Strait Activity", status: "yellow" },
    { label: "Eurozone Credit Spreads", status: "green" },
    { label: "US Initial Jobless Claims", status: "green" },
];

export function RiskRadar() {
    return (
        <Card className="rounded-[32px] mb-6 h-fit">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-surface shadow-neumorph rounded-full text-primary">
                    <ShieldAlert size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary">Break Risk Radar</h3>
            </div>

            <div className="space-y-3">
                {risks.map((risk, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 bg-surface shadow-neumorph-pressed rounded-full">
                        <span className="text-sm font-semibold text-secondary">{risk.label}</span>
                        <div className={cn(
                            "w-3 h-3 rounded-full",
                            risk.status === 'red' && "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse",
                            risk.status === 'yellow' && "bg-yellow-400",
                            risk.status === 'green' && "bg-primary"
                        )} />
                    </div>
                ))}
            </div>
        </Card>
    );
}
