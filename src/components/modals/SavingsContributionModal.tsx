import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, DollarSign, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { SavingsGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/financeMath';

interface SavingsContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  defaultType?: 'deposit' | 'withdraw';
}

export const SavingsContributionModal: React.FC<SavingsContributionModalProps> = ({
  isOpen,
  onClose,
  goal,
  defaultType = 'deposit',
}) => {
  const { contributeToGoal, settings } = useFinance();

  const [type, setType] = useState<'deposit' | 'withdraw'>(defaultType);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const handleQuickAdd = (val: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount(String(cur + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please specify an amount greater than 0.');
      return;
    }

    if (type === 'withdraw' && parsedAmount > goal.savedAmount) {
      setError(
        `Cannot withdraw more than current saved amount (${formatCurrency(
          goal.savedAmount,
          settings.currency,
          settings.currencySymbol
        )}).`
      );
      return;
    }

    const success = contributeToGoal(goal.id, parsedAmount, type, note.trim());
    if (success) {
      setAmount('');
      setNote('');
      onClose();
    }
  };

  const remainingToGoal = Math.max(0, goal.targetAmount - goal.savedAmount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#14221C] rounded-3xl shadow-2xl border border-[#E9ECE8] dark:border-[#1E3529] p-6 sm:p-7 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECE8] dark:border-[#1E3529]">
          <div>
            <h3 className="text-lg font-bold text-[#172B24] dark:text-[#E6EFE9]">
              {type === 'deposit' ? 'Add Funds to Goal' : 'Withdraw from Goal'}
            </h3>
            <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
              {goal.title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Goal summary mini card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#87918A]">
              Currently Saved
            </span>
            <div className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
              {formatCurrency(goal.savedAmount, settings.currency, settings.currencySymbol)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-[#87918A]">
              Target / Remaining
            </span>
            <div className="text-xs font-semibold text-[#547D65] dark:text-[#B7D3B3]">
              {formatCurrency(remainingToGoal, settings.currency, settings.currencySymbol)} to go
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-[#D97878]/15 border border-[#D97878]/30 text-xs font-semibold text-[#D97878]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Action Type switcher */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26]">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                type === 'deposit'
                  ? 'bg-white dark:bg-[#1A2E24] text-[#4C9974] dark:text-[#68C59A] shadow-xs'
                  : 'text-[#87918A]'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit (+ Savings)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('withdraw')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                type === 'withdraw'
                  ? 'bg-white dark:bg-[#1A2E24] text-[#D97878] shadow-xs'
                  : 'text-[#87918A]'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Amount ({settings.currencySymbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#87918A]">
                {settings.currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
              />
            </div>
            {/* Quick chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-[#87918A]">Quick:</span>
              {[1000, 5000, 10000, 25000].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleQuickAdd(c)}
                  className="px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-[#1E3529] hover:bg-[#E9ECE8] text-[11px] font-semibold text-[#172B24] dark:text-[#D7E3DC]"
                >
                  +{settings.currencySymbol}{c.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Monthly transfer, Festival bonus"
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
              {type === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
