import React, { useEffect, useState } from 'react';
import { Target, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CategoryBudget, ExpenseCategory } from '../../types/finance';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBudget?: CategoryBudget | null;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Education',
  'Bills & Utilities',
  'Health',
  'Travel',
  'Personal Care',
  'Subscriptions',
  'Other',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  editingBudget,
}) => {
  const { updateBudget, budgets, settings } = useFinance();

  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setLimit(String(editingBudget.monthlyLimit));
    } else {
      // Find first category without a budget
      const existingCategories = budgets.map((b) => b.category);
      const available = EXPENSE_CATEGORIES.find(
        (c) => !existingCategories.includes(c)
      );
      setCategory(available || 'Food & Dining');
      setLimit('');
    }
    setError(null);
  }, [editingBudget, isOpen, budgets]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Please provide a monthly limit greater than 0.');
      return;
    }

    updateBudget(category, parsedLimit);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#14221C] rounded-3xl shadow-2xl border border-[#E9ECE8] dark:border-[#1E3529] p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECE8] dark:border-[#1E3529]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#547D65]/15 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#172B24] dark:text-[#E6EFE9]">
                {editingBudget ? 'Adjust Budget Limit' : 'Set Category Budget'}
              </h3>
              <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
                Automate spending discipline with smart alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#D97878]/15 border border-[#D97878]/30 text-xs font-semibold text-[#D97878]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Category *
            </label>
            <select
              value={category}
              disabled={!!editingBudget}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65] disabled:opacity-60"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Monthly Limit ({settings.currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#87918A]">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                required
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="15000"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-lg font-extrabold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
              />
            </div>
            {/* Quick presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-[#87918A]">Presets:</span>
              {[5000, 10000, 15000, 20000, 30000].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setLimit(String(p))}
                  className="px-2 py-1 rounded-lg bg-[#F7F8F5] dark:bg-[#1E3529] hover:bg-[#E9ECE8] text-[11px] font-semibold text-[#172B24] dark:text-[#D7E3DC]"
                >
                  {settings.currencySymbol}{p.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs text-[#87918A] space-y-1">
            <p className="font-semibold text-[#172B24] dark:text-[#E6EFE9]">Smart Warning Triggers:</p>
            <p>• 75%: Approaching limit notification</p>
            <p>• 90%: Budget nearly exhausted warning</p>
            <p>• 100%: Budget exceeded alert</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9ECE8] dark:border-[#1E3529]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#87918A] hover:bg-[#F7F8F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold hover:bg-[#203B31] shadow-md active:scale-95 transition-all"
            >
              {editingBudget ? 'Save Changes' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
