import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAvailableBalance,
  calculateBudgetStatus,
  calculateCategoryBreakdown,
  calculateNetSavings,
  calculateSavingsRate,
  calculateTotalExpenses,
  calculateTotalIncome,
  formatCurrency,
} from './financeMath';
import { Transaction } from '../types/finance';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Salary Deposit',
    amount: 100000,
    type: 'income',
    category: 'Salary',
    date: '2026-11-01',
    paymentMethod: 'Bank Transfer',
    createdAt: '2026-11-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Freelance Design',
    amount: 25000,
    type: 'income',
    category: 'Freelancing',
    date: '2026-11-03',
    paymentMethod: 'UPI',
    createdAt: '2026-11-03T10:00:00Z',
  },
  {
    id: '3',
    title: 'Grocery Supermart',
    amount: 6500,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-11-04',
    paymentMethod: 'Credit Card',
    createdAt: '2026-11-04T12:00:00Z',
  },
  {
    id: '4',
    title: 'Dining Out',
    amount: 3500,
    type: 'expense',
    category: 'Food & Dining',
    date: '2026-11-05',
    paymentMethod: 'UPI',
    createdAt: '2026-11-05T14:00:00Z',
  },
  {
    id: '5',
    title: 'Metro & Fuel',
    amount: 4000,
    type: 'expense',
    category: 'Transportation',
    date: '2026-11-06',
    paymentMethod: 'Debit Card',
    createdAt: '2026-11-06T15:00:00Z',
  },
];

test('calculateTotalIncome sums all income correctly', () => {
  const total = calculateTotalIncome(mockTransactions);
  assert.equal(total, 125000);
});

test('calculateTotalExpenses sums all expenses correctly', () => {
  const total = calculateTotalExpenses(mockTransactions);
  assert.equal(total, 14000);
});

test('calculateNetSavings computes income minus expenses', () => {
  const income = 125000;
  const expenses = 14000;
  assert.equal(calculateNetSavings(income, expenses), 111000);
});

test('calculateSavingsRate computes correct percentage and handles zero income', () => {
  // 111,000 / 125,000 = 88.8%
  const rate = calculateSavingsRate(111000, 125000);
  assert.equal(rate, 88.8);

  // zero income edge case
  const zeroRate = calculateSavingsRate(0, 0);
  assert.equal(zeroRate, 0);
});

test('calculateAvailableBalance includes opening balance, income and expenses', () => {
  const opening = 50000;
  const income = 125000;
  const expenses = 14000;
  const balance = calculateAvailableBalance(opening, income, expenses);
  assert.equal(balance, 161000);
});

test('calculateCategoryBreakdown groups expenses and computes percentages', () => {
  const breakdown = calculateCategoryBreakdown(mockTransactions, 'expense');
  assert.equal(breakdown.length, 2);
  // Food & Dining: 10,000 (71.4%), Transportation: 4,000 (28.6%)
  assert.equal(breakdown[0].category, 'Food & Dining');
  assert.equal(breakdown[0].amount, 10000);
  assert.equal(breakdown[0].count, 2);
  assert.equal(breakdown[1].category, 'Transportation');
  assert.equal(breakdown[1].amount, 4000);
});

test('calculateBudgetStatus properly classifies warning thresholds', () => {
  // Normal (< 75%)
  assert.equal(calculateBudgetStatus(500, 1000).status, 'normal');

  // Approaching (>= 75% and < 90%)
  assert.equal(calculateBudgetStatus(750, 1000).status, 'approaching');
  assert.equal(calculateBudgetStatus(800, 1000).status, 'approaching');

  // Exhausted (>= 90% and < 100%)
  assert.equal(calculateBudgetStatus(920, 1000).status, 'exhausted');

  // Exceeded (>= 100%)
  assert.equal(calculateBudgetStatus(1050, 1000).status, 'exceeded');
});

test('formatCurrency handles INR grouping and negative numbers', () => {
  const formatted = formatCurrency(125000, 'INR', '₹');
  assert.equal(formatted, '₹1,25,000');

  const negativeFormatted = formatCurrency(-5000, 'INR', '₹');
  assert.equal(negativeFormatted, '-₹5,000');
});
