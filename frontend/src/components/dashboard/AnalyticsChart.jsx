import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import SkeletonCard from '../common/SkeletonCard';

const COLORS = [
  '#2563eb', // primary-600
  '#7c3aed', // purple-600
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value, percentage } = payload[0].payload;
    return (
      <div className="rounded-lg border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 px-3 py-2 shadow-modal text-sm animate-scale-in">
        <p className="font-semibold text-neutral-800 dark:text-neutral-200">{name}</p>
        <p className="text-neutral-600 dark:text-neutral-400 tabular-nums">
          {formatCurrency(value)} ({percentage.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }) {
  return (
    <ul className="space-y-2 mt-4" aria-label="Category breakdown">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center justify-between gap-2 text-sm group">
          <span className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span className="truncate text-neutral-700 dark:text-neutral-300">{entry.value}</span>
          </span>
          <span className="shrink-0 font-semibold text-neutral-600 dark:text-neutral-400 tabular-nums">
            {entry.payload.percentage.toFixed(1)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * AnalyticsChart — doughnut chart + category list with % breakdown.
 */
export default function AnalyticsChart({ categories = [], isLoading }) {
  if (isLoading) return <SkeletonCard lines={6} />;

  if (!categories.length) {
    return (
      <div className="card flex flex-col items-center justify-center h-80 text-center animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No expense data for this period.</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Add some expenses to see the breakdown</p>
      </div>
    );
  }

  // Compute percentages
  const totalExpense = categories.reduce((sum, c) => sum + (c.totalAmount ?? c.amount ?? 0), 0);
  const data = categories.map((c, i) => {
    const amount = c.totalAmount ?? c.amount ?? 0;
    return {
      name:       c.category ?? c.name,
      value:      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      fill:       COLORS[i % COLORS.length],
    };
  });

  return (
    <div className="card animate-slide-up" style={{ animationDelay: '50ms' }}>
      <h2 className="heading-3 mb-6">Expense Breakdown</h2>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Chart */}
        <div className="w-full md:w-1/2" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
                aria-label="Category spending doughnut chart"
                animationBegin={0}
                animationDuration={500}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell 
                    key={entry.name} 
                    fill={entry.fill}
                    className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category list */}
        <div className="w-full md:w-1/2">
          <ul className="space-y-3" aria-label="Category amounts">
            {data.map((item) => (
              <li key={item.name} className="flex items-center justify-between text-sm gap-3 group hover:bg-neutral-50 dark:hover:bg-neutral-700/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors duration-150">
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
                    style={{ backgroundColor: item.fill }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-neutral-700 dark:text-neutral-300 font-medium">{item.name}</span>
                </span>
                <span className="shrink-0 text-neutral-900 dark:text-neutral-100 font-semibold tabular-nums">
                  {formatCurrency(item.value)}
                  <span className="text-neutral-400 dark:text-neutral-500 font-normal ml-1.5">
                    ({item.percentage.toFixed(1)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
