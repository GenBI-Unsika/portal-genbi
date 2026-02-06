import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <p className="mt-3 text-sm">{message}</p>
    </div>
  );
}
