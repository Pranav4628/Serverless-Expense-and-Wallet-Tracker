import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ErrorAlert from '../common/ErrorAlert';
import ReceiptUploader from './ReceiptUploader';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES, todayISO } from '../../utils/formatters';

const EMPTY_FORM = {
  amount:      '',
  type:        'EXPENSE',
  category:    '',
  date:        todayISO(),
  description: '',
  receiptKey:  '',
};

/**
 * TransactionModal — Add / Edit transaction form.
 */
export default function TransactionModal({ isOpen, onClose, onSubmit, transaction }) {
  const isEdit = !!transaction;
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setForm({
          amount:      String(transaction.amount ?? ''),
          type:        transaction.type        ?? 'EXPENSE',
          category:    transaction.category    ?? '',
          date:        transaction.date?.split('T')[0] ?? todayISO(),
          description: transaction.description ?? '',
          receiptKey:  transaction.receiptKey  ?? '',
        });
      } else {
        setForm({ ...EMPTY_FORM, date: todayISO() });
      }
      setErrors({});
      setApiError('');
    }
  }, [isOpen, transaction]);

  const validate = () => {
    const e = {};
    const amt = parseFloat(form.amount);
    if (!form.amount)       e.amount   = 'Amount is required.';
    else if (isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount greater than 0.';
    if (!form.type)         e.type     = 'Type is required.';
    if (!form.category)     e.category = 'Category is required.';
    if (!form.date)         e.date     = 'Date is required.';
    return e;
  };

  const handleChange = (field) => (e) => {
    const newValue = e.target.value;
    
    // If changing type, reset category if it doesn't exist in new type's categories
    if (field === 'type') {
      const newCategories = newValue === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      const currentCategory = form.category;
      
      setForm((prev) => ({
        ...prev,
        [field]: newValue,
        category: newCategories.includes(currentCategory) ? currentCategory : '',
      }));
      setErrors((prev) => ({ ...prev, [field]: undefined, category: undefined }));
    } else {
      setForm((prev) => ({ ...prev, [field]: newValue }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    setApiError('');
    try {
      await onSubmit({
        amount:      parseFloat(form.amount),
        type:        form.type,
        category:    form.category,
        date:        form.date,
        description: form.description.trim() || undefined,
        receiptKey:  form.receiptKey || undefined,
      });
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message ?? err.message ?? 'Failed to save transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Transaction' : 'Add Transaction'}
      size="lg"
    >
      <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5 mt-6">
        {/* Type tabs */}
        <div className="flex gap-2 p-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleChange('type')({ target: { value: t } })}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                form.type === t
                  ? t === 'EXPENSE'
                    ? 'bg-white dark:bg-neutral-800 text-expense dark:text-expense shadow-sm'
                    : 'bg-white dark:bg-neutral-800 text-income dark:text-income shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="tx-amount" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Amount <span aria-hidden="true" className="text-expense dark:text-expense">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 text-sm font-medium">₹</span>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              className={`input pl-9 ${errors.amount ? 'input-error' : ''}`}
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange('amount')}
              aria-invalid={!!errors.amount}
              aria-required="true"
            />
          </div>
          {errors.amount && <p className="mt-1.5 text-xs text-expense dark:text-expense">{errors.amount}</p>}
        </div>

        {/* Category + Date row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tx-category" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Category <span aria-hidden="true" className="text-expense dark:text-expense">*</span>
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
              {(form.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1.5 text-xs text-expense dark:text-expense">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="tx-date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Date <span aria-hidden="true" className="text-expense dark:text-expense">*</span>
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
            {errors.date && <p className="mt-1.5 text-xs text-expense dark:text-expense">{errors.date}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="tx-description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Description <span className="text-neutral-400 dark:text-neutral-500 font-normal text-xs">(optional)</span>
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

        {/* Receipt uploader */}
        <ReceiptUploader
          onUploadComplete={(key) => setForm((prev) => ({ ...prev, receiptKey: key }))}
          currentUrl={transaction?.receiptUrl}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving…
              </span>
            ) : (
              isEdit ? 'Save Changes' : 'Add Transaction'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
