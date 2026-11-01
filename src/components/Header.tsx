import React from 'react';
import {
  Calendar,
  ChevronDown,
  Moon,
  Plus,
  Search,
  Sun,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface HeaderProps {
  onOpenAddTransaction: () => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction }) => {
  const { settings, updateSettings, selectedMonth, setSelectedMonth, setActiveTab } =
    useFinance();

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-[#F7F8F5]/90 dark:bg-[#0D1612]/90 backdrop-blur-md border-b border-[#E9ECE8] dark:border-[#1A2E24] transition-colors">
      {/* Brand logo & Greetings */}
      <div className="flex items-center gap-3.5">
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 cursor-pointer group"
          role="button"
          tabIndex={0}
          aria-label="Finora Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#172B24] via-[#547D65] to-[#B7D3B3] flex items-center justify-center shadow-sm text-white font-bold text-lg tracking-tight group-hover:scale-105 transition-transform">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-[#172B24] dark:text-[#E6EFE9]">
                FINORA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#B7D3B3]/40 text-[#172B24] dark:bg-[#547D65]/40 dark:text-[#B7D3B3]">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#87918A] dark:text-[#8FA196] hidden sm:block">
              Take control of your money
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Month Selector & Date */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-medium text-[#17231E] dark:text-[#D7E3DC] shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#547D65] dark:text-[#B7D3B3]" />
          <span>{formattedDate}</span>
        </div>

        {/* Month Filter Selector */}
        <div className="relative">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Select month"
            className="appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#547D65]/40"
          >
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="all">All Time</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#87918A] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Actions: Quick Add, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button */}
        <button
          onClick={onOpenAddTransaction}
          aria-label="Add transaction"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white hover:bg-[#223F35] dark:hover:bg-[#436451] active:scale-95 transition-all text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1B2F26] text-[#17231E] dark:text-[#D7E3DC] hover:bg-[#F2F5F3] dark:hover:bg-[#1B2F26] transition-colors shadow-xs"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#E5A93C]" />
          ) : (
            <Moon className="w-4 h-4 text-[#547D65]" />
          )}
        </button>

        {/* Profile Avatar / Settings link */}
        <button
          onClick={() => setActiveTab('settings')}
          aria-label="Open settings"
          className="flex items-center gap-2 p-1 rounded-xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1B2F26] hover:ring-2 hover:ring-[#547D65]/30 transition-all shadow-xs"
        >
          <img
            src={settings.avatar}
            alt={settings.userName}
            className="w-7 h-7 rounded-lg object-cover"
          />
          <span className="text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] hidden lg:inline pr-1.5">
            {settings.userName}
          </span>
        </button>
      </div>
    </header>
  );
};
