import React from 'react';
import { cn } from '../../lib/utils';

export function NeumorphicButton({ className, active, children, ...props }) {
    return (
        <button
            className={cn(
                "px-6 py-3 rounded-full font-semibold transition-all duration-200 outline-none",
                "text-primary bg-surface",
                active
                    ? "shadow-neumorph-pressed translate-y-[1px]"
                    : "shadow-neumorph hover:-translate-y-[1px] active:shadow-neumorph-pressed active:translate-y-[1px]",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
