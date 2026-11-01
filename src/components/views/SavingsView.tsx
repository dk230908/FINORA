import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  MoreVertical,
  PiggyBank,
  Plus,
  ShieldCheck,
  Target,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import {
  calculateNetSavings,
  calculateSavingsRate,
  calculateTotalExpenses,
  calculateTotalIncome,
  filterTransactionsByMonth,
  formatCurrency,
} from '../../utils/financeMath';

interface SavingsViewProps {
  onOpenCreateGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onOpenContribution: (goal: SavingsGoal, type?: 'deposit' | 'withdraw') => void;
  onDeleteGoal: (goal: SavingsGoal) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  onOpenCreateGoal,
  onEditGoal,
  onOpenContribution,
  onDeleteGoal,
}) => {
  const { savingsGoals, transactions, settings, selectedMonth } = useFinance();

  const [filterTab, setFilterTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Selected month calculations
  const monthTx = filterTransactionsByMonth(transactions, selectedMonth);
  const curIncome = calculateTotalIncome(monthTx);
  const curExpenses = calculateTotalExpenses(monthTx);
  const curNetSavings = calculateNetSavings(curIncome, curExpenses);
  const curSavingsRate = calculateSavingsRate(curNetSavings, curIncome);

  // Aggregated goals savings
  const totalSavedAcrossGoals = savingsGoals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTargetAcrossGoals = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const overallGoalsProgress =
    totalTargetAcrossGoals > 0
      ? Math.round((totalSavedAcrossGoals / totalTargetAcrossGoals) * 100)
      : 0;

  // Filter goals
  const filteredGoals = savingsGoals.filter((g) => {
    const isCompleted = g.savedAmount >= g.targetAmount && g.targetAmount > 0;
    if (filterTab === 'in_progress') return !isCompleted;
    if (filterTab === 'completed') return isCompleted;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#547D65]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#547D65] dark:text-[#B7D3B3]">
              Dedicated Wealth Vault
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] tracking-tight mt-1">
            Savings & Goal Portfolios
          </h2>
          <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
            Dedicated savings management decoupled from everyday expense outflows.
          </p>
        </div>

        <button
          onClick={onOpenCreateGoal}
          className="px-5 py-2.5 rounded-2xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-md hover:bg-[#203B31] active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Savings Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Savings Accumulated */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Total Goals Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#547D65]/12 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
            {formatCurrency(totalSavedAcrossGoals, settings.currency, settings.currencySymbol)}
          </div>
          <p className="text-xs text-[#87918A] mt-2">
            Across {savingsGoals.length} structured goals
          </p>
        </div>

        {/* Monthly Net Savings */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Monthly Net Savings
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#4C9974]/12 flex items-center justify-center text-[#4C9974] dark:text-[#68C59A]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl font-black tracking-tight ${
              curNetSavings >= 0
                ? 'text-[#4C9974] dark:text-[#68C59A]'
                : 'text-[#D97878]'
            }`}
          >
            {formatCurrency(curNetSavings, settings.currency, settings.currencySymbol)}
          </div>
          <p className="text-xs text-[#87918A] mt-2">
            Income minus expenses ({selectedMonth})
          </p>
        </div>

        {/* Savings Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Savings Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#B7D3B3]/25 flex items-center justify-center text-[#172B24] dark:text-[#B7D3B3]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
            {curSavingsRate}%
          </div>
          <p className="text-xs text-[#87918A] mt-2">
            Target benchmark: 20%+
          </p>
        </div>

        {/* Aggregate Target & Progress */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#87918A] dark:text-[#8FA196]">
              Total Target Pool
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#547D65]/12 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
            {formatCurrency(totalTargetAcrossGoals, settings.currency, settings.currencySymbol)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-[#87918A]">Overall Achieved</span>
            <span className="text-[#547D65] dark:text-[#B7D3B3]">
              {overallGoalsProgress}%
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate Progress Bar Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#172B24] dark:text-[#E6EFE9]">
            Cumulative Goal Funding Progress
          </span>
          <span className="text-[#547D65] dark:text-[#B7D3B3]">
            {formatCurrency(totalSavedAcrossGoals, settings.currency, settings.currencySymbol)} of{' '}
            {formatCurrency(totalTargetAcrossGoals, settings.currency, settings.currencySymbol)} ({overallGoalsProgress}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-[#E9ECE8] dark:bg-[#1A2E24] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#547D65] via-[#68C59A] to-[#B7D3B3] transition-all duration-700"
            style={{ width: `${Math.min(100, overallGoalsProgress)}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs (All / In Progress / Completed) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-2xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'all'
                ? 'bg-[#172B24] dark:bg-[#547D65] text-white shadow-xs'
                : 'text-[#87918A] hover:text-[#172B24]'
            }`}
          >
            All Goals ({savingsGoals.length})
          </button>
          <button
            onClick={() => setFilterTab('in_progress')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'in_progress'
                ? 'bg-[#172B24] dark:bg-[#547D65] text-white shadow-xs'
                : 'text-[#87918A] hover:text-[#172B24]'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === 'completed'
                ? 'bg-[#172B24] dark:bg-[#547D65] text-white shadow-xs'
                : 'text-[#87918A] hover:text-[#172B24]'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Savings Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const percent = Math.min(
            100,
            Math.round((goal.savedAmount / goal.targetAmount) * 100)
          );
          const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
          const isCompleted = percent >= 100;

          // Days remaining calculation
          const targetDateObj = new Date(goal.targetDate);
          const diffDays = Math.ceil(
            (targetDateObj.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
          );

          return (
            <div
              key={goal.id}
              className={`p-6 rounded-3xl bg-white dark:bg-[#14221C] border transition-all flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                isCompleted
                  ? 'border-[#B7D3B3] dark:border-[#2F5849]'
                  : 'border-[#E9ECE8] dark:border-[#1A2E24]'
              }`}
            >
              <div>
                {/* Header: Title, Category badge, Menu */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: goal.color || '#547D65' }}
                      />
                      <span className="text-[11px] font-bold text-[#87918A] uppercase tracking-wider">
                        {goal.category}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-[#172B24] dark:text-[#E6EFE9] line-clamp-1">
                      {goal.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGoal(goal)}
                      aria-label={`Edit ${goal.title}`}
                      className="p-1.5 rounded-lg text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529] hover:text-[#172B24]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteGoal(goal)}
                      aria-label={`Delete ${goal.title}`}
                      className="p-1.5 rounded-lg text-[#87918A] hover:bg-[#D97878]/10 hover:text-[#D97878]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Saved & Target */}
                <div className="my-3">
                  <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
                    {formatCurrency(goal.savedAmount, settings.currency, settings.currencySymbol)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#87918A] mt-1">
                    <span>
                      Target: {formatCurrency(goal.targetAmount, settings.currency, settings.currencySymbol)}
                    </span>
                    <span className="font-extrabold text-[#547D65] dark:text-[#B7D3B3]">
                      {percent}%
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#E9ECE8] dark:bg-[#1A2E24] overflow-hidden my-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color || '#547D65',
                    }}
                  />
                </div>

                {/* Target Date & Remaining */}
                <div className="flex items-center justify-between text-xs text-[#87918A] pt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{goal.targetDate}</span>
                  </div>
                  <span>
                    {isCompleted ? (
                      <span className="text-[#4C9974] dark:text-[#68C59A] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Target Met!
                      </span>
                    ) : (
                      <span>
                        {formatCurrency(remaining, settings.currency, settings.currencySymbol)} left
                      </span>
                    )}
                  </span>
                </div>

                {goal.notes && (
                  <p className="text-[11px] text-[#87918A] italic mt-2 line-clamp-2">
                    {goal.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons: Add Money & Withdraw */}
              <div className="mt-5 pt-4 border-t border-[#E9ECE8] dark:border-[#1A2E24] flex items-center gap-2">
                <button
                  onClick={() => onOpenContribution(goal, 'deposit')}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold hover:bg-[#203B31] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Add Money</span>
                </button>
                <button
                  onClick={() => onOpenContribution(goal, 'withdraw')}
                  disabled={goal.savedAmount <= 0}
                  className="py-2 px-3 rounded-xl border border-[#E9ECE8] dark:border-[#1A2E24] text-[#87918A] hover:text-[#172B24] hover:bg-[#F7F8F5] dark:hover:bg-[#101B15] text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Withdraw
                </button>
              </div>
            </div>
          );
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24]">
            <PiggyBank className="w-12 h-12 mx-auto text-[#87918A] mb-2 opacity-50" />
            <h4 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
              No savings goals found in this view.
            </h4>
            <p className="text-xs text-[#87918A] mt-1 mb-4">
              Set your financial targets for emergency buffer, tech gear, or travel.
            </p>
            <button
              onClick={onOpenCreateGoal}
              className="px-5 py-2.5 rounded-2xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              + Create First Savings Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
