import { useState } from 'react';
import { createGroup } from '../../services/groupService';
import Modal from '../common/Modal';
import ErrorAlert from '../common/ErrorAlert';

export default function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (!isLoading) {
      setGroupName('');
      setError('');
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      setError('Group name is required.');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Group name must be at least 2 characters.');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Group name must be 50 characters or less.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await createGroup({ groupName: trimmedName });
      setGroupName('');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to create group.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Group" size="sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <ErrorAlert message={error} onDismiss={() => setError('')} />

        <div>
          <label htmlFor="group-name" className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Group Name <span aria-hidden="true" className="text-expense">*</span>
          </label>
          <input
            id="group-name"
            type="text"
            className="input"
            placeholder="e.g. Apartment 3B, Family Trip"
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
              setError('');
            }}
            maxLength={50}
            disabled={isLoading}
            autoFocus
            aria-required="true"
          />
          <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Choose a name that helps identify the shared expenses.
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
            disabled={isLoading || !groupName.trim()}
          >
            {isLoading ? 'Creating…' : 'Create Group'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
