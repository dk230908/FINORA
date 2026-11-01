import React, { useState } from 'react';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Sidebar } from './components/Sidebar';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { GoalCelebrationModal } from './components/modals/GoalCelebrationModal';
import { SavingsContributionModal } from './components/modals/SavingsContributionModal';
import { SavingsGoalModal } from './components/modals/SavingsGoalModal';
import { AnalyticsView } from './components/views/AnalyticsView';
import { BudgetsView } from './components/views/BudgetsView';
import { IncomeView } from './components/views/IncomeView';
import { OverviewView } from './components/views/OverviewView';
import { SavingsView } from './components/views/SavingsView';
import { SettingsView } from './components/views/SettingsView';
import { TransactionsView } from './components/views/TransactionsView';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import {
  CategoryBudget,
  ExpenseCategory,
  SavingsGoal,
  Transaction,
} from './types/finance';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    deleteTransaction,
    deleteSavingsGoal,
    deleteBudget,
    resetToDemoData,
    clearAllData,
  } = useFinance();

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [activeContributionGoal, setActiveContributionGoal] =
    useState<SavingsGoal | null>(null);
  const [contributionType, setContributionType] = useState<
    'deposit' | 'withdraw'
  >('deposit');

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<CategoryBudget | null>(null);

  // Delete / Reset Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
  });

  // Modal handlers
  const handleOpenAddTx = () => {
    setEditingTx(null);
    setIsAddTxOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsAddTxOpen(true);
  };

  const handleDeleteTx = (tx: Transaction) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Transaction',
      message: `Are you sure you want to permanently delete "${tx.title}"?`,
      confirmLabel: 'Delete',
      action: () => {
        deleteTransaction(tx.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = (goal: SavingsGoal) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Savings Goal',
      message: `Are you sure you want to delete "${goal.title}"? Saved progress will be removed.`,
      confirmLabel: 'Delete',
      action: () => {
        deleteSavingsGoal(goal.id);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleOpenContribution = (
    goal: SavingsGoal,
    type: 'deposit' | 'withdraw' = 'deposit'
  ) => {
    setActiveContributionGoal(goal);
    setContributionType(type);
    setIsContributionModalOpen(true);
  };

  const handleOpenCreateBudget = () => {
    setEditingBudget(null);
    setIsBudgetModalOpen(true);
  };

  const handleEditBudget = (budget: CategoryBudget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = (category: ExpenseCategory) => {
    setConfirmModal({
      isOpen: true,
      title: 'Remove Category Budget',
      message: `Are you sure you want to remove the budget cap for ${category}?`,
      confirmLabel: 'Remove',
      action: () => {
        deleteBudget(category);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleResetDemo = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Reset Realistic Demo Data',
      message:
        'This will replace your current records with curated demo transactions, savings goals, and budgets.',
      confirmLabel: 'Reset Data',
      action: () => {
        resetToDemoData();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Purge All Financial Records',
      message:
        'This will permanently delete all transactions, savings goals, and custom budgets. This action cannot be undone.',
      confirmLabel: 'Clear All Data',
      action: () => {
        clearAllData();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] dark:bg-[#0D1612] text-[#17231E] dark:text-[#E6EFE9] transition-colors">
      {/* Top Application Header */}
      <Header onOpenAddTransaction={handleOpenAddTx} />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar onOpenAddTransaction={handleOpenAddTx} />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {activeTab === 'overview' && (
            <OverviewView
              onOpenAddTransaction={handleOpenAddTx}
              onOpenSavingsGoalModal={handleOpenCreateGoal}
              onOpenContributionModal={(g) => handleOpenContribution(g, 'deposit')}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              onOpenAddTransaction={handleOpenAddTx}
              onEditTransaction={handleEditTx}
              onDeleteTransaction={handleDeleteTx}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              onOpenAddTransaction={handleOpenAddTx}
              onEditTransaction={handleEditTx}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsView
              onOpenCreateGoal={handleOpenCreateGoal}
              onEditGoal={handleEditGoal}
              onOpenContribution={handleOpenContribution}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              onOpenCreateBudget={handleOpenCreateBudget}
              onEditBudget={handleEditBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {activeTab === 'income' && (
            <IncomeView
              onOpenAddIncome={() => {
                setEditingTx(null);
                setIsAddTxOpen(true);
              }}
              onEditTransaction={handleEditTx}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onOpenResetDemoConfirm={handleResetDemo}
              onOpenClearAllConfirm={handleClearAll}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenAddTransaction={handleOpenAddTx} />

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        editingTransaction={editingTx}
      />

      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editingGoal={editingGoal}
      />

      <SavingsContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        goal={activeContributionGoal}
        defaultType={contributionType}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        editingBudget={editingBudget}
      />

      <GoalCelebrationModal />

      <DeleteConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContent />
    </FinanceProvider>
  );
}
