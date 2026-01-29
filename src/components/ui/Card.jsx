import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                "bg-white border border-slate-200 rounded-2xl p-5 transition-shadow hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
