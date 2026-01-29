import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                "bg-surface shadow-neumorph rounded-2xl p-5 transition-shadow",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
