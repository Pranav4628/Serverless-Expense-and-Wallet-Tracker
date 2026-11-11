import { useEffect, useState } from 'react';
import ErrorAlert from '../common/ErrorAlert';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES, todayISO } from '../../utils/formatters';
import { fetchPresignedUrl, uploadToS3 } from '../../services/uploadService';

const EMPTY_FORM = {
  amount: '',
  type: 'EXPENSE',
  category: '',
  date: todayISO(),
  description: '',
  receiptUrl: '',
  taxDeductible: false,
};

const RECEIPT_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

/**
 * Add / edit transaction fields, including an optional receipt and tax flag.
 */
export default function TransactionForm({ transaction, onSubmit, onCancel }) {
  const isEdit = !!transaction;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: String(transaction.amount ?? ''),
        type: transaction.type ?? 'EXPENSE',
        category: transaction.category ?? '',
        date: transaction.date?.split('T')[0] ?? todayISO(),
        description: transaction.description ?? '',
        receiptUrl: transaction.receiptUrl ?? '',
        taxDeductible: Boolean(transaction.taxDeductible),
      });
    } else {
      setForm({ ...EMPTY_FORM, date: todayISO() });
    }
    setErrors({});
    setApiError('');
  }, [transaction]);

  const validate = () => {
    const next = {};
    const amt = parseFloat(form.amount);
    if (!form.amount) next.amount = 'Amount is required.';
    else if (Number.isNaN(amt) || amt <= 0) next.amount = 'Enter a valid amount greater than 0.';
    if (!form.type) next.type = 'Type is required.';
    if (!form.category) next.category = 'Category is required.';
    if (!form.date) next.date = 'Date is required.';
    return next;
  };

  const handleChange = (field) => (event) => {
    const newValue = event.target.value;

    if (field === 'type') {
      const newCategories = newValue === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      setForm((prev) => ({
        ...prev,
        type: newValue,
        category: newCategories.includes(prev.category) ? prev.category : '',
      }));
      setErrors((prev) => ({ ...prev, type: undefined, category: undefined }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: newValue }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleTaxToggle = (event) => {
    const checked = event.target.checked;
    setForm((prev) => ({ ...prev, taxDeductible: checked }));
  };

  const handleReceipt = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const allowed = RECEIPT_ACCEPT.split(',');
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, receipt: 'Upload a JPG, PNG, WEBP, or GIF image.' }));
      return;
    }

    setErrors((prev) => ({ ...prev, receipt: undefined }));
    setIsUploadingReceipt(true);
    setApiError('');
    try {
      const presigned = await fetchPresignedUrl('receipt');
      await uploadToS3(presigned.uploadUrl, file);
      const receiptUrl = presigned.receiptUrl || presigned.s3ObjectKey || '';
      if (!receiptUrl) {
        throw new Error('Upload succeeded but the API did not return a receipt URL.');
      }
      setForm((prev) => ({ ...prev, receiptUrl }));
    } catch (err) {
      setApiError(err.response?.data?.message ?? err.message ?? 'Failed to upload receipt.');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');
    try {
      await onSubmit({
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        description: form.description.trim() || undefined,
        receiptUrl: form.receiptUrl || undefined,
        taxDeductible: form.taxDeductible,
      });
    } catch (err) {
      setApiError(err.response?.data?.message ?? err.message ?? 'Failed to save transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div className="flex gap-2 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-700">
          {TRANSACTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange('type')({ target: { value: type } })}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                form.type === type
                  ? type === 'EXPENSE'
                    ? 'bg-white text-expense shadow-sm dark:bg-neutral-800'
                    : 'bg-white text-income shadow-sm dark:bg-neutral-800'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="tx-amount" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Amount <span aria-hidden="true" className="text-expense">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400 dark:text-neutral-500">₹</span>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              className={`input pl-9 tabular-nums ${errors.amount ? 'input-error' : ''}`}
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange('amount')}
              aria-invalid={!!errors.amount}
              aria-required="true"
            />
          </div>
          {errors.amount && <p className="mt-1.5 text-xs text-expense">{errors.amount}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tx-category" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Category <span aria-hidden="true" className="text-expense">*</span>
            </label>
            <select
              id="tx-category"
              className={`input ${errors.category ? 'input-error' : ''}`}
              value={form.category}
              onChange={handleChange('category')}
              aria-invalid={!!errors.category}
              aria-required="true"
            >
              <option value="">Select a category…</option>
              {(form.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-xs text-expense">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="tx-date" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Date <span aria-hidden="true" className="text-expense">*</span>
            </label>
            <input
              id="tx-date"
              type="date"
              className={`input ${errors.date ? 'input-error' : ''}`}
              value={form.date}
              onChange={handleChange('date')}
              aria-invalid={!!errors.date}
              aria-required="true"
            />
            {errors.date && <p className="mt-1.5 text-xs text-expense">{errors.date}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="tx-description" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">(optional)</span>
          </label>
          <input
            id="tx-description"
            type="text"
            className="input"
            placeholder="e.g. Monthly groceries"
            value={form.description}
            onChange={handleChange('description')}
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="tx-receipt" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Receipt <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">(optional)</span>
          </label>
          <input
            id="tx-receipt"
            type="file"
            accept={RECEIPT_ACCEPT}
            className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-200 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-200 dark:hover:file:bg-neutral-600"
            onChange={handleReceipt}
            disabled={isUploadingReceipt || isLoading}
          />
          {isUploadingReceipt && (
            <div className="mt-3 space-y-2 animate-pulse" aria-live="polite">
              <div className="h-3 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Uploading receipt…</p>
            </div>
          )}
          {form.receiptUrl && !isUploadingReceipt && (
            <p className="mt-2 text-xs text-income">Receipt attached.</p>
          )}
          {errors.receipt && <p className="mt-1.5 text-xs text-expense">{errors.receipt}</p>}
        </div>

        <label className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-700">
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
            Mark as Tax Deductible
          </span>
          <input
            type="checkbox"
            role="switch"
            className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-600 dark:border-neutral-600 dark:bg-neutral-800"
            checked={form.taxDeductible}
            onChange={handleTaxToggle}
            aria-label="Mark as Tax Deductible"
          />
        </label>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading || isUploadingReceipt}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading || isUploadingReceipt}>
            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </>
  );
}
