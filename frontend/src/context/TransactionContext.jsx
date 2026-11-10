/**
 * TransactionContext.jsx
 * Manages transaction list state, filters, and CRUD operations.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import * as txService from '../services/transactionService';
import { getDateRange } from '../utils/formatters';

const TransactionContext = createContext(null);

// Errors caused by an unconfigured API URL should not show as red banners.
function isConfigError(err) {
  return (
    err?.isApiNotConfigured === true ||
    err?.message === 'API_NOT_CONFIGURED' ||
    err?.message?.includes('Invalid URL') ||
    err?.message?.includes('Network Error')
  );
}

// Normalize transaction fields to consistent shape regardless of Lambda response format
function normalizeTransaction(tx) {
  // Resolve ID: prefer transactionId > txId > extracted from SK
  let resolvedId = tx.transactionId ?? tx.id ?? tx.txId ?? null;
  if (!resolvedId && tx.SK) {
    const parts = tx.SK.split('#');
    if (parts.length >= 3 && parts[0] === 'TX') {
      resolvedId = parts[2];
    }
  }

  // Resolve date: prefer date > createdAt
  const resolvedDate = tx.date ?? tx.createdAt ?? null;

  // Resolve description: empty string should show as undefined (renders as —)
  const resolvedDescription = tx.description || undefined;

  return {
    ...tx,
    transactionId: resolvedId,
    id:            resolvedId,
    date:          resolvedDate,
    description:   resolvedDescription,
  };
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary]           = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [categories, setCategories]     = useState([]);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState(null);
  const [filters, setFilters]           = useState(() => ({
    ...getDateRange('current_month'),
    category: '',
    type: '',
    page: 1,
    limit: 20,
  }));
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  // Fetch transactions
  const fetchTransactions = useCallback(async (overrides = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { ...filters, ...overrides };
      const data = await txService.getTransactions(params);
      const rawTxs = data.transactions ?? data.items ?? data;
      // Normalize all transactions to have id field
      setTransactions(rawTxs.map(normalizeTransaction));
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      if (!isConfigError(err)) {
        setError(err.response?.data?.message ?? err.message ?? 'Failed to load transactions.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch analytics summary
  const fetchSummary = useCallback(async (params = {}) => {
    try {
      const response = await txService.getAnalyticsSummary({
        startDate: filters.startDate,
        endDate:   filters.endDate,
        ...params,
      });
      // Handle nested response structure: { status: "success", data: { totalIncome, totalExpense, netBalance } }
      const analytics = response.data || response;
      setSummary({
        totalIncome:   analytics.totalIncome   ?? 0,
        totalExpenses: analytics.totalExpenses ?? analytics.totalExpense ?? 0,  // handle both singular and plural
        netBalance:    analytics.netBalance    ?? 0,
      });
    } catch {
      // non-fatal — keep previous value
    }
  }, [filters.startDate, filters.endDate]);

  // Fetch category breakdown
  const fetchCategories = useCallback(async (params = {}) => {
    try {
      const response = await txService.getAnalyticsCategories({
        startDate: filters.startDate,
        endDate:   filters.endDate,
        ...params,
      });
      // Handle nested response structure and aggregate by category
      const analytics = response.data || response;
      const rawItems = analytics.categoryBreakdown ?? analytics.categories ?? analytics.items ?? analytics;

      // If it's an array of individual transactions (has txId), aggregate by category
      if (Array.isArray(rawItems) && rawItems.length > 0 && rawItems[0]?.txId) {
        const categoryMap = new Map();
        rawItems.forEach(tx => {
          if (tx.type === 'EXPENSE') {
            const cat = tx.category;
            categoryMap.set(cat, (categoryMap.get(cat) || 0) + (tx.amount || 0));
          }
        });
        setCategories(
          Array.from(categoryMap.entries()).map(([category, totalAmount]) => ({ category, totalAmount }))
        );
      } else {
        // Already aggregated data or empty
        setCategories(Array.isArray(rawItems) ? rawItems : []);
      }
    } catch (err) {
      console.error('fetchCategories failed:', err);
    }
  }, [filters.startDate, filters.endDate]);

  // Create
  const createTransaction = useCallback(async (payload) => {
    const created = await txService.createTransaction(payload);
    await fetchTransactions();
    await fetchSummary();
    return created;
  }, [fetchTransactions, fetchSummary]);

  // Update
  const updateTransaction = useCallback(async (id, payload) => {
    const updated = await txService.updateTransaction(id, payload);
    setTransactions((prev) =>
      prev.map((t) => (t.transactionId === id || t.id === id ? { ...t, ...updated } : t)),
    );
    await fetchSummary();
    return updated;
  }, [fetchSummary]);

  // Delete
  const deleteTransaction = useCallback(async (id) => {
    await txService.deleteTransaction(id);
    setTransactions((prev) =>
      prev.filter((t) => t.transactionId !== id && t.id !== id),
    );
    await fetchSummary();
  }, [fetchSummary]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const value = {
    transactions, summary, categories, isLoading, error,
    filters, pagination,
    fetchTransactions, fetchSummary, fetchCategories,
    createTransaction, updateTransaction, deleteTransaction,
    updateFilters,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used inside <TransactionProvider>');
  return ctx;
}

export default TransactionContext;





