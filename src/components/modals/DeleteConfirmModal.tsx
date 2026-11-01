import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm bg-white dark:bg-[#14221C] rounded-3xl shadow-2xl border border-[#E9ECE8] dark:border-[#1E3529] p-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-[#D97878]/15 flex items-center justify-center text-[#D97878] mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-[#172B24] dark:text-[#E6EFE9] mb-1">
          {title}
        </h3>
        <p className="text-xs text-[#87918A] dark:text-[#8FA196] mb-5">
          {message}
        </p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-[#E9ECE8] dark:border-[#1B2F26] text-xs font-bold text-[#87918A] hover:bg-[#F7F8F5] dark:hover:bg-[#1E3529] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-[#D97878] text-white text-xs font-bold hover:bg-[#C26565] transition-colors shadow-xs"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
