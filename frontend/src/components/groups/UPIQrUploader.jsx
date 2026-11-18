import { useRef, useState } from 'react';
import { Upload, CheckCircle2, QrCode } from 'lucide-react';
import { fetchPresignedUrl, uploadToS3 } from '../../services/uploadService';
import { saveGroupQrCode } from '../../services/groupService';

const ACCEPT = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * Lets the logged-in user upload their UPI QR code image for a group.
 * Flow: GET /uploads/presigned-url?type=qr  →  PUT S3  →  POST /groups/{id}/qr
 *
 * Props:
 *   groupId     — the current group's ID
 *   currentQrUrl — existing QR URL (if any) so we can show a preview
 *   onUploaded  — called with the new upiQrUrl on success
 */
export default function UPIQrUploader({ groupId, currentQrUrl, onUploaded }) {
  const inputRef              = useRef(null);
  const [preview, setPreview] = useState(currentQrUrl ?? null);
  const [status, setStatus]   = useState('idle'); // 'idle' | 'uploading' | 'done' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleFile = async (file) => {
    // ── Client-side validation ──────────────────────────────────────────────
    if (!ACCEPT.split(',').includes(file.type)) {
      setErrorMsg('Only JPG, PNG, or WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMsg('Image must be 2 MB or smaller.');
      return;
    }

    setErrorMsg('');
    setStatus('uploading');

    // Show local preview immediately so the user gets instant feedback
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      // 1. Get presigned URL from our backend
      const presigned = await fetchPresignedUrl('qr');

      // 2. PUT the file directly to S3
      await uploadToS3(presigned.uploadUrl, file);

      const upiQrUrl = presigned.s3ObjectKey ?? presigned.receiptUrl;
      if (!upiQrUrl) throw new Error('Upload succeeded but no S3 key was returned.');

      // 3. Save the key to the group membership record
      await saveGroupQrCode(groupId, upiQrUrl);

      setStatus('done');
      onUploaded?.(upiQrUrl);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message ?? err.message ?? 'Upload failed. Please try again.');
      // Revert preview to what was there before
      setPreview(currentQrUrl ?? null);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isUploading = status === 'uploading';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <QrCode className="h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Your UPI QR Code
        </p>
        {status === 'done' && (
          <span className="flex items-center gap-1 text-xs text-income">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Saved
          </span>
        )}
      </div>

      {/* Preview or drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-150 cursor-pointer
          ${isUploading
            ? 'cursor-default border-neutral-200 dark:border-neutral-700'
            : 'border-neutral-300 hover:border-primary-500 dark:border-neutral-600 dark:hover:border-primary-500'
          }
          ${preview ? 'p-2' : 'p-6'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={handleChange}
          disabled={isUploading}
          aria-label="Upload UPI QR code image"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-4 animate-pulse">
            <div className="h-20 w-20 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Uploading…</p>
          </div>
        ) : preview ? (
          <div className="relative group w-full">
            <img
              src={preview}
              alt="Your UPI QR code"
              className="mx-auto max-h-40 rounded-lg object-contain"
            />
            {/* Hover overlay prompts re-upload */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <Upload className="h-6 w-6 text-white mb-1" aria-hidden="true" />
              <p className="text-xs text-white font-medium">Replace QR</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-700">
              <Upload className="h-6 w-6 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                Click or drag to upload QR
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                JPG, PNG or WEBP · max 2 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs text-expense" role="alert">{errorMsg}</p>
      )}
      {!preview && !errorMsg && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Upload your UPI QR code so group members can scan and pay you directly.
        </p>
      )}
    </div>
  );
}
