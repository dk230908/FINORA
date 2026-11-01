import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  CreditCard,
  Lightbulb,
  PiggyBank,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal, Transaction } from '../../types/finance';
import {
  calculateAvailableBalance,
  calculateBudgetStatus,
  calculateCategoryBreakdown,
  calculateNetSavings,
  calculateSavingsRate,
  calculateTotalExpenses,
  calculateTotalIncome,
  EXPENSE_CATEGORY_COLORS,
  filterTransactionsByMonth,
  formatCurrency,
  generateIntelligentInsights,
} from '../../utils/financeMath';

interface OverviewViewProps {
  onOpenAddTransaction: () => void;
  onOpenSavingsGoalModal: (goal?: SavingsGoal) => void;
  onOpenContributionModal: (goal: SavingsGoal) => void;
  onSelectCategoryFilter?: (category: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenAddTransaction,
  onOpenSavingsGoalModal,
  onOpenContributionModal,
}) => {
  const {
    transactions,
    savingsGoals,
    budgets,
    settings,
    selectedMonth,
    setSelectedMonth,
    setActiveTab,
  } = useFinance();

  // Transactions for selected month
  const currentMonthTx = filterTransactionsByMonth(transactions, selectedMonth);

  // Previous month transactions for MoM comparison
  const prevMonthKey =
    selectedMonth === '2026-11'
      ? '2026-10'
      : selectedMonth === '2026-10'
      ? '2026-09'
      : '';
  const prevMonthTx = prevMonthKey
    ? filterTransactionsByMonth(transactions, prevMonthKey)
    : [];

  // Summary Metrics
  const curIncome = calculateTotalIncome(currentMonthTx);
  const curExpenses = calculateTotalExpenses(currentMonthTx);
  const curNetSavings = calculateNetSavings(curIncome, curExpenses);
  const curSavingsRate = calculateSavingsRate(curNetSavings, curIncome);

  // All-time available balance
  const allIncome = calculateTotalIncome(transactions);
  const allExpenses = calculateTotalExpenses(transactions);
  const totalBalance = calculateAvailableBalance(
    settings.openingBalance,
    allIncome,
    allExpenses
  );

  // Prev month metrics for comparisons
  const prevExpenses = calculateTotalExpenses(prevMonthTx);
  const prevIncome = calculateTotalIncome(prevMonthTx);

  const expenseMoM =
    prevExpenses > 0
      ? Math.round(((curExpenses - prevExpenses) / prevExpenses) * 100)
      : 0;

  const incomeMoM =
    prevIncome > 0
      ? Math.round(((curIncome - prevIncome) / prevIncome) * 100)
      : 0;

  // Category breakdown for donut preview
  const expenseBreakdown = calculateCategoryBreakdown(currentMonthTx, 'expense');

  // Intelligent dynamic insights
  const insights = generateIntelligentInsights(
    currentMonthTx,
    prevMonthTx,
    budgets,
    savingsGoals,
    settings.currencySymbol
  );

  // Overall budget progress
  const overallSpent = curExpenses;
  const overallLimit = settings.overallMonthlyBudget;
  const overallBudgetStatus = calculateBudgetStatus(overallSpent, overallLimit);

  // Total savings accumulated
  const totalSavingsPool = savingsGoals.reduce((s, g) => s + g.savedAmount, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#172B24] via-[#203D32] to-[#2B5244] text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#B7D3B3]/10 blur-xl pointer-events-none" />
        <div className="absolute right-32 -bottom-10 w-36 h-36 rounded-full bg-[#D9C8F0]/10 blur-xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#B7D3B3] font-bold">
              Personal Wealth Portal
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7D3B3]" />
            <span className="text-xs text-[#E6EFE9]/80">
              {selectedMonth === 'all'
                ? 'All-Time Records'
                : selectedMonth === '2026-11'
                ? 'November 2026'
                : selectedMonth}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {settings.userName}!
          </h2>
          <p className="text-xs sm:text-sm text-[#D7E3DC] max-w-lg">
            Your finances are in healthy shape. You have saved{' '}
            <strong className="text-white">
              {formatCurrency(curNetSavings, settings.currency, settings.currencySymbol)}
            </strong>{' '}
            this month with a {curSavingsRate}% savings rate.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={() => setActiveTab('analytics')}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold transition-all border border-white/10"
          >
            Detailed Analytics
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="px-5 py-2.5 rounded-2xl bg-[#B7D3B3] hover:bg-[#A6C6A2] text-[#172B24] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Balance */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs relative group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#547D65]/12 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
            {formatCurrency(totalBalance, settings.currency, settings.currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[#87918A] dark:text-[#7A8E82]">Available funds</span>
            <span className="text-[11px] font-bold text-[#4C9974] dark:text-[#68C59A] bg-[#4C9974]/10 px-2 py-0.5 rounded-md">
              Active
            </span>
          </div>
        </div>

        {/* 2. Total Income */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Total Income
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#4C9974]/12 flex items-center justify-center text-[#4C9974] dark:text-[#68C59A]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#4C9974] dark:text-[#68C59A] tracking-tight">
            {formatCurrency(curIncome, settings.currency, settings.currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[#87918A] dark:text-[#7A8E82]">Selected month</span>
            {incomeMoM !== 0 && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  incomeMoM > 0
                    ? 'text-[#4C9974] bg-[#4C9974]/10'
                    : 'text-[#D97878] bg-[#D97878]/10'
                }`}
              >
                {incomeMoM > 0 ? `+${incomeMoM}%` : `${incomeMoM}%`} vs last mo
              </span>
            )}
          </div>
        </div>

        {/* 3. Total Expenses */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D97878]/12 flex items-center justify-center text-[#D97878]">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#D97878] tracking-tight">
            {formatCurrency(curExpenses, settings.currency, settings.currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[#87918A] dark:text-[#7A8E82]">Outflow</span>
            {expenseMoM !== 0 && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  expenseMoM < 0
                    ? 'text-[#4C9974] bg-[#4C9974]/10'
                    : 'text-[#D97878] bg-[#D97878]/10'
                }`}
              >
                {expenseMoM > 0 ? `+${expenseMoM}%` : `${expenseMoM}%`} vs last mo
              </span>
            )}
          </div>
        </div>

        {/* 4. Net Savings */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Net Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#547D65]/12 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              curNetSavings >= 0
                ? 'text-[#172B24] dark:text-[#E6EFE9]'
                : 'text-[#D97878]'
            }`}
          >
            {formatCurrency(curNetSavings, settings.currency, settings.currencySymbol)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-[#87918A] dark:text-[#7A8E82]">Savings rate</span>
            <span className="text-[11px] font-bold text-[#547D65] dark:text-[#B7D3B3] bg-[#547D65]/10 px-2 py-0.5 rounded-md">
              {curSavingsRate}% saved
            </span>
          </div>
        </div>
      </div>

      {/* Middle Row: Expense Donut Preview & Intelligent Financial Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Donut Chart Preview Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
                  Expense Distribution
                </h3>
                <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
                  Category share for {selectedMonth}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                aria-label="View all analytics"
                className="text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {expenseBreakdown.length > 0 ? (
              <div className="relative h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={75}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        formatCurrency(Number(val), settings.currency, settings.currencySymbol),
                        'Spent',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-bold text-[#87918A] dark:text-[#8FA196] uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-sm font-extrabold text-[#172B24] dark:text-[#E6EFE9]">
                    {formatCurrency(curExpenses, settings.currency, settings.currencySymbol)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                <p className="text-xs text-[#87918A]">
                  No expense records in this timeframe.
                </p>
                <button
                  onClick={onOpenAddTransaction}
                  className="mt-2 text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] hover:underline cursor-pointer"
                >
                  + Add Expense
                </button>
              </div>
            )}
          </div>

          {/* Top 3 categories list */}
          {expenseBreakdown.length > 0 && (
            <div className="mt-4 space-y-2 pt-4 border-t border-[#E9ECE8] dark:border-[#1A2E24]">
              {expenseBreakdown.slice(0, 3).map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-[#172B24] dark:text-[#E6EFE9]">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-[#87918A] dark:text-[#7A8E82] text-[11px]">
                      {item.percentage}%
                    </span>
                    <span className="text-[#172B24] dark:text-[#E6EFE9]">
                      {formatCurrency(item.amount, settings.currency, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Intelligent Financial Insights */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#547D65]/12 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
                    Smart Financial Insights
                  </h3>
                  <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
                    Real-time analysis from your activity
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#547D65]/10 text-[#547D65] dark:text-[#B7D3B3]">
                Live Engine
              </span>
            </div>

            <div className="space-y-3">
              {insights.length > 0 ? (
                insights.slice(0, 3).map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9]">
                        {ins.title}
                      </span>
                      {ins.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            ins.type === 'success'
                              ? 'bg-[#4C9974]/15 text-[#4C9974] dark:text-[#68C59A]'
                              : ins.type === 'warning'
                              ? 'bg-[#D97878]/15 text-[#D97878]'
                              : 'bg-[#547D65]/15 text-[#547D65] dark:text-[#B7D3B3]'
                          }`}
                        >
                          {ins.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5A6860] dark:text-[#A2B3A9] leading-relaxed">
                      {ins.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#87918A]">
                  Add more transactions to generate personalized financial insights.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E9ECE8] dark:border-[#1A2E24] flex items-center justify-between text-xs text-[#87918A]">
            <span>Monthly Budget status:</span>
            <span
              className={`font-bold ${
                overallBudgetStatus.status === 'exceeded'
                  ? 'text-[#D97878]'
                  : 'text-[#4C9974] dark:text-[#68C59A]'
              }`}
            >
              {overallBudgetStatus.percent}% used
            </span>
          </div>
        </div>

        {/* Savings Goals Preview Widget */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
                  Savings Milestones
                </h3>
                <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
                  {formatCurrency(totalSavingsPool, settings.currency, settings.currencySymbol)} saved across goals
                </p>
              </div>
              <button
                onClick={() => setActiveTab('savings')}
                aria-label="View all savings"
                className="text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {savingsGoals.slice(0, 3).map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.savedAmount / goal.targetAmount) * 100)
                );
                return (
                  <div
                    key={goal.id}
                    className="p-3 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: goal.color || '#547D65' }}
                        />
                        <span className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] line-clamp-1">
                          {goal.title}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#547D65] dark:text-[#B7D3B3]">
                        {percent}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-[#E9ECE8] dark:bg-[#1E3529] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color || '#547D65',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#87918A]">
                      <span>
                        {formatCurrency(goal.savedAmount, settings.currency, settings.currencySymbol)}
                      </span>
                      <span>
                        Target: {formatCurrency(goal.targetAmount, settings.currency, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onOpenSavingsGoalModal()}
            className="mt-4 w-full py-2.5 rounded-2xl border border-dashed border-[#547D65]/40 hover:border-[#547D65] hover:bg-[#547D65]/5 text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions Ledger */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
              Recent Activity
            </h3>
            <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
              Latest financial records
            </p>
          </div>
          <button
            onClick={() => setActiveTab('transactions')}
            aria-label="View all transactions"
            className="text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#E9ECE8] dark:divide-[#1A2E24]">
          {currentMonthTx.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="py-3.5 flex items-center justify-between hover:bg-[#F7F8F5]/60 dark:hover:bg-[#1A2E24]/30 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    t.type === 'income'
                      ? 'bg-[#4C9974]/15 text-[#4C9974] dark:text-[#68C59A]'
                      : 'bg-[#D97878]/15 text-[#D97878]'
                  }`}
                >
                  {t.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#172B24] dark:text-[#E6EFE9]">
                      {t.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E9ECE8] dark:bg-[#1E3529] font-semibold text-[#5A6860] dark:text-[#A2B3A9]">
                      {t.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#87918A] mt-0.5">
                    <span>{t.date}</span>
                    <span>•</span>
                    <span>{t.paymentMethod}</span>
                    {t.notes && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-xs">{t.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-sm font-extrabold ${
                    t.type === 'income'
                      ? 'text-[#4C9974] dark:text-[#68C59A]'
                      : 'text-[#172B24] dark:text-[#E6EFE9]'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}
                  {formatCurrency(t.amount, settings.currency, settings.currencySymbol)}
                </div>
              </div>
            </div>
          ))}

          {currentMonthTx.length === 0 && (
            <div className="py-8 text-center text-xs text-[#87918A]">
              No transactions recorded for this period.{' '}
              <button
                onClick={onOpenAddTransaction}
                className="font-bold text-[#547D65] dark:text-[#B7D3B3] hover:underline ml-1 cursor-pointer"
              >
                Record your first transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
