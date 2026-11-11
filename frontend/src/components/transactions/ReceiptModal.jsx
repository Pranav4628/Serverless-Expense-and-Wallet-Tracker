import Modal from '../common/Modal';

/**
 * Lightbox for a transaction receipt stored in S3.
 */
export default function ReceiptModal({ isOpen, onClose, receiptUrl }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt" size="lg">
      {receiptUrl ? (
        <div className="space-y-3">
          <img
            src={receiptUrl}
            alt="Transaction receipt"
            className="max-h-[70vh] w-full rounded-lg object-contain bg-neutral-50 dark:bg-neutral-900"
          />
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link text-sm"
          >
            Open receipt in a new tab
          </a>
        </div>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No receipt attached.</p>
      )}
    </Modal>
  );
}
