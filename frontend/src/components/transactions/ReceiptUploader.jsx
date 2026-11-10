import { useState, useRef } from 'react';
import { Upload, FileText, X, Check } from 'lucide-react';

export default function ReceiptUploader({ onUploadComplete, currentUrl }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || '');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const file = files[0];
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPG, PNG, WEBP) or PDF file');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB');
      return;
    }

    setUploading(true);
    
    try {
      // Simulate upload - replace with actual S3 upload logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const mockUrl = `https://receipts.example.com/${file.name}`;
      setUploadedUrl(mockUrl);
      onUploadComplete(mockUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload receipt. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadedUrl('');
    onUploadComplete('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        Receipt <span className="text-neutral-400 dark:text-neutral-500 font-normal text-xs">(optional)</span>
      </label>

      {uploadedUrl ? (
        // Uploaded state
        <div className="flex items-center gap-3 p-4 border-2 border-neutral-200 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-700/50 transition-colors duration-150">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
              Receipt uploaded
            </p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              View receipt
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg p-2 text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-150"
            aria-label="Remove receipt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-500 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={handleChange}
            aria-label="Upload receipt"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-200 dark:border-neutral-700 border-t-primary-600 dark:border-t-primary-500" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 ${
                dragActive 
                  ? 'bg-primary-100 dark:bg-primary-900/50' 
                  : 'bg-neutral-100 dark:bg-neutral-700'
              }`}>
                <Upload className={`h-6 w-6 transition-colors duration-200 ${
                  dragActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-neutral-400 dark:text-neutral-500'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Drag a receipt here or <span className="text-primary-600 dark:text-primary-500">click to browse</span>
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  JPG, PNG, WEBP or PDF up to 1 MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
