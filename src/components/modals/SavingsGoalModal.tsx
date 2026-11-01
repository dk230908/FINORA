import React, { useEffect, useState } from 'react';
import { Target, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGoal?: SavingsGoal | null;
}

const GOAL_CATEGORIES = [
  'Emergency Fund',
  'Tech Upgrade',
  'Travel Fund',
  'Education',
  'Automobile',
  'Real Estate',
  'Personal Goals',
  'Wedding & Events',
  'Other',
];

const COLOR_OPTIONS = [
  '#547D65', // Forest green
  '#3182CE', // Blue
  '#9F7AEA', // Violet
  '#E5A93C', // Amber
  '#38B2AC', // Teal
  '#ED64A6', // Rose
  '#D97878', // Coral
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  editingGoal,
}) => {
  const { addSavingsGoal, editSavingsGoal, settings } = useFinance();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState(GOAL_CATEGORIES[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetAmount(String(editingGoal.targetAmount));
      setInitialDeposit('');
      setTargetDate(editingGoal.targetDate);
      setCategory(editingGoal.category || GOAL_CATEGORIES[0]);
      setColor(editingGoal.color || COLOR_OPTIONS[0]);
      setNotes(editingGoal.notes || '');
    } else {
      setTitle('');
      setTargetAmount('');
      setInitialDeposit('');
      // Default to 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetDate(d.toISOString().split('T')[0]);
      setCategory(GOAL_CATEGORIES[0]);
      setColor(COLOR_OPTIONS[0]);
      setNotes('');
    }
    setError(null);
  }, [editingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Please provide a valid target amount greater than 0.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a goal title.');
      return;
    }

    if (!targetDate) {
      setError('Please select a target deadline.');
      return;
    }

    if (editingGoal) {
      editSavingsGoal(editingGoal.id, {
        title: title.trim(),
        targetAmount: target,
        targetDate,
        category,
        color,
        notes: notes.trim(),
      });
    } else {
      const initDep = parseFloat(initialDeposit) || 0;
      addSavingsGoal({
        title: title.trim(),
        targetAmount: target,
        initialDeposit: initDep,
        targetDate,
        category,
        color,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#14221C] rounded-3xl shadow-2xl border border-[#E9ECE8] dark:border-[#1E3529] p-6 sm:p-7 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECE8] dark:border-[#1E3529]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#547D65]/15 flex items-center justify-center text-[#547D65] dark:text-[#B7D3B3]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#172B24] dark:text-[#E6EFE9]">
                {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
                Target high-impact milestones with disciplined saving
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
              Goal Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Emergency Fund (6 Months), New MacBook, Japan Trip"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-sm font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
                Target Amount ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="100000"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-sm font-extrabold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
                Target Date *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
              />
            </div>
          </div>

          {!editingGoal && (
            <div>
              <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
                Initial Deposit ({settings.currencySymbol}) (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-sm text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
              />
              <p className="text-[11px] text-[#87918A] mt-1">
                Allocated from your existing savings funds.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            >
              {GOAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Color tag selection */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-[#172B24] dark:ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Account details, rules, milestone checkpoints"
              className="w-full px-4 py-2 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            />
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
              {editingGoal ? 'Save Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
