import React from 'react';
import {
  ArrowDownLeft,
  Briefcase,
  Calendar,
  Coins,
  DollarSign,
  Plus,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { IncomeCategory, Transaction } from '../../types/finance';
import {
  calculateCategoryBreakdown,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCurrency,
  INCOME_CATEGORY_COLORS,
} from '../../utils/financeMath';

interface IncomeViewProps {
  onOpenAddIncome: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const IncomeView: React.FC<IncomeViewProps> = ({
  onOpenAddIncome,
  onEditTransaction,
}) => {
  const { transactions, settings, selectedMonth } = useFinance();

  // Income transactions for selected month
  const currentMonthTx = filterTransactionsByMonth(transactions, selectedMonth);
  const currentMonthIncome = calculateTotalIncome(currentMonthTx);

  // All-time income
  const totalAllTimeIncome = calculateTotalIncome(transactions);

  // All income records
  const allIncomeTx = transactions
    .filter((t) => t.type === 'income')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Income sources breakdown
  const incomeSources = calculateCategoryBreakdown(transactions, 'income');

  // Monthly trend data
  const monthlyTrendMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'income')
    .forEach((t) => {
      const monthKey = t.date.substring(0, 7); // '2026-11'
      monthlyTrendMap[monthKey] = (monthlyTrendMap[monthKey] || 0) + Number(t.amount);
    });

  const trendData = Object.keys(monthlyTrendMap)
    .sort()
    .map((monthKey) => {
      const date = new Date(`${monthKey}-01`);
      const label = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      return {
        monthKey,
        label,
        income: monthlyTrendMap[monthKey],
      };
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4C9974]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4C9974] dark:text-[#68C59A]">
              Revenue & Cashflow
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] tracking-tight mt-1">
            Income Streams & Growth
          </h2>
          <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
            Analyze salary, client retainers, dividends and consulting inflows.
          </p>
        </div>

        <button
          onClick={onOpenAddIncome}
          className="px-5 py-2.5 rounded-2xl bg-[#4C9974] hover:bg-[#3D8262] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Income Record</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A]">
              Selected Month Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#4C9974]/15 flex items-center justify-center text-[#4C9974]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#4C9974] tracking-tight">
            {formatCurrency(currentMonthIncome, settings.currency, settings.currencySymbol)}
          </div>
          <p className="text-xs text-[#87918A] mt-2">
            Active period: {selectedMonth}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A]">
              Total Cumulative Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#547D65]/15 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
            {formatCurrency(totalAllTimeIncome, settings.currency, settings.currencySymbol)}
          </div>
          <p className="text-xs text-[#87918A] mt-2">
            Across {allIncomeTx.length} income transactions
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A]">
              Active Streams
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#3182CE]/15 flex items-center justify-center text-[#3182CE]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
            {incomeSources.length} Sources
          </div>
          <p className="text-xs text-[#87918A] mt-2">
            Top: {incomeSources[0]?.category || 'None'}
          </p>
        </div>
      </div>

      {/* Income Trend Chart */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
            Monthly Income Trend
          </h3>
          <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
            Historical cash generation pattern
          </p>
        </div>

        {trendData.length > 0 ? (
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#87918A' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#87918A' }}
                  tickLine={false}
                  tickFormatter={(v) => `${settings.currencySymbol}${v >= 1000 ? `${v / 1000}k` : v}`}
                />
                <Tooltip
                  formatter={(val: any) => [
                    formatCurrency(Number(val), settings.currency, settings.currencySymbol),
                    'Income',
                  ]}
                />
                <Bar dataKey="income" fill="#4C9974" radius={[8, 8, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.monthKey === selectedMonth ? '#547D65' : '#4C9974'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#87918A]">
            No income trend data available.
          </div>
        )}
      </div>

      {/* Income Sources Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Cards */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
            Income Stream Breakdown
          </h3>

          <div className="space-y-3">
            {incomeSources.map((source) => (
              <div
                key={source.category}
                className="p-3.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <div>
                    <span className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9]">
                      {source.category}
                    </span>
                    <span className="text-[11px] text-[#87918A] block">
                      {source.count} deposit{source.count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-[#4C9974] dark:text-[#68C59A]">
                    {formatCurrency(source.amount, settings.currency, settings.currencySymbol)}
                  </div>
                  <span className="text-[10px] font-semibold text-[#87918A]">
                    {source.percentage}%
                  </span>
                </div>
              </div>
            ))}

            {incomeSources.length === 0 && (
              <div className="py-6 text-center text-xs text-[#87918A]">
                No income categories recorded.
              </div>
            )}
          </div>
        </div>

        {/* Income History List */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
            Recent Income Deposits
          </h3>

          <div className="divide-y divide-[#E9ECE8] dark:divide-[#1A2E24]">
            {allIncomeTx.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                onClick={() => onEditTransaction(tx)}
                className="py-3 flex items-center justify-between hover:bg-[#F7F8F5] dark:hover:bg-[#101B15] px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4C9974]/15 text-[#4C9974] flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9]">
                      {tx.title}
                    </div>
                    <div className="text-[11px] text-[#87918A]">
                      {tx.date} • {tx.paymentMethod}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-extrabold text-[#4C9974] dark:text-[#68C59A]">
                  +{formatCurrency(tx.amount, settings.currency, settings.currencySymbol)}
                </div>
              </div>
            ))}

            {allIncomeTx.length === 0 && (
              <div className="py-8 text-center text-xs text-[#87918A]">
                No income records to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
