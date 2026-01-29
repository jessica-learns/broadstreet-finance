import React from 'react';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
import { ShieldAlert } from 'lucide-react';

const risks = [
    { label: "Japan Yield Curve Control", status: "high" },
    { label: "Taiwan Strait Activity", status: "medium" },
    { label: "Eurozone Credit Spreads", status: "low" },
    { label: "US Initial Jobless Claims", status: "low" },
];

export function RiskRadar() {
    return (
        <Card className="rounded-[32px] mb-6 h-fit">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-surface shadow-neumorph-sm rounded-full text-primary">
                    <ShieldAlert size={20} />
                </div>
                <h3 className="text-lg font-bold text-primary">Break Risk Radar</h3>
            </div>

            <div className="space-y-3">
                {risks.map((risk, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3 bg-surface shadow-neumorph-pressed rounded-full">
                        <span className="text-sm font-bold text-secondary">{risk.label}</span>
                        <div className={cn(
                            "w-3 h-3 rounded-full",
                            risk.status === 'high' && "bg-accent/80",
                            risk.status === 'medium' && "bg-secondary",
                            risk.status === 'low' && "bg-primary/30"
                        )} />
                    </div>
                ))}
            </div>
        </Card>
    );
}
