import React from 'react';
import {
  ArrowLeftRight,
  Coins,
  LayoutDashboard,
  PieChart,
  PiggyBank,
  Plus,
  Target,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface MobileNavProps {
  onOpenAddTransaction: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenAddTransaction }) => {
  const { activeTab, setActiveTab } = useFinance();

  const mainItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Ledger', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'budgets', label: 'Budgets', icon: Target },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#101B15]/95 backdrop-blur-md border-t border-[#E9ECE8] dark:border-[#1A2E24] px-3 py-2 flex items-center justify-around shadow-lg transition-colors"
    >
      {mainItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              isActive
                ? 'text-[#547D65] dark:text-[#B7D3B3] font-bold'
                : 'text-[#87918A] dark:text-[#74877D] hover:text-[#17231E]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}

      {/* Floating Add Action */}
      <button
        onClick={onOpenAddTransaction}
        aria-label="Add transaction"
        className="w-11 h-11 -mt-4 rounded-full bg-[#172B24] dark:bg-[#547D65] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>
    </nav>
  );
};
