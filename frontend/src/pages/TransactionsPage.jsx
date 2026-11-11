import { useCallback, useEffect, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, FileUp } from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import TransactionList from '../components/transactions/TransactionList';
import TransactionModal from '../components/transactions/TransactionModal';
import TransactionFilterBar from '../components/transactions/TransactionFilterBar';
import DragDropUploader from '../components/common/DragDropUploader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorAlert from '../components/common/ErrorAlert';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { fetchPresignedUrl, uploadToS3, importCSV, importResultMessage } from '../services/uploadService';

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
  const [importOpen, setImportOpen]     = useState(false);
  const [isImporting, setIsImporting]   = useState(false);
  const [importError, setImportError]   = useState('');
  const [toast, setToast]               = useState('');
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

  const dismissToast = useCallback(() => setToast(''), []);

  const handleImportFile = async (file) => {
    setIsImporting(true);
    setImportError('');
    try {
      const presigned = await fetchPresignedUrl('csv');
      if (!presigned.s3ObjectKey) {
        throw new Error('Presigned URL response did not include an S3 object key.');
      }
      await uploadToS3(presigned.uploadUrl, file);
      const result = await importCSV(presigned.s3ObjectKey);
      setImportOpen(false);
      setToast(importResultMessage(result));
      await fetchTransactions();
    } catch (err) {
      setImportError(err.response?.data?.message ?? err.message ?? 'Failed to import statement.');
    } finally {
      setIsImporting(false);
    }
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="btn btn-secondary gap-2"
            onClick={() => {
              setImportError('');
              setImportOpen(true);
            }}
          >
            <FileUp className="h-5 w-5" aria-hidden="true" />
            <span>Import Statement</span>
          </button>
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={handleOpenAdd}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Errors */}
      {error        && <ErrorAlert message={error} />}
      {actionError  && <ErrorAlert message={actionError} onDismiss={() => setActionError('')} />}

      {/* Filter bar */}
      <TransactionFilterBar filters={filters} onUpdate={updateFilters} />

      {/* Table */}
      <TransactionList
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

      <Modal
        isOpen={importOpen}
        onClose={() => {
          if (!isImporting) setImportOpen(false);
        }}
        title="Import Statement"
        size="md"
      >
        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          Upload a bank or UPI statement. CSV files up to 5 MB.
        </p>
        <ErrorAlert message={importError} onDismiss={() => setImportError('')} />
        <DragDropUploader
          accept=".csv,text/csv"
          maxSizeBytes={5 * 1024 * 1024}
          onFileSelected={handleImportFile}
          isUploading={isImporting}
          disabled={isImporting}
          label="Drag a CSV here or click to browse"
          hint="CSV up to 5 MB"
        />
      </Modal>

      <Toast message={toast} onDismiss={dismissToast} />

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
