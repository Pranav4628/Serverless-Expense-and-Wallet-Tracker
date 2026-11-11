import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

/**
 * Reusable drag-and-drop zone.
 * Accepts file types and a max size as props. Calls onFileSelected with one File.
 */
export default function DragDropUploader({
  accept = '',
  maxSizeBytes,
  onFileSelected,
  disabled = false,
  isUploading = false,
  label = 'Drag a file here or click to browse',
  hint = '',
}) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const validate = (file) => {
    if (!file) return 'Choose a file to upload.';

    if (accept) {
      const allowed = accept.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
      const name = file.name.toLowerCase();
      const mime = (file.type || '').toLowerCase();
      const matches = allowed.some((rule) => {
        if (rule.startsWith('.')) return name.endsWith(rule);
        if (rule.endsWith('/*')) return mime.startsWith(rule.slice(0, -1));
        return mime === rule;
      });
      if (!matches) return 'This file type is not allowed.';
    }

    if (maxSizeBytes && file.size > maxSizeBytes) {
      const mb = Math.round((maxSizeBytes / (1024 * 1024)) * 10) / 10;
      return `File must be ${mb} MB or smaller.`;
    }

    return '';
  };

  const acceptFile = (file) => {
    const message = validate(file);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    onFileSelected?.(file);
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || isUploading) return;
    if (event.type === 'dragenter' || event.type === 'dragover') setDragActive(true);
    if (event.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (disabled || isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) acceptFile(file);
    event.target.value = '';
  };

  return (
    <div>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isUploading) inputRef.current?.click();
        }}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors duration-150 ${
          disabled || isUploading ? 'cursor-default' : 'cursor-pointer'
        } ${
          dragActive
            ? 'border-primary-600 bg-primary-50 dark:border-primary-500 dark:bg-primary-900/20'
            : 'border-neutral-300 bg-neutral-50 hover:border-primary-500 dark:border-neutral-600 dark:bg-neutral-800/50 dark:hover:border-primary-500'
        }`}
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!disabled && !isUploading) inputRef.current?.click();
          }
        }}
        aria-disabled={disabled || isUploading}
      >
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          onChange={handleChange}
          disabled={disabled || isUploading}
          aria-label={label}
        />

        {isUploading ? (
          <div className="space-y-3 animate-pulse" aria-live="polite" aria-busy="true">
            <div className="mx-auto h-12 w-12 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
            <div className="mx-auto h-4 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="mx-auto h-3 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Uploading statement…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              dragActive ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-neutral-100 dark:bg-neutral-700'
            }`}>
              <Upload className={`h-6 w-6 ${
                dragActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'
              }`} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</p>
              {hint && <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-expense">{error}</p>}
    </div>
  );
}
