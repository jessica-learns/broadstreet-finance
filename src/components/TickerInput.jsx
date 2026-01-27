import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Search, Loader2 } from 'lucide-react';
import { useDashboard } from '../context/DashboardContext';

export function TickerInput() {
    const { setSelectedTicker, loading } = useDashboard();
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setSelectedTicker(input.trim().toUpperCase());
        }
    };

    return (
        <Card className="rounded-[24px] p-6 shadow-neumorph-sm h-full flex flex-col justify-center">
            <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Analysis Target</h3>
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter ticker (e.g. NVDA)"
                    className="w-full bg-surface shadow-neumorph-pressed rounded-2xl py-4 pl-12 pr-4 text-primary font-bold focus:outline-none transition-all placeholder:text-slate-400 placeholder:font-medium uppercase"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/30">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-secondary font-bold uppercase">
                <span className="px-2 py-1 rounded-lg bg-surface shadow-neumorph-sm cursor-pointer hover:shadow-neumorph transition-all" onClick={() => setInput('TSLA')}>TSLA</span>
                <span className="px-2 py-1 rounded-lg bg-surface shadow-neumorph-sm cursor-pointer hover:shadow-neumorph transition-all" onClick={() => setInput('AAPL')}>AAPL</span>
                <span className="px-2 py-1 rounded-lg bg-surface shadow-neumorph-sm cursor-pointer hover:shadow-neumorph transition-all" onClick={() => setInput('MSFT')}>MSFT</span>
            </div>
        </Card>
    );
}
