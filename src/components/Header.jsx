import React from 'react';
import { Bell, User } from 'lucide-react';
import { NeumorphicButton } from './ui/Button';

export function Header() {
    return (
        <div className="relative w-full z-10 mb-8">
            {/* Main Capsule */}
            <div className="bg-surface rounded-full shadow-neumorph px-8 py-5 flex items-center justify-between">
                {/* Left: Profile/Brand */}
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-accent shadow-neumorph-sm flex items-center justify-center text-white font-black">
                        B
                    </div>
                    <span className="font-bold text-lg text-primary tracking-tight">BROADSTREET</span>
                </div>


                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <NeumorphicButton className="p-3 w-10 h-10 flex items-center justify-center font-normal">
                        <Bell size={20} />
                    </NeumorphicButton>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-300">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-black text-primary">Jessica Croll</div>
                            <div className="text-xs text-secondary font-bold uppercase tracking-wider">Portfolio Manager</div>
                        </div>
                        <NeumorphicButton className="p-1 w-10 h-10 flex items-center justify-center font-normal">
                            <User size={20} />
                        </NeumorphicButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
