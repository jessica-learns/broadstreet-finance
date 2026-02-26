import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { FileText } from 'lucide-react';

const evidence = [
    { ticker: "TSMC", summary: "3nm yield exceeding targets in Q2 reports.", date: "2h ago" },
    { ticker: "BHP", summary: "Escondida strike risk elevated >60%.", date: "4h ago" },
    { ticker: "PLTR", summary: "New gov contract explicitly cites 'AIP'.", date: "5h ago" },
    { ticker: "NVDA", summary: "H100 lead times compressing to 8w.", date: "6h ago" },
];

export function EvidenceFeed() {
    return (
        <Card className="rounded-[32px] h-fit">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-surface shadow-neumorph-sm rounded-full text-secondary">
                    <FileText size={22} />
                </div>
                <h3 className="text-lg font-bold text-primary">Fresh Evidence</h3>
            </div>

            <div className="space-y-4">
                {evidence.map((item, idx) => (
                    <div key={idx} className="bg-surface shadow-neumorph-sm rounded-2xl p-4 transition-all duration-300 hover:shadow-neumorph hover:-translate-y-1 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="primary" className="tracking-wider font-bold">
                                {item.ticker}
                            </Badge>
                            <span className="text-[12px] text-secondary font-bold">{item.date}</span>
                        </div>
                        <p className="text-sm font-medium text-primary leading-snug">
                            {item.summary}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
