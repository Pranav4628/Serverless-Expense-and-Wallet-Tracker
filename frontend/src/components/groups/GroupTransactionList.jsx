import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { deleteGroupTransaction } from '../../services/groupService';
import SkeletonCard from '../common/SkeletonCard';
import ConfirmDialog from '../common/ConfirmDialog';

function ActionButtons({ tx, groupId, onEdit, onDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting]   = useState(false);

  const handleDelete = async () => {
    const txId = tx.transactionId ?? tx.id;
    setIsDeleting(true);
    try {
      await deleteGroupTransaction(groupId, txId);
      onDeleted(txId);
    } catch (err) {
      console.error('Failed to delete group transaction:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => onEdit(tx)}
        disabled={isDeleting}
        className="rounded-lg p-2 text-neutral-400 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-neutral-500 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors duration-150"
        aria-label={`Edit ${tx.description || tx.category}`}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isDeleting}
        className="rounded-lg p-2 text-neutral-400 hover:bg-expense-light hover:text-expense focus:outline-none focus:ring-2 focus:ring-expense dark:text-neutral-500 dark:hover:bg-expense-dark/20 transition-colors duration-150"
        aria-label={`Delete ${tx.description || tx.category}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete transaction?"
        message={`Remove "${tx.description || tx.category}" (${formatCurrency(tx.amount)})? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  );
}

function TransactionRow({ tx, members, groupId, onEdit, onDeleted }) {
  const isIncome     = tx.type === 'INCOME';
  const paidByMember = members.find((m) => (m.userId ?? m.id) === tx.paidBy);
  const paidByName   = paidByMember?.name ?? paidByMember?.email ?? tx.paidBy ?? 'Unknown';

  return (
    <tr className="border-b border-neutral-100 transition-colors duration-150 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50">
      <td className="whitespace-nowrap px-4 py-3.5 text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
        {formatDate(tx.date)}
      </td>
      <td className="max-w-[180px] truncate px-4 py-3.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {tx.description || '—'}
      </td>
      <td className="px-4 py-3.5">
        <span className="inline-flex items-center rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
          {tx.category}
        </span>
      </td>
      <td className="px-4 py-3.5 text-sm text-neutral-700 dark:text-neutral-300">
        {paidByName}
      </td>
      <td className={`px-4 py-3.5 text-right text-sm font-semibold tabular-nums ${
        isIncome ? 'text-income' : 'text-expense'
      }`}>
        {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <ActionButtons tx={tx} groupId={groupId} onEdit={onEdit} onDeleted={onDeleted} />
        </div>
      </td>
    </tr>
  );
}

function MobileCard({ tx, members, groupId, onEdit, onDeleted }) {
  const isIncome     = tx.type === 'INCOME';
  const paidByMember = members.find((m) => (m.userId ?? m.id) === tx.paidBy);
  const paidByName   = paidByMember?.name ?? paidByMember?.email ?? tx.paidBy ?? 'Unknown';

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
            {paidByName} · {formatDate(tx.date)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`text-sm font-semibold tabular-nums ${isIncome ? 'text-income' : 'text-expense'}`}>
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </span>
        <div className="flex gap-1">
          <ActionButtons tx={tx} groupId={groupId} onEdit={onEdit} onDeleted={onDeleted} />
        </div>
      </div>
    </li>
  );
}

export default function GroupTransactionList({ transactions = [], isLoading, members = [], groupId, onEdit, onDeleted }) {
  if (isLoading) return <SkeletonCard lines={6} />;

  if (!transactions.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No transactions yet. Add the first expense to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile view */}
      <ul className="sm:hidden" aria-label="Group transactions">
        {transactions.map((tx, idx) => (
          <MobileCard
            key={tx.transactionId ?? tx.id ?? idx}
            tx={tx}
            members={members}
            groupId={groupId}
            onEdit={onEdit}
            onDeleted={onDeleted}
          />
        ))}
      </ul>

      {/* Desktop view */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left" aria-label="Group transactions table">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50">
              {['Date', 'Description', 'Category', 'Paid By', 'Amount', 'Actions'].map((heading) => (
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
            {transactions.map((tx, idx) => (
              <TransactionRow
                key={tx.transactionId ?? tx.id ?? idx}
                tx={tx}
                members={members}
                groupId={groupId}
                onEdit={onEdit}
                onDeleted={onDeleted}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
