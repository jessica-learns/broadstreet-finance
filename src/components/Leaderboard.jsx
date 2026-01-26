import React from 'react';
import { Card } from './ui/Card';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';

const dummyData = [
    { id: 1, theme: "Semiconductor Equip", cps: 92, mrg: "+12%", opp: 8.4 },
    { id: 2, theme: "Power Gen & Grid", cps: 88, mrg: "+8%", opp: 7.9 },
    { id: 3, theme: "Advanced Packaging", cps: 85, mrg: "+15%", opp: 7.6 },
    { id: 4, theme: "Data Center Cooling", cps: 74, mrg: "+5%", opp: 6.2 },
    { id: 5, theme: "Lithium Supply", cps: 62, mrg: "-2%", opp: 5.1 },
];

export function ThemeLeaderboard() {
    return (
        <Card className="h-full rounded-[32px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary">Theme Leaderboard</h2>
                <div className="text-xs font-semibold text-secondary uppercase tracking-wider">Live Rank</div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-secondary border-b border-gray-200/50">
                            <th className="pb-4 pl-4 font-semibold uppercase tracking-wider">Theme</th>
                            <th className="pb-4 font-semibold text-right uppercase tracking-wider">CPS</th>
                            <th className="pb-4 font-semibold text-right uppercase tracking-wider">MRG</th>
                            <th className="pb-4 pr-4 font-semibold text-right uppercase tracking-wider">Opp Score</th>
                        </tr>
                    </thead>
                    <tbody className="space-y-4">
                        {dummyData.map((item) => (
                            <tr
                                key={item.id}
                                className={cn(
                                    "group transition-all duration-300 hover:-translate-y-1 hover:shadow-neumorph rounded-2xl cursor-pointer border-l-4 border-transparent hover:border-primary",
                                    item.id === 1 ? "bg-surface" : ""
                                )}
                            >
                                <td className="py-4 pl-4 rounded-l-xl">
                                    <span className="font-bold text-primary block">{item.theme}</span>
                                </td>
                                <td className="py-4 text-right font-medium text-secondary tabular-nums">
                                    {item.cps}
                                </td>
                                <td className="py-4 text-right font-medium text-green-600 tabular-nums">
                                    {item.mrg}
                                </td>
                                <td className="py-4 pr-4 text-right rounded-r-xl">
                                    <div className="inline-flex items-center justify-center w-10 h-8 bg-surface shadow-neumorph-pressed rounded-lg font-bold text-primary tabular-nums">
                                        {item.opp}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
