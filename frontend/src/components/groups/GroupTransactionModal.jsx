import { useEffect, useState } from 'react';
import { createGroupTransaction } from '../../services/groupService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import ErrorAlert from '../common/ErrorAlert';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TRANSACTION_TYPES, todayISO } from '../../utils/formatters';

const EMPTY_FORM = {
  amount: '',
  type: 'EXPENSE',
  category: '',
  date: todayISO(),
  description: '',
  paidBy: '',
};

export default function GroupTransactionModal({ isOpen, onClose, onSuccess, groupId, members = [], transaction }) {
  const { user } = useAuth();
  const isEdit = !!transaction;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        amount: String(transaction.amount ?? ''),
        type: transaction.type ?? 'EXPENSE',
        category: transaction.category ?? '',
        date: transaction.date?.split('T')[0] ?? todayISO(),
        description: transaction.description ?? '',
        paidBy: transaction.paidBy ?? '',
      });
    } else {
      // Pre-select the current user if their userId appears in the members list,
      // otherwise leave empty so the user makes an explicit choice.
      const currentUserId = user?.sub ?? '';
      const defaultPaidBy = members.some((m) => m.userId === currentUserId)
        ? currentUserId
        : '';
      setForm({ ...EMPTY_FORM, date: todayISO(), paidBy: defaultPaidBy });
    }
    setErrors({});
    setApiError('');
  }, [transaction, user, isOpen]);

  const validate = () => {
    const next = {};
    const amt = parseFloat(form.amount);
    if (!form.amount) next.amount = 'Amount is required.';
    else if (Number.isNaN(amt) || amt <= 0) next.amount = 'Enter a valid amount greater than 0.';
    if (!form.type) next.type = 'Type is required.';
    if (!form.category) next.category = 'Category is required.';
    if (!form.date) next.date = 'Date is required.';
    if (!form.paidBy) next.paidBy = 'Please select who paid.';
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
      await createGroupTransaction(groupId, {
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        date: form.date,
        description: form.description.trim() || undefined,
        paidBy: form.paidBy,
      });
      onSuccess?.();
    } catch (err) {
      setApiError(err.response?.data?.message ?? err.message ?? 'Failed to save transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Group Expense' : 'Add Group Expense'} size="lg">
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
          <label htmlFor="gtx-amount" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Amount <span aria-hidden="true" className="text-expense">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400 dark:text-neutral-500">₹</span>
            <input
              id="gtx-amount"
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
            <label htmlFor="gtx-category" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Category <span aria-hidden="true" className="text-expense">*</span>
            </label>
            <select
              id="gtx-category"
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
            <label htmlFor="gtx-date" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Date <span aria-hidden="true" className="text-expense">*</span>
            </label>
            <input
              id="gtx-date"
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
          <label htmlFor="gtx-paidby" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Paid By <span aria-hidden="true" className="text-expense">*</span>
          </label>
          <select
            id="gtx-paidby"
            className={`input ${errors.paidBy ? 'input-error' : ''}`}
            value={form.paidBy}
            onChange={handleChange('paidBy')}
            aria-invalid={!!errors.paidBy}
            aria-required="true"
          >
            <option value="">Select member…</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name}
              </option>
            ))}
          </select>
          {errors.paidBy && <p className="mt-1.5 text-xs text-expense">{errors.paidBy}</p>}
        </div>

        <div>
          <label htmlFor="gtx-description" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Description <span className="text-xs font-normal text-neutral-400 dark:text-neutral-500">(optional)</span>
          </label>
          <input
            id="gtx-description"
            type="text"
            className="input"
            placeholder="e.g. Monthly groceries"
            value={form.description}
            onChange={handleChange('description')}
            maxLength={200}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
