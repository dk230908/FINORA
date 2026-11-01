import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Plus,
  ShieldAlert,
  Target,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryBudget, ExpenseCategory } from '../../types/finance';
import {
  calculateBudgetStatus,
  calculateTotalExpenses,
  EXPENSE_CATEGORY_COLORS,
  filterTransactionsByMonth,
  formatCurrency,
} from '../../utils/financeMath';

interface BudgetsViewProps {
  onOpenCreateBudget: () => void;
  onEditBudget: (budget: CategoryBudget) => void;
  onDeleteBudget: (category: ExpenseCategory) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  onOpenCreateBudget,
  onEditBudget,
  onDeleteBudget,
}) => {
  const {
    budgets,
    transactions,
    settings,
    updateSettings,
    selectedMonth,
  } = useFinance();

  const [isEditingOverall, setIsEditingOverall] = useState(false);
  const [overallLimitInput, setOverallLimitInput] = useState(
    String(settings.overallMonthlyBudget)
  );

  // Month transactions
  const monthTx = filterTransactionsByMonth(transactions, selectedMonth);
  const totalSpentInMonth = calculateTotalExpenses(monthTx);

  // Overall status
  const overallStatus = calculateBudgetStatus(
    totalSpentInMonth,
    settings.overallMonthlyBudget
  );

  const handleSaveOverall = () => {
    const val = parseFloat(overallLimitInput);
    if (!isNaN(val) && val > 0) {
      updateSettings({ overallMonthlyBudget: val });
    }
    setIsEditingOverall(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#547D65]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#547D65] dark:text-[#B7D3B3]">
              Spending Discipline
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] tracking-tight mt-1">
            Monthly Budget Allocations
          </h2>
          <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
            Proactive threshold warnings at 75%, 90% and 100% capacity.
          </p>
        </div>

        <button
          onClick={onOpenCreateBudget}
          className="px-5 py-2.5 rounded-2xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-md hover:bg-[#203B31] active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Category Budget</span>
        </button>
      </div>

      {/* Overall Monthly Spending Limit Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#87918A]">
                Overall Monthly Limit
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  overallStatus.status === 'exceeded'
                    ? 'bg-[#D97878]/15 text-[#D97878]'
                    : overallStatus.status === 'exhausted'
                    ? 'bg-amber-500/15 text-amber-600'
                    : overallStatus.status === 'approaching'
                    ? 'bg-amber-500/15 text-amber-600'
                    : 'bg-[#4C9974]/15 text-[#4C9974]'
                }`}
              >
                {overallStatus.message}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight mt-1">
              {formatCurrency(totalSpentInMonth, settings.currency, settings.currencySymbol)}{' '}
              <span className="text-sm font-semibold text-[#87918A]">
                of {formatCurrency(settings.overallMonthlyBudget, settings.currency, settings.currencySymbol)} limit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditingOverall ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={overallLimitInput}
                  onChange={(e) => setOverallLimitInput(e.target.value)}
                  className="w-28 px-3 py-1.5 rounded-xl border border-[#547D65] text-xs font-bold bg-[#F7F8F5] dark:bg-[#0D1612]"
                />
                <button
                  onClick={handleSaveOverall}
                  className="px-3 py-1.5 rounded-xl bg-[#547D65] text-white text-xs font-bold"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOverallLimitInput(String(settings.overallMonthlyBudget));
                  setIsEditingOverall(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#87918A] hover:text-[#172B24] flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Adjust Overall Limit</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 rounded-full bg-[#E9ECE8] dark:bg-[#1A2E24] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallStatus.status === 'exceeded'
                ? 'bg-[#D97878]'
                : overallStatus.status === 'exhausted'
                ? 'bg-amber-500'
                : overallStatus.status === 'approaching'
                ? 'bg-amber-400'
                : 'bg-[#547D65]'
            }`}
            style={{ width: `${Math.min(100, overallStatus.percent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-[#87918A]">
          <span>
            {overallStatus.percent}% Budget Consumed
          </span>
          <span>
            {overallStatus.remaining >= 0
              ? `${formatCurrency(overallStatus.remaining, settings.currency, settings.currencySymbol)} Remaining`
              : `Exceeded by ${formatCurrency(Math.abs(overallStatus.remaining), settings.currency, settings.currencySymbol)}`}
          </span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
          // Calculate spend in this category for the month
          const spent = monthTx
            .filter((t) => t.type === 'expense' && t.category === b.category)
            .reduce((sum, t) => sum + Number(t.amount), 0);

          const status = calculateBudgetStatus(spent, b.monthlyLimit);
          const color = EXPENSE_CATEGORY_COLORS[b.category] || '#547D65';

          return (
            <div
              key={b.category}
              className={`p-6 rounded-3xl bg-white dark:bg-[#14221C] border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                status.status === 'exceeded'
                  ? 'border-[#D97878]/50 dark:border-[#D97878]/30'
                  : status.status === 'exhausted'
                  ? 'border-amber-400/50'
                  : 'border-[#E9ECE8] dark:border-[#1A2E24]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                    <h3 className="text-base font-extrabold text-[#172B24] dark:text-[#E6EFE9]">
                      {b.category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditBudget(b)}
                      aria-label={`Edit ${b.category} budget`}
                      className="p-1.5 rounded-lg text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529] hover:text-[#172B24]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(b.category)}
                      aria-label={`Delete ${b.category} budget`}
                      className="p-1.5 rounded-lg text-[#87918A] hover:bg-[#D97878]/10 hover:text-[#D97878]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  {status.status === 'exceeded' && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D97878]/15 text-[#D97878] text-[11px] font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>100%+ Exceeded</span>
                    </div>
                  )}
                  {status.status === 'exhausted' && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>90%+ Nearly Exhausted</span>
                    </div>
                  )}
                  {status.status === 'approaching' && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[11px] font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>75%+ Approaching Limit</span>
                    </div>
                  )}
                  {status.status === 'normal' && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4C9974]/15 text-[#4C9974] dark:text-[#68C59A] text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>On Track</span>
                    </div>
                  )}
                </div>

                {/* Amounts */}
                <div className="my-2">
                  <div className="text-2xl font-black text-[#172B24] dark:text-[#E6EFE9] tracking-tight">
                    {formatCurrency(spent, settings.currency, settings.currencySymbol)}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#87918A] mt-1">
                    <span>
                      Cap: {formatCurrency(b.monthlyLimit, settings.currency, settings.currencySymbol)}
                    </span>
                    <span className="font-extrabold text-[#172B24] dark:text-[#E6EFE9]">
                      {status.percent}%
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#E9ECE8] dark:bg-[#1A2E24] overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      status.status === 'exceeded'
                        ? 'bg-[#D97878]'
                        : status.status === 'exhausted'
                        ? 'bg-amber-500'
                        : status.status === 'approaching'
                        ? 'bg-amber-400'
                        : 'bg-[#547D65]'
                    }`}
                    style={{ width: `${Math.min(100, status.percent)}%` }}
                  />
                </div>

                <div className="text-xs text-[#87918A]">
                  {status.remaining >= 0 ? (
                    <span>
                      {formatCurrency(status.remaining, settings.currency, settings.currencySymbol)} left this month
                    </span>
                  ) : (
                    <span className="text-[#D97878] font-bold">
                      Over by {formatCurrency(Math.abs(status.remaining), settings.currency, settings.currencySymbol)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E9ECE8] dark:border-[#1A2E24] flex items-center justify-between text-[11px] text-[#87918A]">
                <span>Automatic trigger</span>
                <button
                  onClick={() => onEditBudget(b)}
                  className="font-bold text-[#547D65] dark:text-[#B7D3B3] hover:underline cursor-pointer"
                >
                  Modify Cap
                </button>
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full py-16 text-center rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24]">
            <Target className="w-12 h-12 mx-auto text-[#87918A] mb-2 opacity-50" />
            <h4 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
              No category budgets configured.
            </h4>
            <p className="text-xs text-[#87918A] mt-1 mb-4">
              Set spending limits for Food, Shopping, Utilities or Entertainment.
            </p>
            <button
              onClick={onOpenCreateBudget}
              className="px-5 py-2.5 rounded-2xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              + Create First Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
