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
                    <div className="w-10 h-10 rounded-full bg-surface shadow-neumorph-sm flex items-center justify-center text-primary font-black">
                        B
                    </div>
                    <span className="font-bold text-primary tracking-tight">BROADSTREET</span>
                </div>

                {/* Center: Context/Search */}
                {/* Center: Context/Search */}
                <div className="flex-1 max-w-xl mx-auto relative group z-10">
                    {/* "Light Source" - Focused Hot Spot */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] h-full bg-white blur-[40px] rounded-full pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-500"></div>

                    {/* Floating Search Bar - Navy Pill */}
                    <div className="relative bg-[#0f172a] shadow-xl shadow-slate-900/10 rounded-full px-6 py-4 flex items-center text-white ring-1 ring-white/10 input-ring transition-all duration-300 group-hover:scale-[1.01] overflow-hidden">

                        <Search size={18} className="mr-3 text-white/50" />
                        <input
                            type="text"
                            placeholder="Find Intelligence..."
                            className="bg-transparent border-none outline-none w-full text-base font-medium text-white placeholder:text-white/40 caret-white"
                        />
                        {/* Right Action Icon in Search */}
                        <div className="ml-2 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
                            <span className="text-white text-xs font-bold font-mono">⌘K</span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <NeumorphicButton className="p-3 w-10 h-10 flex items-center justify-center font-normal">
                        <Bell size={18} />
                    </NeumorphicButton>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-300">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-black text-primary">Jessica Croll</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Portfolio Manager</div>
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
