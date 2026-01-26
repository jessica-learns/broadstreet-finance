import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-surface rounded-3xl shadow-neumorph p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
