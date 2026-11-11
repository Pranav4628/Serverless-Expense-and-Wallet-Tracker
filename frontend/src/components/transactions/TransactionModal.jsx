import Modal from '../common/Modal';
import TransactionForm from './TransactionForm';

/**
 * Add / Edit transaction dialog. Form fields live in TransactionForm.
 */
export default function TransactionModal({ isOpen, onClose, onSubmit, transaction }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add Transaction'}
      size="lg"
    >
      {isOpen && (
        <TransactionForm
          key={transaction?.transactionId ?? transaction?.id ?? 'new'}
          transaction={transaction}
          onSubmit={async (data) => {
            await onSubmit(data);
            onClose();
          }}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}
