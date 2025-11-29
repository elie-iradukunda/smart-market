import React from 'react';
import { Search, Bell, Menu, Settings } from 'lucide-react';

interface TopbarProps {
    onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-blue-600 bg-gradient-to-r from-blue-700 to-blue-900 px-6 shadow-md transition-all">
            <button
                type="button"
                className="lg:hidden -ml-2 p-2 text-blue-100 hover:text-white"
                onClick={onMenuClick}
            >
                <Menu size={24} />
            </button>

            {/* Search Bar */}
            <div className="flex flex-1 items-center max-w-xl">
                <div className="relative w-full group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={18} className="text-blue-300 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-xl border border-blue-600 bg-blue-800/50 py-2 pl-10 pr-3 text-sm text-white placeholder:text-blue-300 focus:border-white/50 focus:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all shadow-sm"
                        placeholder="Search inventory, orders, suppliers..."
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <kbd className="hidden lg:inline-flex items-center gap-1 rounded border border-blue-600 bg-blue-800/50 px-1.5 font-sans text-[10px] font-medium text-blue-200">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                {/* Notifications */}
                <button className="relative rounded-full p-2 text-blue-100 hover:bg-white/10 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-blue-900" />
                </button>

                <div className="h-6 w-px bg-blue-600 hidden sm:block" />

                {/* Quick Actions / Profile */}
                <div className="flex items-center gap-3">
                    <button className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition-colors border border-white/10">
                        <Settings size={16} />
                        <span>Settings</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
