import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CategoryBudget,
  ExpenseCategory,
  SavingsGoal,
  Transaction,
  UserSettings,
} from '../types/finance';
import {
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '../data/initialData';

interface FinanceContextType {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  budgets: CategoryBudget[];
  settings: UserSettings;
  selectedMonth: string; // '2026-11' or 'all'
  activeTab: string;
  activeCelebrationGoal: SavingsGoal | null;
  setSelectedMonth: (month: string) => void;
  setActiveTab: (tab: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addSavingsGoal: (
    goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions' | 'savedAmount'> & {
      initialDeposit?: number;
    }
  ) => void;
  editSavingsGoal: (id: string, updated: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributeToGoal: (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    note?: string
  ) => boolean;
  updateBudget: (category: ExpenseCategory, monthlyLimit: number) => void;
  deleteBudget: (category: ExpenseCategory) => void;
  updateSettings: (updated: Partial<UserSettings>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportTransactionsCSV: () => void;
  importTransactionsCSV: (
    csvText: string
  ) => { success: boolean; count: number; error?: string };
  exportBackupJSON: () => void;
  importBackupJSON: (jsonText: string) => boolean;
  dismissCelebration: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'finora_storage_';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}settings`);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Load transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Load savings goals
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}savingsGoals`);
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  // Load category budgets
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}budgets`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [activeCelebrationGoal, setActiveCelebrationGoal] =
    useState<SavingsGoal | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}settings`,
        JSON.stringify(settings)
      );
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}transactions`,
        JSON.stringify(transactions)
      );
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}savingsGoals`,
        JSON.stringify(savingsGoals)
      );
    } catch (e) {
      console.error('Failed to save savings goals to localStorage', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}budgets`,
        JSON.stringify(budgets)
      );
    } catch (e) {
      console.error('Failed to save budgets to localStorage', e);
    }
  }, [budgets]);

  // Handle dark mode toggle on root element
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const editTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Savings Goal Actions
  const addSavingsGoal = (
    goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'contributions' | 'savedAmount'> & {
      initialDeposit?: number;
    }
  ) => {
    const initDeposit = Number(goal.initialDeposit) || 0;
    const contributions =
      initDeposit > 0
        ? [
            {
              id: `c-${Date.now()}`,
              amount: initDeposit,
              date: new Date().toISOString().split('T')[0],
              type: 'deposit' as const,
              note: 'Initial deposit',
            },
          ]
        : [];

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      savedAmount: initDeposit,
      targetDate: goal.targetDate,
      category: goal.category || 'General',
      color: goal.color || '#547D65',
      notes: goal.notes || '',
      contributions,
      createdAt: new Date().toISOString(),
    };

    setSavingsGoals((prev) => [...prev, newGoal]);

    if (newGoal.savedAmount >= newGoal.targetAmount && newGoal.targetAmount > 0) {
      setActiveCelebrationGoal(newGoal);
    }
  };

  const editSavingsGoal = (id: string, updated: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updatedGoal = { ...g, ...updated };
        if (
          updatedGoal.savedAmount >= updatedGoal.targetAmount &&
          g.savedAmount < g.targetAmount
        ) {
          setActiveCelebrationGoal(updatedGoal);
        }
        return updatedGoal;
      })
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const contributeToGoal = (
    goalId: string,
    amount: number,
    type: 'deposit' | 'withdraw',
    note?: string
  ): boolean => {
    if (amount <= 0) return false;

    let targetGoal: SavingsGoal | undefined;

    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;

        let newSaved = g.savedAmount;
        if (type === 'deposit') {
          newSaved += amount;
        } else {
          newSaved = Math.max(0, newSaved - amount);
        }

        const newContrib = {
          id: `c-${Date.now()}`,
          amount,
          date: new Date().toISOString().split('T')[0],
          type,
          note: note || (type === 'deposit' ? 'Added savings' : 'Withdrawal'),
        };

        const updated = {
          ...g,
          savedAmount: newSaved,
          contributions: [newContrib, ...g.contributions],
        };

        if (newSaved >= g.targetAmount && g.savedAmount < g.targetAmount) {
          targetGoal = updated;
        }

        return updated;
      })
    );

    if (targetGoal) {
      setActiveCelebrationGoal(targetGoal);
    }

    return true;
  };

  // Budget Actions
  const updateBudget = (category: ExpenseCategory, monthlyLimit: number) => {
    setBudgets((prev) => {
      const idx = prev.findIndex((b) => b.category === category);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { category, monthlyLimit };
        return copy;
      }
      return [...prev, { category, monthlyLimit }];
    });
  };

  const deleteBudget = (category: ExpenseCategory) => {
    setBudgets((prev) => prev.filter((b) => b.category !== category));
  };

  // Settings Actions
  const updateSettings = (updated: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  // Reset & Clear Actions
  const resetToDemoData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setBudgets(INITIAL_BUDGETS);
    setSettings(INITIAL_SETTINGS);
    setSelectedMonth('2026-11');
  };

  const clearAllData = () => {
    setTransactions([]);
    setSavingsGoals([]);
    setBudgets([]);
    setSettings((prev) => ({
      ...prev,
      openingBalance: 0,
      overallMonthlyBudget: 0,
    }));
  };

  // CSV Export & Import
  const exportTransactionsCSV = () => {
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `finora_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importTransactionsCSV = (
    csvText: string
  ): { success: boolean; count: number; error?: string } => {
    try {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        return { success: false, count: 0, error: 'CSV file is empty or missing headers.' };
      }

      const imported: Transaction[] = [];

      for (let i = 1; i < lines.length; i++) {
        // simple CSV parse supporting quotes
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 5) {
          const [date, title, typeRaw, categoryRaw, amountRaw, paymentRaw, notesRaw] = parts;
          const type = typeRaw?.toLowerCase() === 'income' ? 'income' : 'expense';
          const amount = parseFloat(amountRaw);
          if (!isNaN(amount) && title) {
            imported.push({
              id: `csv-${Date.now()}-${i}`,
              title,
              amount: Math.abs(amount),
              type,
              category: (categoryRaw as any) || (type === 'income' ? 'Salary' : 'Other'),
              date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().split('T')[0],
              paymentMethod: (paymentRaw as any) || 'UPI',
              notes: notesRaw || '',
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      if (imported.length === 0) {
        return { success: false, count: 0, error: 'No valid transaction records found in CSV.' };
      }

      setTransactions((prev) => [...imported, ...prev]);
      return { success: true, count: imported.length };
    } catch (e: any) {
      return { success: false, count: 0, error: e.message || 'Failed to parse CSV file.' };
    }
  };

  // JSON Backup & Restore
  const exportBackupJSON = () => {
    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings,
      transactions,
      savingsGoals,
      budgets,
    };

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `finora_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackupJSON = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
      }
      if (parsed.savingsGoals && Array.isArray(parsed.savingsGoals)) {
        setSavingsGoals(parsed.savingsGoals);
      }
      if (parsed.budgets && Array.isArray(parsed.budgets)) {
        setBudgets(parsed.budgets);
      }
      if (parsed.settings) {
        setSettings(parsed.settings);
      }
      return true;
    } catch {
      return false;
    }
  };

  const dismissCelebration = () => {
    setActiveCelebrationGoal(null);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        savingsGoals,
        budgets,
        settings,
        selectedMonth,
        activeTab,
        activeCelebrationGoal,
        setSelectedMonth,
        setActiveTab,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addSavingsGoal,
        editSavingsGoal,
        deleteSavingsGoal,
        contributeToGoal,
        updateBudget,
        deleteBudget,
        updateSettings,
        resetToDemoData,
        clearAllData,
        exportTransactionsCSV,
        importTransactionsCSV,
        exportBackupJSON,
        importBackupJSON,
        dismissCelebration,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
