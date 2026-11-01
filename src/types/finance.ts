export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Shopping'
  | 'Transportation'
  | 'Entertainment'
  | 'Education'
  | 'Bills & Utilities'
  | 'Health'
  | 'Travel'
  | 'Personal Care'
  | 'Subscriptions'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Allowance'
  | 'Freelancing'
  | 'Business'
  | 'Investments'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
  type: 'deposit' | 'withdraw';
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  color?: string;
  notes?: string;
  contributions: SavingsContribution[];
  createdAt: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  monthlyLimit: number;
}

export interface UserSettings {
  userName: string;
  currency: string;
  currencySymbol: string;
  theme: 'light' | 'dark';
  openingBalance: number;
  overallMonthlyBudget: number;
  avatar: string;
}

export type TimeframeFilter = 'weekly' | 'monthly' | 'yearly';

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  count: number;
}

export interface FinancialInsight {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  badge?: string;
}
