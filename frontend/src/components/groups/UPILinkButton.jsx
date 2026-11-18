import { useState } from 'react';
import { QrCode, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/formatters';

/**
 * "Settle Up" button.
 *
 * When clicked it opens a modal showing the creditor's uploaded UPI QR image.
 * If the creditor hasn't uploaded one yet, a friendly fallback message is shown.
 *
 * Props:
 *   upiQrUrl  — S3 / CloudFront URL of the creditor's QR image (may be null)
 *   name      — creditor's display name / email
 *   amount    — amount owed in INR
 *   label     — button label (default: 'Settle Up')
 */
export default function UPILinkButton({ upiQrUrl, name, amount, label = 'Settle Up' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary gap-2"
      >
        <QrCode className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Scan to Pay" size="sm">
        <div className="flex flex-col items-center gap-5 py-2 text-center">

          {/* Amount summary */}
          <div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Pay <span className="font-semibold text-neutral-800 dark:text-neutral-200">{name}</span>
            </p>
            <p className="text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50 mt-1">
              {formatCurrency(amount)}
            </p>
          </div>

          {/* QR image or fallback */}
          {upiQrUrl ? (
            <div className="w-full">
              <img
                src={upiQrUrl}
                alt={`UPI QR code for ${name}`}
                className="mx-auto max-h-64 rounded-xl border border-neutral-200 dark:border-neutral-700 object-contain p-2 bg-white"
              />
              <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 p-8 w-full">
              <AlertCircle className="h-10 w-10 text-warning" aria-hidden="true" />
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                No UPI QR uploaded by this user.
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Ask <span className="font-medium">{name}</span> to upload their UPI QR code
                in the group settings so you can pay them directly.
              </p>
            </div>
          )}

          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
