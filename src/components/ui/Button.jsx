import React from 'react';
import { cn } from '../../lib/utils';

export function NeumorphicButton({ className, active, variant = "neumorph", children, ...props }) {
    const isSolid = variant === "solid";

    return (
        <button
            className={cn(
                "px-6 py-3 rounded-full font-semibold transition-all duration-300 outline-none",
                isSolid
                    ? "bg-primary text-white shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-[1px] active:translate-y-[1px]"
                    : "text-primary bg-surface",
                !isSolid && (active
                    ? "shadow-neumorph-pressed translate-y-[1px]"
                    : "shadow-neumorph hover:shadow-neumorph-hover hover:-translate-y-[1px] active:shadow-neumorph-pressed active:translate-y-[1px]"),
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
