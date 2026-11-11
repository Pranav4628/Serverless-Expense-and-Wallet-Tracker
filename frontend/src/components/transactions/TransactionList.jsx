import { useState } from 'react';
import { Paperclip, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SkeletonCard from '../common/SkeletonCard';
import ReceiptModal from './ReceiptModal';

function ReceiptButton({ receiptUrl, onOpen }) {
  if (!receiptUrl) return null;
  return (
    <button
      type="button"
      onClick={() => onOpen(receiptUrl)}
      className="rounded-lg p-2 text-neutral-400 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-500 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
      aria-label="View receipt"
    >
      <Paperclip className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

function DesktopRow({ tx, onEdit, onDelete, onOpenReceipt }) {
  const isIncome = tx.type === 'INCOME';
  return (
    <tr className="border-b border-neutral-100 transition-colors duration-150 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50">
      <td className="whitespace-nowrap px-4 py-3.5 text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
        {formatDate(tx.date)}
      </td>
      <td className="max-w-[200px] truncate px-4 py-3.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {tx.description || '—'}
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
          {tx.category}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
          isIncome
            ? 'bg-income-light text-income-dark dark:bg-income-dark/20 dark:text-income'
            : 'bg-expense-light text-expense-dark dark:bg-expense-dark/20 dark:text-expense'
        }`}>
          {tx.type}
        </span>
      </td>
      <td className={`px-4 py-3.5 text-right text-sm font-semibold tabular-nums ${
        isIncome ? 'text-income' : 'text-expense'
      }`}>
        {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <ReceiptButton receiptUrl={tx.receiptUrl} onOpen={onOpenReceipt} />
          <button
            type="button"
            onClick={() => onEdit(tx)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-500 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
            aria-label={`Edit ${tx.description || tx.category}`}
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tx)}
            className="rounded-lg p-2 text-neutral-400 hover:bg-expense-light hover:text-expense focus:outline-none focus:ring-2 focus:ring-expense dark:text-neutral-500 dark:hover:bg-expense-dark/20"
            aria-label={`Delete ${tx.description || tx.category}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function MobileCard({ tx, onEdit, onDelete, onOpenReceipt }) {
  const isIncome = tx.type === 'INCOME';
  return (
    <li className="card mb-3 flex items-start justify-between gap-3 animate-scale-in">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            isIncome
              ? 'bg-income-light text-income-dark dark:bg-income-dark/20 dark:text-income'
              : 'bg-expense-light text-expense-dark dark:bg-expense-dark/20 dark:text-expense'
          }`}
          aria-hidden="true"
        >
          {isIncome ? '+' : '−'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {tx.description || tx.category}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {tx.category} · {formatDate(tx.date)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>
        <div className="flex gap-1">
          <ReceiptButton receiptUrl={tx.receiptUrl} onOpen={onOpenReceipt} />
          <button
            type="button"
            onClick={() => onEdit(tx)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-500 dark:hover:bg-primary-900/20 dark:hover:text-primary-400"
            aria-label={`Edit ${tx.description || tx.category}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(tx)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-expense-light hover:text-expense focus:outline-none focus:ring-2 focus:ring-expense dark:text-neutral-500 dark:hover:bg-expense-dark/20"
            aria-label={`Delete ${tx.description || tx.category}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default function TransactionList({ transactions = [], isLoading, onEdit, onDelete }) {
  const [receiptUrl, setReceiptUrl] = useState('');

  if (isLoading) return <SkeletonCard lines={8} />;

  if (!transactions.length) {
    return (
      <div className="card animate-fade-in py-16 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No transactions found. Adjust your filters or add a new transaction.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="sm:hidden" aria-label="Transactions">
        {transactions.map((tx) => (
          <MobileCard
            key={tx.transactionId ?? tx.id}
            tx={tx}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenReceipt={setReceiptUrl}
          />
        ))}
      </ul>

      <div className="card hidden overflow-x-auto p-0 animate-fade-in sm:block">
        <table className="w-full text-left" aria-label="Transactions table">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
              {['Date', 'Description', 'Category', 'Type', 'Amount', 'Actions'].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 ${
                    heading === 'Amount' || heading === 'Actions' ? 'text-right' : ''
                  }`}
                >
                  {heading}
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
                onOpenReceipt={setReceiptUrl}
              />
            ))}
          </tbody>
        </table>
      </div>

      <ReceiptModal
        isOpen={!!receiptUrl}
        onClose={() => setReceiptUrl('')}
        receiptUrl={receiptUrl}
      />
    </>
  );
}
