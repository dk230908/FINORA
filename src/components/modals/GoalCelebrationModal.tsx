import React from 'react';
import { Award, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/financeMath';

export const GoalCelebrationModal: React.FC = () => {
  const { activeCelebrationGoal, dismissCelebration, settings } = useFinance();

  if (!activeCelebrationGoal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-[#14221C] rounded-3xl shadow-2xl border border-[#B7D3B3] dark:border-[#2F5849] p-6 text-center overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#B7D3B3]/30 dark:bg-[#547D65]/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#D9C8F0]/30 dark:bg-[#9F7AEA]/15 blur-2xl pointer-events-none" />

        <button
          onClick={dismissCelebration}
          aria-label="Close modal"
          className="absolute right-4 top-4 p-2 rounded-xl text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#547D65] to-[#B7D3B3] flex items-center justify-center shadow-lg text-white mb-4">
          <Award className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#547D65]/15 text-[#547D65] dark:text-[#B7D3B3] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Milestone Unlocked!</span>
        </div>

        <h3 className="text-xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] mb-1">
          Goal Accomplished!
        </h3>
        <p className="text-xs text-[#87918A] dark:text-[#8FA196] mb-4">
          You have successfully achieved your target for{' '}
          <strong className="text-[#172B24] dark:text-[#E6EFE9]">
            {activeCelebrationGoal.title}
          </strong>
          .
        </p>

        <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] mb-5">
          <span className="text-[11px] font-semibold text-[#87918A]">
            Total Saved
          </span>
          <div className="text-2xl font-black text-[#4C9974] dark:text-[#68C59A]">
            {formatCurrency(
              activeCelebrationGoal.savedAmount,
              settings.currency,
              settings.currencySymbol
            )}
          </div>
          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#547D65] dark:text-[#B7D3B3] mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Target Met</span>
          </div>
        </div>

        <button
          onClick={dismissCelebration}
          className="w-full py-3 rounded-2xl bg-[#172B24] dark:bg-[#547D65] text-white font-bold text-xs shadow-md hover:bg-[#203B31] transition-all cursor-pointer"
        >
          Continue Saving
        </button>
      </div>
    </div>
  );
};
