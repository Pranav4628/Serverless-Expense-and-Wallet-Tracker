import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SkeletonCard from '../common/SkeletonCard';

// ── Desktop row ────────────────────────────────────────────────────────────
function DesktopRow({ tx, onEdit, onDelete }) {
  const isIncome = tx.type === 'INCOME';
  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-150">
      <td className="px-4 py-3.5 text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap tabular-nums">
        {formatDate(tx.date)}
      </td>
      <td className="px-4 py-3.5 text-sm text-neutral-800 dark:text-neutral-200 max-w-[200px] truncate font-medium">
        {tx.description || '—'}
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
          {tx.category}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          isIncome 
            ? 'bg-income-light dark:bg-income-dark/20 text-income-dark dark:text-income' 
            : 'bg-expense-light dark:bg-expense-dark/20 text-expense-dark dark:text-expense'
        }`}>
          {tx.type}
        </span>
      </td>
      <td className={`px-4 py-3.5 text-sm font-semibold text-right tabular-nums ${
        isIncome ? 'text-income dark:text-income' : 'text-expense dark:text-expense'
      }`}>
        {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(tx)}
            className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150"
            aria-label={`Edit ${tx.description || tx.category}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tx)}
            className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 hover:bg-expense-light dark:hover:bg-expense-dark/20 hover:text-expense dark:hover:text-expense focus:outline-none focus:ring-2 focus:ring-expense transition-all duration-150"
            aria-label={`Delete ${tx.description || tx.category}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Mobile card ────────────────────────────────────────────────────────────
function MobileCard({ tx, onEdit, onDelete }) {
  const isIncome = tx.type === 'INCOME';
  return (
    <li className="card mb-3 flex items-start justify-between gap-3 animate-scale-in">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            isIncome 
              ? 'bg-income-light dark:bg-income-dark/20 text-income-dark dark:text-income' 
              : 'bg-expense-light dark:bg-expense-dark/20 text-expense-dark dark:text-expense'
          }`}
          aria-hidden="true"
        >
          {isIncome ? '+' : '−'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">
            {tx.description || tx.category}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {tx.category} · {formatDate(tx.date)}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`text-sm font-semibold tabular-nums ${
          isIncome ? 'text-income dark:text-income' : 'text-expense dark:text-expense'
        }`}>
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(tx)}
            className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150"
            aria-label={`Edit ${tx.description || tx.category}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tx)}
            className="rounded-lg p-1.5 text-neutral-400 dark:text-neutral-500 hover:bg-expense-light dark:hover:bg-expense-dark/20 hover:text-expense dark:hover:text-expense focus:outline-none focus:ring-2 focus:ring-expense transition-all duration-150"
            aria-label={`Delete ${tx.description || tx.category}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TransactionTable({ transactions = [], isLoading, onEdit, onDelete }) {
  if (isLoading) return <SkeletonCard lines={8} />;

  if (!transactions.length) {
    return (
      <div className="card py-16 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No transactions found. Adjust your filters or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <ul className="sm:hidden" aria-label="Transactions">
        {transactions.map((tx) => (
          <MobileCard
            key={tx.transactionId ?? tx.id}
            tx={tx}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>

      {/* Desktop: data table */}
      <div className="hidden sm:block card overflow-x-auto p-0 animate-fade-in">
        <table className="w-full text-left" aria-label="Transactions table">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              {['Date', 'Description', 'Category', 'Type', 'Amount', 'Actions'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 ${
                    h === 'Amount' || h === 'Actions' ? 'text-right' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <DesktopRow
                key={tx.transactionId ?? tx.id}
                tx={tx}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
