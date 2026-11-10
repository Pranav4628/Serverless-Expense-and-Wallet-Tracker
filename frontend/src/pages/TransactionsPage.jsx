import { useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import TransactionTable from '../components/transactions/TransactionTable';
import TransactionModal from '../components/transactions/TransactionModal';
import TransactionFilterBar from '../components/transactions/TransactionFilterBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorAlert from '../components/common/ErrorAlert';

export default function TransactionsPage() {
  const {
    transactions,
    isLoading,
    error,
    filters,
    pagination,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
  } = useTransactions();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionError, setActionError]   = useState('');

  // Fetch whenever filters change
  useEffect(() => {
    fetchTransactions();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setEditTarget(tx);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editTarget) {
        await updateTransaction(editTarget.transactionId ?? editTarget.id, data);
      } else {
        await createTransaction(data);
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? 'Failed to save transaction.';
      setActionError(msg);
      throw err; // re-throw so modal stays open
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.transactionId ?? deleteTarget.id);
    } catch (err) {
      setActionError(err.response?.data?.message ?? err.message ?? 'Failed to delete transaction.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handlePageChange = (newPage) => {
    updateFilters({ page: newPage });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="heading-1">Transactions</h1>
          <p className="text-sm text-muted mt-1">
            {pagination.total > 0 ? pagination.total : transactions.length} {pagination.total === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary gap-2"
          onClick={handleOpenAdd}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Errors */}
      {error        && <ErrorAlert message={error} />}
      {actionError  && <ErrorAlert message={actionError} onDismiss={() => setActionError('')} />}

      {/* Filter bar */}
      <TransactionFilterBar filters={filters} onUpdate={updateFilters} />

      {/* Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={(tx) => setDeleteTarget(tx)}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div
          className="flex items-center justify-center gap-3"
          role="navigation"
          aria-label="Pagination"
        >
          <button
            type="button"
            className="btn btn-secondary gap-2"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium px-4 py-2">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            type="button"
            className="btn btn-secondary gap-2"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add / Edit modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        transaction={editTarget}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete transaction?"
        message={`Are you sure you want to delete "${deleteTarget?.description || deleteTarget?.category}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
