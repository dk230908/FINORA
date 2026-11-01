import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Download,
  Edit2,
  Filter,
  Plus,
  Search,
  Trash2,
  Upload,
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
  calculateTotalExpenses,
  calculateTotalIncome,
  EXPENSE_CATEGORY_COLORS,
  formatCurrency,
  INCOME_CATEGORY_COLORS,
} from '../../utils/financeMath';

interface TransactionsViewProps {
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (tx: Transaction) => void;
}

const ALL_CATEGORIES = [
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

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const {
    transactions,
    settings,
    selectedMonth,
    exportTransactionsCSV,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateMonthFilter, setDateMonthFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search term
      if (
        searchTerm &&
        !t.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(t.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }

      // Payment filter
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) {
        return false;
      }

      // Date month filter
      if (dateMonthFilter !== 'all' && !t.date.startsWith(dateMonthFilter)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount_desc') {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    paymentFilter,
    dateMonthFilter,
    sortBy,
  ]);

  const totalFilteredIncome = calculateTotalIncome(filteredTransactions);
  const totalFilteredExpenses = calculateTotalExpenses(filteredTransactions);
  const filteredNet = totalFilteredIncome - totalFilteredExpenses;

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setDateMonthFilter('all');
  };

  const hasActiveFilters =
    searchTerm ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    paymentFilter !== 'all' ||
    dateMonthFilter !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#547D65]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#547D65] dark:text-[#B7D3B3]">
              Financial Records
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] tracking-tight mt-1">
            Transactions Ledger
          </h2>
          <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
            Search, filter, edit and export your comprehensive transaction history.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={exportTransactionsCSV}
            title="Download CSV"
            className="px-3.5 py-2.5 rounded-xl border border-[#E9ECE8] dark:border-[#1A2E24] hover:bg-[#F7F8F5] dark:hover:bg-[#101B15] text-[#172B24] dark:text-[#E6EFE9] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="px-5 py-2.5 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-md hover:bg-[#203B31] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-4">
        {/* Search input + Type tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#87918A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, merchant or notes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-medium text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#87918A] hover:text-[#172B24]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Toggle: All, Expense, Income */}
          <div className="flex items-center p-1 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] shrink-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-[#1A2E24] text-[#172B24] dark:text-[#E6EFE9] shadow-xs'
                  : 'text-[#87918A]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-[#1A2E24] text-[#D97878] shadow-xs'
                  : 'text-[#87918A]'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === 'income'
                  ? 'bg-white dark:bg-[#1A2E24] text-[#4C9974] dark:text-[#68C59A] shadow-xs'
                  : 'text-[#87918A]'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Secondary Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#87918A] mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[11px] font-semibold text-[#87918A] mb-1">
              Payment Method
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Month / Period Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#87918A] mb-1">
              Period
            </label>
            <select
              value={dateMonthFilter}
              onChange={(e) => setDateMonthFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            >
              <option value="all">All Time</option>
              <option value="2026-11">November 2026</option>
              <option value="2026-10">October 2026</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-[#87918A] mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-semibold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Reset filters action */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-[#E9ECE8] dark:border-[#1A2E24] text-xs">
            <span className="text-[#87918A]">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </span>
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Filtered Summary Ribbon */}
      <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
        <div>
          <span className="text-[#87918A]">Records Shown:</span>
          <div className="text-base font-extrabold text-[#172B24] dark:text-[#E6EFE9]">
            {filteredTransactions.length}
          </div>
        </div>
        <div>
          <span className="text-[#87918A]">Filtered Income:</span>
          <div className="text-base font-extrabold text-[#4C9974] dark:text-[#68C59A]">
            +{formatCurrency(totalFilteredIncome, settings.currency, settings.currencySymbol)}
          </div>
        </div>
        <div>
          <span className="text-[#87918A]">Filtered Expenses:</span>
          <div className="text-base font-extrabold text-[#D97878]">
            -{formatCurrency(totalFilteredExpenses, settings.currency, settings.currencySymbol)}
          </div>
        </div>
        <div>
          <span className="text-[#87918A]">Net Cashflow:</span>
          <div
            className={`text-base font-extrabold ${
              filteredNet >= 0
                ? 'text-[#172B24] dark:text-[#E6EFE9]'
                : 'text-[#D97878]'
            }`}
          >
            {formatCurrency(filteredNet, settings.currency, settings.currencySymbol)}
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div className="divide-y divide-[#E9ECE8] dark:divide-[#1A2E24]">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8F5]/60 dark:hover:bg-[#1A2E24]/30 px-3 rounded-2xl transition-colors group"
            >
              {/* Left Details */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    tx.type === 'income'
                      ? 'bg-[#4C9974]/15 text-[#4C9974] dark:text-[#68C59A]'
                      : 'bg-[#D97878]/15 text-[#D97878]'
                  }`}
                >
                  {tx.type === 'income' ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[#172B24] dark:text-[#E6EFE9]">
                      {tx.title}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        backgroundColor:
                          tx.type === 'expense'
                            ? `${EXPENSE_CATEGORY_COLORS[tx.category as ExpenseCategory] || '#718096'}20`
                            : `${INCOME_CATEGORY_COLORS[tx.category] || '#4C9974'}20`,
                        color:
                          tx.type === 'expense'
                            ? EXPENSE_CATEGORY_COLORS[tx.category as ExpenseCategory] || '#718096'
                            : INCOME_CATEGORY_COLORS[tx.category] || '#4C9974',
                      }}
                    >
                      {tx.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#87918A] mt-1 flex-wrap">
                    <span>{tx.date}</span>
                    <span>•</span>
                    <span className="font-medium">{tx.paymentMethod}</span>
                    {tx.notes && (
                      <>
                        <span>•</span>
                        <span className="italic truncate max-w-xs">{tx.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Amount & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div
                  className={`text-base font-black tracking-tight ${
                    tx.type === 'income'
                      ? 'text-[#4C9974] dark:text-[#68C59A]'
                      : 'text-[#172B24] dark:text-[#E6EFE9]'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount, settings.currency, settings.currencySymbol)}
                </div>

                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditTransaction(tx)}
                    aria-label={`Edit ${tx.title}`}
                    className="p-2 rounded-xl text-[#87918A] hover:bg-[#E9ECE8] dark:hover:bg-[#1E3529] hover:text-[#172B24]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTransaction(tx)}
                    aria-label={`Delete ${tx.title}`}
                    className="p-2 rounded-xl text-[#87918A] hover:bg-[#D97878]/15 hover:text-[#D97878]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="py-16 text-center">
              <Search className="w-12 h-12 mx-auto text-[#87918A] mb-2 opacity-50" />
              <h4 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
                No transactions matched your filters.
              </h4>
              <p className="text-xs text-[#87918A] mt-1 mb-4">
                Try loosening your filter parameters or search term.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
