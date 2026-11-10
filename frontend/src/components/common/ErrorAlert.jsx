import { AlertCircle, X } from 'lucide-react';

export default function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      className="flex items-start gap-3 p-4 bg-expense-light dark:bg-expense-dark/20 border border-expense dark:border-expense-dark rounded-lg animate-slide-up"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-5 w-5 text-expense dark:text-expense shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-expense-dark dark:text-expense">
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg p-1 text-expense-dark dark:text-expense hover:bg-expense dark:hover:bg-expense-dark/30 focus:outline-none focus:ring-2 focus:ring-expense transition-colors duration-150"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
