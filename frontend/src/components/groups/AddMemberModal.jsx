import { useState } from 'react';
import { addGroupMember } from '../../services/groupService';
import Modal from '../common/Modal';
import ErrorAlert from '../common/ErrorAlert';

export default function AddMemberModal({ isOpen, onClose, onSuccess, groupId, existingMembers = [] }) {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      setApiError('');
      onClose();
    }
  };

  const validate = (value) => {
    if (!value) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
    const alreadyIn = existingMembers.some((m) => m.name === value || m.email === value);
    if (alreadyIn) return 'This member is already in the group.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    const validationError = validate(trimmed);
    if (validationError) { setError(validationError); return; }

    setIsLoading(true);
    setApiError('');
    try {
      await addGroupMember(groupId, { email: trimmed });
      setEmail('');
      onSuccess?.();
    } catch (err) {
      setApiError(err.response?.data?.message ?? err.message ?? 'Failed to add member.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Group Member" size="sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <ErrorAlert message={apiError} onDismiss={() => setApiError('')} />

        <div>
          <label
            htmlFor="member-email"
            className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Friend's Email Address <span aria-hidden="true" className="text-expense">*</span>
          </label>
          <input
            id="member-email"
            type="email"
            className={`input ${error ? 'input-error' : ''}`}
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            disabled={isLoading}
            autoFocus
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? 'member-email-error' : undefined}
          />
          {error && (
            <p id="member-email-error" className="mt-1.5 text-xs text-expense">{error}</p>
          )}
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Enter the email address of the person you want to add.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? 'Adding…' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
