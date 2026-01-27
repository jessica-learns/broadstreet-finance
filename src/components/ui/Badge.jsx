import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ variant = 'default', className, children }) {
    const variants = {
        default: "bg-surface text-secondary shadow-neumorph",
        navy: "bg-primary text-white shadow-xl shadow-primary/30 border border-primary/10",
        accent: "bg-accent text-white shadow-xl shadow-accent/30 border border-accent/10",
        outline: "border-2 border-accent text-accent bg-transparent",
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
