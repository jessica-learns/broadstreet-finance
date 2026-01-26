import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ variant = 'default', className, children }) {
    const variants = {
        default: "bg-surface text-secondary border border-gray-200",
        navy: "bg-primary text-white",
        outline: "border border-primary text-primary",
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
