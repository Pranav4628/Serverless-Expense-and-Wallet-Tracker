import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

/**
 * Short-lived success notice. Errors stay on ErrorAlert.
 */
export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-modal dark:border-neutral-700 dark:bg-neutral-800"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-income" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
