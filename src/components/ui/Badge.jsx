import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ variant = 'default', className, children }) {
    const variants = {
        default: "bg-surface text-secondary shadow-neumorph",
        navy: "bg-primary text-white shadow-xl shadow-primary/30 border border-primary/10",
        success: "bg-slate-800 text-white shadow-xl shadow-slate-900/10 border border-slate-700/50",
        warning: "bg-orange-500 text-white shadow-xl shadow-orange-500/30 border border-orange-400/20",
        outline: "border-2 border-primary text-primary bg-transparent",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tabular-nums shadow-sm",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
