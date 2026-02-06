import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message = 'Terjadi kesalahan', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-neutral-600">
      <div className="rounded-full bg-red-100 p-3">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <p className="mt-3 text-sm font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition">
          <RefreshCw className="h-4 w-4" />
          Coba lagi
        </button>
      )}
    </div>
  );
}
