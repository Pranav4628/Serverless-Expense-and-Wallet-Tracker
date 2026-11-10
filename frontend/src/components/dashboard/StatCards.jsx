import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import SkeletonCard from '../common/SkeletonCard';

function StatCard({ title, value, icon: Icon, colorClass, iconBgClass, isBalance }) {
  return (
    <div className="card card-hover group animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">{title}</p>
          <p className={`text-2xl font-bold tabular-nums ${
            isBalance 
              ? (parseFloat(value.replace(/[^0-9.-]/g, '')) >= 0 
                  ? 'text-income dark:text-income' 
                  : 'text-expense dark:text-expense')
              : 'text-neutral-900 dark:text-neutral-50'
          }`}>
            {value}
          </p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBgClass} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${colorClass}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/**
 * StatCards — displays Total Income, Total Expenses, Net Balance.
 */
export default function StatCards({ summary, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    );
  }

  const { totalIncome = 0, totalExpenses = 0, netBalance = 0 } = summary ?? {};

  const cards = [
    {
      title:       'Total Income',
      value:       formatCurrency(totalIncome),
      icon:        TrendingUp,
      colorClass:  'text-income-dark dark:text-income',
      iconBgClass: 'bg-income-light dark:bg-income-dark/20',
      isBalance:   false,
    },
    {
      title:       'Total Expenses',
      value:       formatCurrency(totalExpenses),
      icon:        TrendingDown,
      colorClass:  'text-expense-dark dark:text-expense',
      iconBgClass: 'bg-expense-light dark:bg-expense-dark/20',
      isBalance:   false,
    },
    {
      title:       'Net Balance',
      value:       formatCurrency(netBalance, true),
      icon:        Wallet,
      colorClass:  netBalance >= 0 
        ? 'text-primary-700 dark:text-primary-400' 
        : 'text-expense-dark dark:text-expense',
      iconBgClass: netBalance >= 0
        ? 'bg-primary-100 dark:bg-primary-900/30'
        : 'bg-expense-light dark:bg-expense-dark/20',
      isBalance:   true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" role="list" aria-label="Financial summary">
      {cards.map((card, idx) => (
        <div 
          key={card.title} 
          role="listitem"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <StatCard {...card} />
        </div>
      ))}
    </div>
  );
}
