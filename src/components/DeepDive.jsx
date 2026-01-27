import React, { useState } from 'react';
import { Card } from './ui/Card';
import { NeumorphicButton } from './ui/Button';
import { Badge } from './ui/Badge';
import { Sparkles, BookOpen, Share2, Download, ArrowRight } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export function DeepDive() {
    const { selectedTicker, fetchStock, loading } = useDashboard();
    const [localTicker, setLocalTicker] = useState(selectedTicker);

    // Sync local ticker if selectedTicker changes externally
    React.useEffect(() => {
        setLocalTicker(selectedTicker);
    }, [selectedTicker]);

    const handleGenerate = () => {
        if (localTicker !== selectedTicker) {
            fetchStock(localTicker);
        }
    };

    return (
        <Card className="rounded-[32px] relative overflow-hidden">
            {/* Decorator Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-surface shadow-neumorph-sm rounded-2xl text-primary">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Deep Dive Report</h2>
                        <p className="text-slate-600 text-sm font-semibold">Powered by Broadstreet AI x NotebookLM</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <NeumorphicButton className="p-3">
                        <Share2 size={18} />
                    </NeumorphicButton>
                    <NeumorphicButton className="p-3">
                        <Download size={18} />
                    </NeumorphicButton>
                </div>
            </div>

            {/* Report Content Placeholder */}
            <div className="space-y-6">
                {/* Ticker Selector Helper */}
                <div className="flex gap-4 p-2 bg-surface shadow-neumorph-pressed rounded-full transition-all focus-within:ring-2 focus-within:ring-primary/20">
                    <input
                        type="text"
                        value={localTicker}
                        onChange={(e) => setLocalTicker(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-primary font-bold placeholder:text-secondary/50 tracking-wide text-sm"
                        placeholder="Enter ticker or research question..."
                    />
                    <NeumorphicButton
                        variant="solid"
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs hover:scale-105 active:scale-95 transition-transform duration-200"
                    >
                        <Sparkles size={16} className={loading ? "animate-spin" : ""} />
                        <span>{loading ? "Deep Diving..." : "Generate Report"}</span>
                    </NeumorphicButton>
                </div>

                {/* Report Section */}
                <div className="p-6 bg-surface shadow-neumorph-sm rounded-3xl border border-white/50 group/report hover:shadow-neumorph transition-all duration-300 cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant="navy">Analyst Note</Badge>
                        <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Generated 2m ago</span>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3">Supply Chain Constraints in CoWoS Pricing</h3>
                    <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                        Latest channel checks indicate TSMC's CoWoS capacity remains the primary bottleneck for H100 delivery.
                        NotebookLM analysis of Q3 transcripts suggests a 15% pricing power increase for packaging vendors...
                    </p>

                    <div className="flex items-center gap-2 text-accent font-bold text-sm group-hover/report:underline">
                        <span>View Sources (4 Notebooks)</span>
                        <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </Card>
    );
}
