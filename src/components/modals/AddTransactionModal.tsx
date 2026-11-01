import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CreditCard,
  FileText,
  Tag,
  Wallet,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  ExpenseCategory,
  IncomeCategory,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../../types/finance';
import {
  EXPENSE_CATEGORY_COLORS,
  INCOME_CATEGORY_COLORS,
} from '../../utils/financeMath';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
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

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Allowance',
  'Freelancing',
  'Business',
  'Investments',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Cash',
  'Other',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
}) => {
  const { addTransaction, editTransaction, settings } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('Food & Dining');
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod);
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('Food & Dining');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setNotes('');
    }
    setError(null);
  }, [editingTransaction, isOpen]);

  // When switching type, reset default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('Food & Dining');
    } else {
      setCategory('Salary');
    }
  };

  const handleQuickAmount = (val: number) => {
    const current = Number(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a transaction title.');
      return;
    }

    if (editingTransaction) {
      editTransaction(editingTransaction.id, {
        title: title.trim(),
        amount: parsedAmount,
        type,
        category: category as any,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    } else {
      addTransaction({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category: category as any,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#14221C] rounded-3xl shadow-2xl border border-[#E9ECE8] dark:border-[#1E3529] p-6 sm:p-7 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECE8] dark:border-[#1E3529]">
          <div>
            <h3
              id="modal-title"
              className="text-lg font-bold text-[#172B24] dark:text-[#E6EFE9]"
            >
              {editingTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h3>
            <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
              {editingTransaction
                ? 'Update transaction details below'
                : 'Fast entry in seconds'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-[#D97878]/15 border border-[#D97878]/30 text-xs font-semibold text-[#D97878]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Selector (Expense vs Income) */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26]">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-white dark:bg-[#1A2E24] text-[#D97878] shadow-xs'
                  : 'text-[#87918A] hover:text-[#172B24]'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-white dark:bg-[#1A2E24] text-[#4C9974] dark:text-[#68C59A] shadow-xs'
                  : 'text-[#87918A] hover:text-[#172B24]'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount Input with quick denomination pills */}
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
            {/* Quick amount chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-[#87918A] mr-1">Quick Add:</span>
              {[100, 500, 1000, 2000, 5000].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleQuickAmount(chip)}
                  className="px-2.5 py-1 rounded-lg bg-[#F7F8F5] dark:bg-[#1E3529] hover:bg-[#E9ECE8] text-[11px] font-semibold text-[#172B24] dark:text-[#D7E3DC] transition-colors"
                >
                  +{settings.currencySymbol}{chip}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Title / Payee *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Swiggy gourmet, Uber ride, Salary deposit"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-sm font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
                Category *
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65] cursor-pointer"
                >
                  {type === 'expense'
                    ? EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    : INCOME_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    paymentMethod === pm
                      ? 'border-[#547D65] bg-[#547D65]/12 text-[#172B24] dark:text-[#B7D3B3] font-bold'
                      : 'border-[#E9ECE8] dark:border-[#1B2F26] bg-[#F7F8F5] dark:bg-[#0D1612] text-[#87918A]'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add bill reference, item details, or tax info"
              className="w-full px-4 py-2 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E9ECE8] dark:border-[#1E3529]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold hover:bg-[#203B31] dark:hover:bg-[#436451] shadow-md transition-all active:scale-95"
            >
              {editingTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
