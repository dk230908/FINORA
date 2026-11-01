import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  FileSpreadsheet,
  Moon,
  RefreshCw,
  RotateCcw,
  Save,
  Sun,
  Trash2,
  Upload,
  User,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/financeMath';

interface SettingsViewProps {
  onOpenClearAllConfirm: () => void;
  onOpenResetDemoConfirm: () => void;
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee (Default)' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
  { code: 'AED', symbol: 'AED', label: 'AED (AED) - UAE Dirham' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥) - Japanese Yen' },
];

const AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  onOpenClearAllConfirm,
  onOpenResetDemoConfirm,
}) => {
  const {
    settings,
    updateSettings,
    exportTransactionsCSV,
    importTransactionsCSV,
    exportBackupJSON,
    importBackupJSON,
    transactions,
    savingsGoals,
  } = useFinance();

  const [userName, setUserName] = useState(settings.userName);
  const [openingBalance, setOpeningBalance] = useState(
    String(settings.openingBalance)
  );
  const [overallMonthlyBudget, setOverallMonthlyBudget] = useState(
    String(settings.overallMonthlyBudget)
  );
  const [selectedCurrency, setSelectedCurrency] = useState(settings.currency);
  const [selectedAvatar, setSelectedAvatar] = useState(settings.avatar);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = CURRENCIES.find((c) => c.code === selectedCurrency);
    updateSettings({
      userName: userName.trim() || 'User',
      openingBalance: parseFloat(openingBalance) || 0,
      overallMonthlyBudget: parseFloat(overallMonthlyBudget) || 50000,
      currency: selectedCurrency,
      currencySymbol: curr ? curr.symbol : '₹',
      avatar: selectedAvatar,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const result = importTransactionsCSV(text);
        if (result.success) {
          setImportStatus(`Successfully imported ${result.count} transactions!`);
        } else {
          setImportStatus(`CSV Import Error: ${result.error}`);
        }
        setTimeout(() => setImportStatus(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = importBackupJSON(text);
        if (success) {
          setImportStatus('Backup JSON successfully restored!');
        } else {
          setImportStatus('Invalid JSON backup file.');
        }
        setTimeout(() => setImportStatus(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#547D65]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#547D65] dark:text-[#B7D3B3]">
            Preferences & Security
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B24] dark:text-[#E6EFE9] tracking-tight mt-1">
          Settings & Data Management
        </h2>
        <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
          Configure profile, currency, opening balance, backup files, and export ledgers.
        </p>
      </div>

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-[#4C9974]/15 border border-[#4C9974]/30 text-xs font-bold text-[#4C9974] dark:text-[#68C59A] flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile and financial parameters saved successfully!</span>
        </div>
      )}

      {importStatus && (
        <div className="p-4 rounded-2xl bg-[#547D65]/15 border border-[#547D65]/30 text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Profile & Financial Settings Form */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-6"
      >
        <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
          Personal & Currency Preferences
        </h3>

        {/* Avatar Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-2">
            Profile Avatar
          </label>
          <div className="flex items-center gap-3">
            {AVATARS.map((av) => (
              <img
                key={av}
                src={av}
                alt="Avatar"
                onClick={() => setSelectedAvatar(av)}
                className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-transform ${
                  selectedAvatar === av
                    ? 'ring-3 ring-[#547D65] scale-105 shadow-md'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* User Name */}
        <div>
          <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
            Display Name
          </label>
          <input
            type="text"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
          />
        </div>

        {/* Currency Selection */}
        <div>
          <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
            Default Currency
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Opening Balance & Overall Monthly Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Opening Available Balance
            </label>
            <input
              type="number"
              step="any"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            />
            <p className="text-[11px] text-[#87918A] mt-1">
              Starting bank / cash balance carried forward.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-1">
              Overall Monthly Budget Limit
            </label>
            <input
              type="number"
              step="any"
              value={overallMonthlyBudget}
              onChange={(e) => setOverallMonthlyBudget(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] focus:outline-none focus:ring-2 focus:ring-[#547D65]"
            />
            <p className="text-[11px] text-[#87918A] mt-1">
              Total monthly expenditure threshold across all categories.
            </p>
          </div>
        </div>

        {/* Theme Preference */}
        <div>
          <label className="block text-xs font-semibold text-[#5A6860] dark:text-[#A2B3A9] mb-2">
            Visual Theme
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <button
              type="button"
              onClick={() => updateSettings({ theme: 'light' })}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                settings.theme === 'light'
                  ? 'border-[#547D65] bg-[#547D65]/12 text-[#172B24]'
                  : 'border-[#E9ECE8] dark:border-[#1B2F26] text-[#87918A]'
              }`}
            >
              <Sun className="w-4 h-4 text-[#E5A93C]" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                settings.theme === 'dark'
                  ? 'border-[#547D65] bg-[#547D65]/12 text-[#B7D3B3]'
                  : 'border-[#E9ECE8] dark:border-[#1B2F26] text-[#87918A]'
              }`}
            >
              <Moon className="w-4 h-4 text-[#547D65]" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#172B24] dark:bg-[#547D65] text-white text-xs font-bold shadow-md hover:bg-[#203B31] transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Data Export & Backup Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14221C] border border-[#E9ECE8] dark:border-[#1A2E24] shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9]">
          Data Export & Backup
        </h3>
        <p className="text-xs text-[#87918A] dark:text-[#8FA196]">
          Safeguard your data locally. Export to spreadsheet-ready CSV or full JSON backup.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* CSV Export & Import */}
          <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#547D65] dark:text-[#B7D3B3]" />
              <span className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9]">
                CSV Ledger Management
              </span>
            </div>
            <p className="text-[11px] text-[#87918A]">
              Export {transactions.length} transactions as CSV for Excel/Google Sheets or import past records.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportTransactionsCSV}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1A2E24] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] hover:bg-[#F2F5F3] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => csvInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1A2E24] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] hover:bg-[#F2F5F3] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* JSON Full Backup & Restore */}
          <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#0D1612] border border-[#E9ECE8] dark:border-[#1B2F26] space-y-3">
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4 text-[#4C9974]" />
              <span className="text-xs font-bold text-[#172B24] dark:text-[#E6EFE9]">
                Complete JSON Snapshot
              </span>
            </div>
            <p className="text-[11px] text-[#87918A]">
              Full database backup including all goals, budgets, transactions, and settings.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportBackupJSON}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1A2E24] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] hover:bg-[#F2F5F3] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>
              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-[#1A2E24] border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#172B24] dark:text-[#E6EFE9] hover:bg-[#F2F5F3] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore JSON</span>
              </button>
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJSONUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset Sample Data or Clear All */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#14221C] border border-[#D97878]/30 dark:border-[#D97878]/20 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#D97878] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Data Operations & Reset</span>
          </h3>
          <p className="text-xs text-[#87918A] dark:text-[#8FA196] mt-0.5">
            Reset to realistic sample demonstration records or purge all local storage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onOpenResetDemoConfirm}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#547D65]/40 hover:bg-[#547D65]/10 text-xs font-bold text-[#547D65] dark:text-[#B7D3B3] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Realistic Sample Data</span>
          </button>
          <button
            type="button"
            onClick={onOpenClearAllConfirm}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#D97878]/15 hover:bg-[#D97878]/25 text-[#D97878] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Financial Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
