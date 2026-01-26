import React from 'react';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { NeumorphicButton } from './ui/Button';

export function Header() {
    return (
        <div className="relative w-full z-10 mb-8">
            {/* Backlight Glow */}
            <div className="absolute inset-0 bg-accent/40 blur-xl rounded-full transform scale-y-150 -z-10 opacity-60"></div>

            {/* Main Capsule */}
            <div className="bg-surface rounded-full shadow-neumorph px-6 py-4 flex items-center justify-between">
                {/* Left: Profile/Brand */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold shadow-inner">
                        B
                    </div>
                    <span className="font-semibold text-primary tracking-tight">BROADSTREET</span>
                </div>

                {/* Center: Context/Search */}
                {/* Center: Context/Search */}
                <div className="flex-1 max-w-xl mx-auto relative group z-10">
                    {/* "Light Source" - Focused Hot Spot */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-3/4 bg-amber-400/80 blur-[50px] rounded-full pointer-events-none mix-blend-screen opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Secondary Detail Glow (The "Filament") */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[1px] bg-white shadow-[0_0_20px_2px_rgba(255,179,71,0.8)] pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity duration-500"></div>

                    {/* Floating Search Bar */}
                    <div className="relative bg-[#0F172A] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] rounded-full px-6 py-4 flex items-center text-white ring-1 ring-white/10 input-ring transition-all duration-300 group-hover:scale-[1.01] overflow-hidden">
                        {/* Internal Reflection */}
                        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

                        <Search size={18} className="mr-3 text-white/90" />
                        <input
                            type="text"
                            placeholder="Search Results"
                            className="bg-transparent border-none outline-none w-full text-base font-medium text-white placeholder:text-white/60"
                        />
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <NeumorphicButton className="p-3 w-10 h-10 flex items-center justify-center font-normal">
                        <Bell size={18} />
                    </NeumorphicButton>
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200/50">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-primary">Alex Chen</div>
                            <div className="text-[10px] text-secondary font-medium">Head of Macro</div>
                        </div>
                        <NeumorphicButton className="p-1 w-10 h-10 flex items-center justify-center font-normal">
                            <User size={18} />
                        </NeumorphicButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
