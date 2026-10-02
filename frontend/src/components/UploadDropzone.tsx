import { useCallback, useRef, useState } from 'react';

type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'success' | 'error';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_SIZE_MB = 10;

interface UploadDropzoneProps {
  label: string;
  onFile: (file: File) => Promise<void>;
  optional?: boolean;
  accept?: string;
}

export function UploadDropzone({ label, onFile, optional = false, accept = '.pdf,.jpg,.jpeg,.png' }: UploadDropzoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Only PDF, JPG, and PNG files are allowed.';
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File must be under ${MAX_SIZE_MB}MB.`;
    return null;
  };

  const processFile = async (file: File) => {
    const err = validate(file);
    if (err) { setErrorMsg(err); setState('error'); return; }
    setFileName(file.name);
    setErrorMsg(null);
    setState('uploading');
    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate upload
      setState('processing');
      await onFile(file);
      setState('success');
    } catch {
      setState('error');
      setErrorMsg('Upload failed. Please try again.');
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState('idle');
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setState('dragging'); };
  const onDragLeave = () => setState('idle');
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const stateStyles = {
    idle: 'border-gray-300 bg-white hover:border-blue-400',
    dragging: 'border-blue-500 bg-blue-50',
    uploading: 'border-blue-400 bg-blue-50',
    processing: 'border-blue-400 bg-blue-50',
    success: 'border-green-400 bg-green-50',
    error: 'border-red-400 bg-red-50',
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${stateStyles[state]}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label={`Upload ${label}`}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} onChange={onInputChange} className="hidden" aria-hidden="true" />
      {state === 'idle' && (
        <>
          <div className="text-3xl mb-2">📎</div>
          <p className="font-medium text-gray-700">{label} {optional && <span className="text-xs text-gray-400">(optional)</span>}</p>
          <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG · Max {MAX_SIZE_MB}MB</p>
        </>
      )}
      {state === 'dragging' && <p className="text-blue-600 font-medium">Drop to upload</p>}
      {state === 'uploading' && <p className="text-blue-600">Uploading {fileName}…</p>}
      {state === 'processing' && <p className="text-blue-600">Extracting information…</p>}
      {state === 'success' && <p className="text-green-700 font-medium">✓ {fileName} uploaded successfully</p>}
      {state === 'error' && <p className="text-red-600">{errorMsg}</p>}
    </div>
  );
}
