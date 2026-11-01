import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  CreditCard,
  Filter,
  PieChart as PieIcon,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory, TimeframeFilter, Transaction } from '../../types/finance';
import {
  calculateCategoryBreakdown,
  calculateTotalExpenses,
  EXPENSE_CATEGORY_COLORS,
  filterTransactionsByMonth,
  filterTransactionsByTimeframe,
  formatCurrency,
} from '../../utils/financeMath';

interface AnalyticsViewProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
}) => {
  const { transactions, settings, selectedMonth } = useFinance();

  const [timeframe, setTimeframe] = useState<TimeframeFilter>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Filter transactions based on selected timeframe
  let baseTransactions: Transaction[] = [];

  if (timeframe === 'weekly') {
    baseTransactions = filterTransactionsByTimeframe(transactions, 'weekly');
  } else if (timeframe === 'yearly') {
    baseTransactions = filterTransactionsByTimeframe(transactions, 'yearly');
  } else {
    // Monthly: respects selectedMonth or current month
    baseTransactions = filterTransactionsByMonth(transactions, selectedMonth);
  }

  // Calculate expense category breakdown
  const categoryBreakdown = calculateCategoryBreakdown(baseTransactions, 'expense');
  const totalExpense = calculateTotalExpenses(baseTransactions);

  // Filtered transactions for the clicked category drill-down
  const categoryTransactions = selectedCategory
    ? baseTransactions.filter(
        (t) => t.type === 'expense' && t.category === selectedCategory
      )
    : [];

  const handlePieClick = (data: any, index: number) => {
    if (selectedCategory === data.category) {
      setSelectedCategory(null);
      setActiveIndex(null);
    } else {
      setSelectedCategory(data.category);
      setActiveIndex(index);
    }
  };

  const clearCategorySelection = () => {
    setSelectedCategory(null);
    setActiveIndex(null);
  };

  // Find active segment info
  const activeSegment =
    activeIndex !== null && categoryBreakdown[activeIndex]
      ? categoryBreakdown[activeIndex]
      : selectedCategory
      ? categoryBreakdown.find((c) => c.category === selectedCategory)
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header and Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#547D65]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#547D65] dark:text-[#B7D3B3]">
              Expense Analytics Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] tracking-tight mt-1">
            Category Spending Distribution
          </h2>
          <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
            Interactive donut analytics dynamically mapped from your actual transactions.
          </p>
        </div>

        {/* Timeframe Filter Buttons: Weekly, Monthly, Yearly */}
        <div className="flex items-center p-1 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] self-start sm:self-auto">
          {(['weekly', 'monthly', 'yearly'] as TimeframeFilter[]).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                clearCategorySelection();
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                timeframe === tf
                  ? 'bg-white dark:bg-[#1A2E24] text-[#172B24] dark:text-[#E6EFE9] shadow-xs'
                  : 'text-[#87918A] hover:text-[#172B24] dark:hover:text-[#E6EFE9]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Donut Chart & Category Legend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: The Interactive Donut Chart */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs flex flex-col items-center justify-center relative">
          <div className="w-full flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-[#87918A] uppercase tracking-wider">
              {timeframe} Expense Donut
            </div>
            {selectedCategory && (
              <button
                onClick={clearCategorySelection}
                className="px-2.5 py-1 rounded-lg bg-[#547D65]/10 text-[#547D65] dark:text-[#B7D3B3] text-xs font-bold flex items-center gap-1 hover:bg-[#547D65]/20 cursor-pointer"
              >
                <span>Filtered: {selectedCategory}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {categoryBreakdown.length > 0 ? (
            <div className="relative w-full h-80 sm:h-96 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={3}
                    stroke="none"
                    onClick={(entry, idx) => handlePieClick(entry, idx)}
                    cursor="pointer"
                    onMouseEnter={(_, idx) => setActiveIndex(idx)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {categoryBreakdown.map((entry, index) => {
                      const isSelected = selectedCategory === entry.category;
                      const isHovered = activeIndex === index;
                      const opacity =
                        selectedCategory && !isSelected ? 0.45 : isHovered ? 0.9 : 1;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          opacity={opacity}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-2xl bg-[#172B24] text-white text-xs shadow-xl border border-white/10 space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              <span className="font-bold">{data.category}</span>
                            </div>
                            <div className="text-sm font-extrabold text-[#B7D3B3]">
                              {formatCurrency(
                                data.amount,
                                settings.currency,
                                settings.currencySymbol
                              )}
                            </div>
                            <div className="text-[11px] text-white/80">
                              {data.percentage}% of total expenses ({data.count} items)
                            </div>
                            <div className="text-[10px] text-white/60 italic mt-1">
                              Click segment to filter transactions
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                <span className="text-xs font-bold text-[#87918A] dark:text-[#8FA196] uppercase tracking-wider">
                  {activeSegment ? activeSegment.category : 'Total Expenses'}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight my-1">
                  {formatCurrency(
                    activeSegment ? activeSegment.amount : totalExpense,
                    settings.currency,
                    settings.currencySymbol
                  )}
                </span>
                <span className="text-xs font-semibold text-[#547D65] dark:text-[#B7D3B3] bg-[#547D65]/10 px-2.5 py-0.5 rounded-full">
                  {activeSegment
                    ? `${activeSegment.percentage}% of total`
                    : `${categoryBreakdown.length} active categories`}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center">
              <PieIcon className="w-12 h-12 mx-auto text-[#87918A] mb-2 opacity-50" />
              <p className="text-sm font-bold text-[#172B24] dark:text-[#E6EFE9]">
                No expense data for this timeframe.
              </p>
              <p className="text-xs text-[#87918A] mt-1">
                Add your transactions to populate this interactive chart.
              </p>
              <button
                onClick={onOpenAddTransaction}
                className="mt-4 px-4 py-2 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                + Record Expense
              </button>
            </div>
          )}

          <p className="text-[11px] text-[#87918A] mt-2 text-center">
            💡 Tip: Hover to inspect. Click any category segment or legend item to drill down into its transactions.
          </p>
        </div>

        {/* Right Column: Interactive Category Legend & Spending Percentage List */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E9ECE8] dark:border-[#1A2E24] mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#87918A] dark:text-[#8FA196]">
                Category Breakdown
              </span>
              <span className="text-xs text-[#87918A] dark:text-[#7A8E82]">
                {categoryBreakdown.length} categories
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {categoryBreakdown.map((item) => {
                const isSelected = selectedCategory === item.category;
                return (
                  <div
                    key={item.category}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategory(null);
                      } else {
                        setSelectedCategory(item.category);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#547D65] bg-[#547D65]/10 shadow-xs'
                        : 'border-[#E9ECE8] dark:border-[#1A2E24] hover:bg-[#F7F8F5] dark:hover:bg-[#101B15]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9]">
                          {item.category}
                        </div>
                        <div className="text-[10px] text-[#87918A]">
                          {item.count} transaction{item.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-[#172B24] dark:text-[#E6EFE9]">
                        {formatCurrency(item.amount, settings.currency, settings.currencySymbol)}
                      </div>
                      <div className="text-[11px] font-bold text-[#547D65] dark:text-[#B7D3B3]">
                        {item.percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}

              {categoryBreakdown.length === 0 && (
                <div className="py-12 text-center text-xs text-[#87918A]">
                  No breakdown items available.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9ECE8] dark:border-[#1A2E24] flex items-center justify-between text-xs">
            <span className="font-semibold text-[#87918A]">
              Total Incurred:
            </span>
            <span className="text-sm font-black text-[#D97878]">
              {formatCurrency(totalExpense, settings.currency, settings.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Category-wise Spending Breakdown with Progress Bars */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
              Spending Share & Progress Bars
            </h3>
            <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
              Visual distribution of expenses sorted by highest spend
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {categoryBreakdown.map((item) => (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-bold text-[#172B24] dark:text-[#E6EFE9]">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#87918A] font-semibold">
                    {item.percentage}%
                  </span>
                  <span className="font-extrabold text-[#172B24] dark:text-[#E6EFE9]">
                    {formatCurrency(item.amount, settings.currency, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-[#E9ECE8] dark:bg-[#1A2E24] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}

          {categoryBreakdown.length === 0 && (
            <p className="text-xs text-[#87918A] text-center py-4">
              No categories to display.
            </p>
          )}
        </div>
      </div>

      {/* Drill-down: Category Transactions Table (revealed on segment click) */}
      {selectedCategory && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14221C] border border-[#547D65]/40 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9ECE8] dark:border-[#1A2E24]">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{
                  backgroundColor:
                    EXPENSE_CATEGORY_COLORS[selectedCategory as ExpenseCategory] ||
                    '#547D65',
                }}
              />
              <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
                Transactions for {selectedCategory} ({categoryTransactions.length})
              </h3>
            </div>
            <button
              onClick={clearCategorySelection}
              className="text-xs font-bold text-[#87918A] hover:text-[#172B24] flex items-center gap-1"
            >
              <span>Close Filter</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-[#E9ECE8] dark:divide-[#1A2E24]">
            {categoryTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                className="py-3 flex items-center justify-between hover:bg-[#F7F8F5] dark:hover:bg-[#101B15] px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9]">
                    {tx.title}
                  </div>
                  <div className="text-[11px] text-[#87918A]">
                    {tx.date} • {tx.paymentMethod} {tx.notes ? `• ${tx.notes}` : ''}
                  </div>
                </div>
                <div className="text-xs font-extrabold text-[#D97878]">
                  -{formatCurrency(tx.amount, settings.currency, settings.currencySymbol)}
                </div>
              </div>
            ))}

            {categoryTransactions.length === 0 && (
              <div className="py-6 text-center text-xs text-[#87918A]">
                No transactions recorded under {selectedCategory}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
