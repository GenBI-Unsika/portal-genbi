import EmptyState from '../components/EmptyState';

// Halaman Shortcuts - Fitur dalam pengembangan
// Shortcut dan booking tanggal akan dikelola melalui API server di masa depan
export default function Shortcuts() {
  return (
    <div className="page-enter space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-neutral-900 animate-fade-in">Shortcuts & Booking</h3>
      <div className="animate-fade-in-up">
        <EmptyState
          icon="link"
          title="Fitur dalam pengembangan"
          description="Shortcut dan booking tanggal sedang dalam pengembangan dan akan segera tersedia. Fitur ini akan terintegrasi dengan server untuk menyimpan data secara permanen."
          variant="primary"
        />
      </div>
    </div>
  );
}
