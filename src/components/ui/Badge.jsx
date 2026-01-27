import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ variant = 'default', className, children }) {
    const variants = {
        default: "bg-surface text-secondary shadow-neumorph-sm",
        primary: "bg-primary text-white",
        accent: "bg-accent text-white",
        outline: "border border-primary/20 text-primary bg-transparent",
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
