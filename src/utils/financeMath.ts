import {
  CategoryBreakdownItem,
  CategoryBudget,
  ExpenseCategory,
  FinancialInsight,
  SavingsGoal,
  Transaction,
} from '../types/finance';

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Food & Dining': '#547D65',      // Primary green
  'Shopping': '#D97878',           // Expense coral red
  'Transportation': '#8884d8',     // Muted periwinkle
  'Entertainment': '#D9C8F0',     // Lavender accent
  'Education': '#4C9974',          // Income green
  'Bills & Utilities': '#E5A93C',  // Warm amber
  'Health': '#38B2AC',             // Teal
  'Travel': '#3182CE',             // Blue
  'Personal Care': '#ED64A6',      // Rose pink
  'Subscriptions': '#9F7AEA',      // Violet
  'Other': '#718096',              // Slate gray
};

export const INCOME_CATEGORY_COLORS: Record<string, string> = {
  'Salary': '#4C9974',
  'Allowance': '#547D65',
  'Freelancing': '#38B2AC',
  'Business': '#3182CE',
  'Investments': '#805AD5',
  'Other': '#718096',
};

/**
 * Formats a numeric value into a currency string.
 * Default is INR (₹) with Indian lakh/crore comma separation.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  currencySymbol: string = '₹'
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currencySymbol}0`;
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formattedNumber: string;

  if (currency === 'INR') {
    // Format according to Indian number grouping (e.g. 1,50,000)
    formattedNumber = absAmount.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(absAmount) ? 0 : 2,
    });
  } else {
    formattedNumber = absAmount.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(absAmount) ? 0 : 2,
    });
  }

  return `${isNegative ? '-' : ''}${currencySymbol}${formattedNumber}`;
}

/**
 * Filter transactions by date range or year-month string (YYYY-MM).
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  yearMonth: string // "2026-11" or "all"
): Transaction[] {
  if (!yearMonth || yearMonth === 'all') {
    return transactions;
  }
  return transactions.filter((t) => t.date.startsWith(yearMonth));
}

/**
 * Filter transactions by timeframe: weekly (last 7 days), monthly (last 30 days or month), yearly (year)
 */
export function filterTransactionsByTimeframe(
  transactions: Transaction[],
  timeframe: 'weekly' | 'monthly' | 'yearly',
  referenceDate: string = '2026-11-01'
): Transaction[] {
  const ref = new Date(referenceDate);
  const refTime = ref.getTime();

  return transactions.filter((t) => {
    const tDate = new Date(t.date);
    const diffDays = (refTime - tDate.getTime()) / (1000 * 3600 * 24);

    if (timeframe === 'weekly') {
      return diffDays >= -1 && diffDays <= 7;
    } else if (timeframe === 'monthly') {
      return (
        tDate.getFullYear() === ref.getFullYear() &&
        tDate.getMonth() === ref.getMonth()
      );
    } else {
      return tDate.getFullYear() === ref.getFullYear();
    }
  });
}

/**
 * Sum of all income transactions.
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Sum of all expense transactions.
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Net Savings = Total Income - Total Expenses.
 */
export function calculateNetSavings(income: number, expenses: number): number {
  return income - expenses;
}

/**
 * Savings Rate = (Net Savings / Total Income) * 100.
 * If income <= 0, returns 0.
 */
export function calculateSavingsRate(netSavings: number, income: number): number {
  if (income <= 0) return 0;
  const rate = (netSavings / income) * 100;
  return Math.round(rate * 10) / 10;
}

/**
 * Available Balance = Opening Balance + Total Income - Total Expenses.
 */
export function calculateAvailableBalance(
  openingBalance: number,
  totalIncome: number,
  totalExpenses: number
): number {
  return openingBalance + totalIncome - totalExpenses;
}

/**
 * Generate category breakdown for Donut Chart & Progress list.
 * Only processes transactions of the specified type.
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: 'expense' | 'income' = 'expense'
): CategoryBreakdownItem[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  if (total === 0) return [];

  const categoryMap = new Map<string, { amount: number; count: number }>();

  filtered.forEach((t) => {
    const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: existing.amount + Number(t.amount),
      count: existing.count + 1,
    });
  });

  const breakdown: CategoryBreakdownItem[] = [];

  categoryMap.forEach((val, category) => {
    const percentage = Math.round((val.amount / total) * 1000) / 10;
    const color =
      type === 'expense'
        ? EXPENSE_CATEGORY_COLORS[category as ExpenseCategory] || '#718096'
        : INCOME_CATEGORY_COLORS[category] || '#4C9974';

    breakdown.push({
      category,
      amount: val.amount,
      percentage,
      color,
      count: val.count,
    });
  });

  // Sort descending by amount
  return breakdown.sort((a, b) => b.amount - a.amount);
}

/**
 * Budget warning thresholds:
 * - <75%: normal
 * - 75%-89%: approaching limit
 * - 90%-99%: budget nearly exhausted
 * - >=100%: budget exceeded
 */
export function calculateBudgetStatus(
  spent: number,
  limit: number
): {
  percent: number;
  status: 'normal' | 'approaching' | 'exhausted' | 'exceeded';
  message: string;
  remaining: number;
} {
  if (limit <= 0) {
    return {
      percent: 0,
      status: 'normal',
      message: 'No limit set',
      remaining: 0,
    };
  }

  const percent = Math.round((spent / limit) * 100);
  const remaining = limit - spent;

  if (percent >= 100) {
    return {
      percent,
      status: 'exceeded',
      message: 'Budget exceeded',
      remaining,
    };
  }
  if (percent >= 90) {
    return {
      percent,
      status: 'exhausted',
      message: 'Budget nearly exhausted',
      remaining,
    };
  }
  if (percent >= 75) {
    return {
      percent,
      status: 'approaching',
      message: 'Approaching limit',
      remaining,
    };
  }

  return {
    percent,
    status: 'normal',
    message: 'On track',
    remaining,
  };
}

/**
 * Generate intelligent dynamic insights based on actual user financial data.
 */
export function generateIntelligentInsights(
  currentMonthTransactions: Transaction[],
  previousMonthTransactions: Transaction[],
  budgets: CategoryBudget[],
  goals: SavingsGoal[],
  currencySymbol: string = '₹'
): FinancialInsight[] {
  const insights: FinancialInsight[] = [];

  const curExpenses = calculateTotalExpenses(currentMonthTransactions);
  const prevExpenses = calculateTotalExpenses(previousMonthTransactions);
  const curIncome = calculateTotalIncome(currentMonthTransactions);
  const curNetSavings = calculateNetSavings(curIncome, curExpenses);
  const savingsRate = calculateSavingsRate(curNetSavings, curIncome);

  // 1. Month-on-month spending trend
  if (prevExpenses > 0 && curExpenses > 0) {
    const diffPercent = Math.round(
      ((curExpenses - prevExpenses) / prevExpenses) * 100
    );
    if (diffPercent < 0) {
      insights.push({
        id: 'spend-reduction',
        type: 'success',
        title: 'Spending Reduced',
        message: `You spent ${Math.abs(diffPercent)}% less than last month. Outstanding spending discipline!`,
        badge: `${Math.abs(diffPercent)}% saved`,
      });
    } else if (diffPercent > 0) {
      insights.push({
        id: 'spend-increase',
        type: 'warning',
        title: 'Spending Increased',
        message: `Your expenses are ${diffPercent}% higher than last month. Consider reviewing variable purchases.`,
        badge: `+${diffPercent}% spend`,
      });
    }
  }

  // 2. Highest spending category
  const breakdown = calculateCategoryBreakdown(currentMonthTransactions, 'expense');
  if (breakdown.length > 0) {
    const top = breakdown[0];
    insights.push({
      id: 'top-category',
      type: 'info',
      title: 'Top Expense Driver',
      message: `${top.category} is your highest spending category at ${formatCurrency(top.amount, 'INR', currencySymbol)} (${top.percentage}% of total expenses).`,
      badge: `${top.percentage}%`,
    });
  }

  // 3. Savings Rate Achievement
  if (curIncome > 0) {
    if (savingsRate >= 30) {
      insights.push({
        id: 'high-savings',
        type: 'success',
        title: 'Super Saver Milestone',
        message: `Your savings rate is ${savingsRate}%, significantly beating the standard 20% financial benchmark.`,
        badge: `${savingsRate}% savings`,
      });
    } else if (savingsRate > 0) {
      insights.push({
        id: 'positive-savings',
        type: 'info',
        title: 'Healthy Savings Flow',
        message: `You saved ${formatCurrency(curNetSavings, 'INR', currencySymbol)} this month (${savingsRate}% savings rate).`,
        badge: `${savingsRate}%`,
      });
    } else {
      insights.push({
        id: 'deficit-warning',
        type: 'warning',
        title: 'Negative Cashflow',
        message: `Expenses exceed income by ${formatCurrency(Math.abs(curNetSavings), 'INR', currencySymbol)}. Try pausing non-essential expenses.`,
        badge: 'Deficit',
      });
    }
  }

  // 4. Budget Alerts
  budgets.forEach((b) => {
    const catSpent = currentMonthTransactions
      .filter((t) => t.type === 'expense' && t.category === b.category)
      .reduce((s, t) => s + Number(t.amount), 0);

    const status = calculateBudgetStatus(catSpent, b.monthlyLimit);
    if (status.status === 'exceeded') {
      insights.push({
        id: `budget-exceeded-${b.category}`,
        type: 'warning',
        title: `${b.category} Budget Exceeded`,
        message: `You have spent ${formatCurrency(catSpent, 'INR', currencySymbol)} against your limit of ${formatCurrency(b.monthlyLimit, 'INR', currencySymbol)} (${status.percent}% used).`,
        badge: 'Over Limit',
      });
    } else if (status.status === 'exhausted' || status.status === 'approaching') {
      insights.push({
        id: `budget-warn-${b.category}`,
        type: 'warning',
        title: `${b.category} Budget Alert`,
        message: `You have used ${status.percent}% of your ${b.category} budget with ${formatCurrency(status.remaining, 'INR', currencySymbol)} left.`,
        badge: `${status.percent}% used`,
      });
    }
  });

  // 5. Savings Goals milestones
  goals.forEach((g) => {
    const pct = Math.round((g.savedAmount / g.targetAmount) * 100);
    if (pct >= 100) {
      insights.push({
        id: `goal-achieved-${g.id}`,
        type: 'success',
        title: 'Goal Achieved! 🎉',
        message: `Congratulations! You have reached 100% of your "${g.title}" target.`,
        badge: 'Completed',
      });
    } else if (pct >= 50) {
      insights.push({
        id: `goal-milestone-${g.id}`,
        type: 'info',
        title: 'Savings Progress',
        message: `You are ${pct}% towards your "${g.title}" target (${formatCurrency(g.savedAmount, 'INR', currencySymbol)} of ${formatCurrency(g.targetAmount, 'INR', currencySymbol)}).`,
        badge: `${pct}% reached`,
      });
    }
  });

  return insights;
}
