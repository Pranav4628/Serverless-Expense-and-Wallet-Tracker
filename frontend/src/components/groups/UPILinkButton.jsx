import { useState } from 'react';
import { Smartphone, QrCode } from 'lucide-react';
import Modal from '../common/Modal';

/**
 * Generates a UPI deep link string.
 * @param {{ upiId: string, name: string, amount: number }} params
 * @returns {string}
 */
function generateUPILink({ upiId, name, amount }) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: 'Settlement via FinTrack',
  });
  return `upi://pay?${params.toString()}`;
}

/**
 * Detects if the user is on a mobile device.
 */
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * UPILinkButton - Launches UPI app on mobile, shows QR on desktop.
 */
export default function UPILinkButton({ upiId, name, amount, label = 'Settle Up' }) {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const upiLink = generateUPILink({ upiId, name, amount });

  const handleClick = () => {
    if (isMobileDevice()) {
      // On mobile: launch UPI app directly
      window.location.href = upiLink;
    } else {
      // On desktop: show QR code modal
      setQrModalOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="btn btn-primary gap-2"
        title={isMobileDevice() ? 'Open UPI app' : 'Show QR code'}
      >
        <Smartphone className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>

      {/* QR Code Modal (Desktop) */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Scan to Pay"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="flex h-48 w-48 mx-auto items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
            <QrCode className="h-24 w-24 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Amount: ₹{amount.toFixed(2)}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Scan this QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.)
            </p>
          </div>
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono break-all">
              {upiLink}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={() => setQrModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
