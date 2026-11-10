import { useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import StatCards from '../components/dashboard/StatCards';
import AnalyticsChart from '../components/dashboard/AnalyticsChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import DateRangeFilter from '../components/dashboard/DateRangeFilter';
import ErrorAlert from '../components/common/ErrorAlert';

export default function DashboardPage() {
  const {
    transactions,
    summary,
    categories,
    isLoading,
    error,
    filters,
    fetchTransactions,
    fetchSummary,
    fetchCategories,
    updateFilters,
  } = useTransactions();

  // Fetch all data when filters change
  useEffect(() => {
    fetchSummary();
    fetchCategories();
    fetchTransactions({ limit: 5 });
  }, [filters.startDate, filters.endDate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Your financial overview at a glance</p>
        </div>
        <DateRangeFilter filters={filters} onUpdate={updateFilters} />
      </div>

      {/* Error */}
      {error && <ErrorAlert message={error} />}

      {/* Stat cards */}
      <StatCards summary={summary} isLoading={isLoading} />

      {/* Charts + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart categories={categories} isLoading={isLoading} />
        <RecentTransactions transactions={transactions} isLoading={isLoading} />
      </div>
    </div>
  );
}
