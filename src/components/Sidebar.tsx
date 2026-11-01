import React from 'react';
import {
  ArrowLeftRight,
  ChevronRight,
  Coins,
  LayoutDashboard,
  PieChart,
  PiggyBank,
  Settings,
  ShieldCheck,
  Target,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  calculateAvailableBalance,
  calculateTotalExpenses,
  calculateTotalIncome,
  formatCurrency,
} from '../utils/financeMath';

interface SidebarProps {
  onOpenAddTransaction: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAddTransaction }) => {
  const {
    activeTab,
    setActiveTab,
    transactions,
    settings,
    selectedMonth,
  } = useFinance();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'income', label: 'Income', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Quick balance calculation
  const totalInc = calculateTotalIncome(transactions);
  const totalExp = calculateTotalExpenses(transactions);
  const availBalance = calculateAvailableBalance(
    settings.openingBalance,
    totalInc,
    totalExp
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-[#E9ECE8] dark:border-[#1A2E24] bg-white dark:bg-[#101B15] p-5 shrink-0 min-h-[calc(100vh-65px)] justify-between transition-colors">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-[#87918A] dark:text-[#6C7E74] mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#547D65]/12 text-[#172B24] dark:text-[#B7D3B3] font-bold shadow-2xs'
                    : 'text-[#5A6860] dark:text-[#A2B3A9] hover:bg-[#F7F8F5] dark:hover:bg-[#14221C] hover:text-[#17231E]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#547D65] dark:text-[#B7D3B3]'
                        : 'text-[#87918A] dark:text-[#74877D]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-4 rounded-full bg-[#547D65] dark:bg-[#B7D3B3]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Available Balance Widget & Pro badge */}
      <div className="space-y-3 pt-6 border-t border-[#E9ECE8] dark:border-[#1A2E24]">
        <div className="p-3.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1B2F26]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#87918A] dark:text-[#8FA196]">
              Total Balance
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#4C9974]/15 text-[#4C9974] dark:text-[#68C59A] font-semibold">
              Live
            </span>
          </div>
          <div className="text-lg font-extrabold text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
            {formatCurrency(availBalance, settings.currency, settings.currencySymbol)}
          </div>
          <p className="text-[11px] text-[#87918A] dark:text-[#7A8E82] mt-1">
            Including opening balance
          </p>
        </div>

        <button
          onClick={onOpenAddTransaction}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#172B24] to-[#25463A] hover:from-[#203B31] hover:to-[#2F5849] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>+ Quick Record</span>
        </button>
      </div>
    </aside>
  );
};
