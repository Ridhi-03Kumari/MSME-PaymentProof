
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="alert">
      <div className="text-4xl mb-4">⚠️</div>
      <p className="text-red-600 font-medium mb-2">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Try again
        </button>
      )}
    </div>
  );
}
