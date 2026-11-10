import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import SkeletonCard from '../common/SkeletonCard';

function TransactionRow({ tx }) {
  const isIncome = tx.type === 'INCOME';
  return (
    <li className="flex items-center gap-3 py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0 transition-colors duration-150 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 -mx-2 px-2 rounded-lg">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-transform duration-200 hover:scale-110 ${
          isIncome 
            ? 'bg-income-light dark:bg-income-dark/20 text-income-dark dark:text-income' 
            : 'bg-expense-light dark:bg-expense-dark/20 text-expense-dark dark:text-expense'
        }`}
        aria-hidden="true"
      >
        {isIncome ? '+' : '−'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {tx.description || tx.category}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {tx.category} · {formatDate(tx.date)}
        </p>
      </div>
      <span className={`text-sm font-semibold shrink-0 tabular-nums ${
        isIncome ? 'text-income dark:text-income' : 'text-expense dark:text-expense'
      }`}>
        {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
      </span>
    </li>
  );
}

export default function RecentTransactions({ transactions = [], isLoading }) {
  if (isLoading) return <SkeletonCard lines={5} />;

  // Sort transactions by date descending (newest first)
  const sorted = [...transactions].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0);
    const dateB = new Date(b.date || b.createdAt || 0);
    return dateB - dateA;
  });
  
  const recent = sorted.slice(0, 5);

  return (
    <div className="card animate-slide-up" style={{ animationDelay: '100ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="heading-3">Recent Transactions</h2>
        <Link
          to="/transactions"
          className="flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-500 rounded-lg px-2 py-1 transition-colors duration-150"
        >
          <span>View all</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">No transactions yet.</p>
          <Link 
            to="/transactions" 
            className="inline-block mt-3 text-sm text-primary-600 dark:text-primary-500 hover:underline"
          >
            Add your first transaction
          </Link>
        </div>
      ) : (
        <ul aria-label="Recent transactions">
          {recent.map((tx) => (
            <TransactionRow key={tx.transactionId ?? tx.id} tx={tx} />
          ))}
        </ul>
      )}
    </div>
  );
}
