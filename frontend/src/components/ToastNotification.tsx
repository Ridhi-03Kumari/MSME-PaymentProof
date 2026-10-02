import { useApp } from '../context/AppContext';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2" role="status" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white max-w-sm ${
            t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} aria-label="Dismiss" className="text-white/70 hover:text-white">&times;</button>
        </div>
      ))}
    </div>
  );
}
