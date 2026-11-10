import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger', // 'danger' | 'primary'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-neutral-800 rounded-card shadow-modal border border-neutral-200 dark:border-neutral-700 animate-scale-in"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="p-6">
          {/* Icon */}
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
            variant === 'danger' 
              ? 'bg-expense-light dark:bg-expense-dark/20' 
              : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
            <AlertTriangle className={`h-6 w-6 ${
              variant === 'danger' 
                ? 'text-expense dark:text-expense' 
                : 'text-primary-600 dark:text-primary-400'
            }`} aria-hidden="true" />
          </div>

          {/* Content */}
          <h3
            id="dialog-title"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-2"
          >
            {title}
          </h3>
          <p
            id="dialog-description"
            className="text-sm text-neutral-600 dark:text-neutral-400 mb-6"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className={variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary'}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
