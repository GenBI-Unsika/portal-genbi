import { useMemo, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Avatar from '../components/Avatar.jsx';
import { ChevronRight, Trophy, TrendingUp, Calendar, X, RefreshCw } from 'lucide-react';
import { fetchLeaderboard } from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Leaderboard() {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      if (data && Array.isArray(data)) {
        setMembers(data);
        if (data.length === 0) {
          toast.push('Data leaderboard masih kosong', 'info');
        }
      } else {
        setMembers([]);
        toast.push('Format data leaderboard tidak valid', 'warning');
      }
    } catch (err) {
      // Error fetching leaderboard
      setError('Gagal memuat data leaderboard dari server');
      toast.push('Gagal memuat data leaderboard', 'error');
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Kunci scroll body untuk tampilan detail bottom-sheet mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 1023px)');
    let previousOverflow = document.body.style.overflow;
    let locked = false;

    const lock = () => {
      if (locked) return;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      locked = true;
    };

    const unlock = () => {
      if (!locked) return;
      document.body.style.overflow = previousOverflow;
      locked = false;
    };

    const apply = () => {
      if (selectedMember && mq.matches) {
        lock();
      } else {
        unlock();
      }
    };

    apply();

    const onChange = () => apply();
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else {
      mq.addListener(onChange);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', onChange);
      } else {
        mq.removeListener(onChange);
      }
      unlock();
    };
  }, [selectedMember]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const sorted = useMemo(() => members.slice().sort((a, b) => b.points - a.points), [members]);
  const max = sorted[0]?.points || 1;

  const getRankBadge = (idx) => {
    if (idx === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (idx === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (idx === 2) return <Trophy className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const handleRefresh = () => {
    toast.push('Memuat ulang data...', 'info');
    loadData();
  };

  if (loading) return <LoadingState message="Memuat leaderboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (members.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Leaderboard & Tracker Poin</h1>
        <EmptyState icon="users" title="Belum ada data poin" description="Data leaderboard akan muncul setelah ada aktivitas yang tercatat." variant="secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 -m-3 sm:-m-4 md:-m-6 p-3 sm:p-4 md:p-6">
      <div className="space-y-4 sm:space-y-6 page-enter">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="min-w-0">
            <h1 className="text-title-lg text-neutral-900">Leaderboard & Tracker Poin</h1>
            <p className="text-subtitle text-neutral-600">Pantau perolehan poin dan peringkat anggota GenBI</p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center justify-center p-2 sm:p-2.5 sm:px-4 bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg sm:rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all shadow-soft-sm"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline ml-2">Refresh</span>
          </button>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 animate-fade-in-up">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-3 sm:p-4 md:p-5 hover:border-neutral-300 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-caption text-neutral-600 font-medium">Top Performer</div>
                <div className="text-body font-semibold text-neutral-900 truncate">{sorted[0]?.name || '-'}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-3 sm:p-4 md:p-5 hover:border-neutral-300 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="text-caption text-neutral-600 font-medium">Rata-rata Poin</div>
                <div className="text-body font-semibold text-neutral-900">{sorted.length > 0 ? Math.round(sorted.reduce((sum, m) => sum + m.points, 0) / sorted.length) : 0}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-3 sm:p-4 md:p-5 hover:border-neutral-300 transition-colors">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="text-caption text-neutral-600 font-medium">Total Anggota</div>
                <div className="text-body font-semibold text-neutral-900">{members.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Konten Utama - Tampilan */}
        <div className={`grid gap-3 sm:gap-4 transition-all ${selectedMember ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Leaderboard */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 p-3 sm:p-4 md:p-6">
            <h2 className="text-title font-semibold mb-3 sm:mb-4">Peringkat Anggota</h2>
            <ol className="divide-y divide-neutral-200">
              {sorted.map((m, idx) => {
                const pct = Math.round((m.points / max) * 100);
                const isSelected = selectedMember?.id === m.id;

                return (
                  <li
                    key={m.id}
                    className={`py-2.5 sm:py-3.5 flex items-center gap-2.5 sm:gap-3.5 cursor-pointer hover:bg-neutral-50 -mx-3 sm:-mx-5 px-3 sm:px-5 transform hover:scale-[1.01] active:scale-[0.995] ${isSelected ? 'bg-primary-50 hover:bg-primary-50' : ''} transition-smooth`}
                    onClick={() => setSelectedMember(m)}
                  >
                    <div className="w-6 sm:w-8 flex items-center justify-center text-neutral-600 font-semibold text-sm">{getRankBadge(idx) || <span className="text-neutral-700">{idx + 1}.</span>}</div>
                    <Avatar name={m.name} size={36} className="sm:w-10 sm:h-10" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                        <div className="font-semibold text-body text-neutral-900 truncate">{m.name}</div>
                        <div className="text-caption font-semibold text-primary-600 ml-2">{m.points} pts</div>
                      </div>
                      <div className="progress h-1.5 sm:h-2 bg-neutral-100 rounded-full overflow-hidden" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                        <span className="block h-full bg-gradient-to-r from-primary-400 to-primary-600" style={{ width: mounted ? pct + '%' : '0%' }} />
                      </div>
                      <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 text-caption-sm text-neutral-600">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded bg-blue-100 text-blue-700">Online {m.online}</span>
                        <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">Offline {m.offline}</span>
                        <ChevronRight className={`w-4 h-4 ml-auto transition-transform duration-300 ease-out ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Panel Detail Tracker - Hanya Desktop */}
          {selectedMember && (
            <div className="hidden lg:block card p-5 space-y-4 animate-slide-fade">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Detail Tracker Poin</h2>
                  <p className="text-sm text-neutral-600">Riwayat aktivitas</p>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Profil Anggota */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
                <Avatar name={selectedMember.name} size={52} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-neutral-900 truncate">{selectedMember.name}</div>
                  <div className="text-sm text-neutral-600">Peringkat #{sorted.findIndex((m) => m.id === selectedMember.id) + 1}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">{selectedMember.points}</div>
                  <div className="text-xs text-neutral-600">Poin</div>
                </div>
              </div>

              {/* Statistik Aktivitas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-blue-600">{selectedMember.online}</div>
                  <div className="text-sm text-blue-700">Online</div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <div className="text-xl font-bold text-green-600">{selectedMember.offline}</div>
                  <div className="text-sm text-green-700">Offline</div>
                </div>
              </div>

              {/* Riwayat Aktivitas */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-3">Riwayat Kegiatan</h3>
                <div className="space-y-2">
                  {(selectedMember.activities || []).length === 0 ? (
                    <div className="text-sm text-neutral-500 text-center py-6">Belum ada riwayat</div>
                  ) : (
                    (selectedMember.activities || []).map((act, i) => (
                      <div key={i} className="p-3 bg-neutral-50 rounded-xl">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="font-medium text-sm text-neutral-900 flex-1 line-clamp-2">{act.name}</div>
                          <div className="font-semibold text-sm text-primary-600 whitespace-nowrap">+{act.points}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{act.date}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${act.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{act.type}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal Bottom Sheet Mobile untuk Anggota Terpilih */}
          {selectedMember &&
            ReactDOM.createPortal(
              <div className="lg:hidden fixed inset-0 z-[9998] flex flex-col pt-20 pb-20" onClick={() => setSelectedMember(null)}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

                {/* Bottom Sheet */}
                <div className="mt-auto relative bg-white rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up z-10 mb-2" onClick={(e) => e.stopPropagation()}>
                  {/* Drag Handle */}
                  <div className="flex justify-center py-2">
                    <div className="w-10 h-1 bg-neutral-300 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="px-4 pb-3 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-neutral-900">Detail Tracker Poin</h2>
                    <button onClick={() => setSelectedMember(null)} className="p-2 -mr-1 hover:bg-neutral-100 rounded-lg transition-colors">
                      <X className="w-5 h-5 text-neutral-500" />
                    </button>
                  </div>

                  {/* Konten Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Profil Anggota */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl">
                      <Avatar name={selectedMember.name} size={48} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-neutral-900 truncate">{selectedMember.name}</div>
                        <div className="text-xs text-neutral-600">
                          Peringkat <span className="font-bold text-primary-600">#{sorted.findIndex((m) => m.id === selectedMember.id) + 1}</span>
                        </div>
                      </div>
                      <div className="text-center px-3 py-1.5 bg-white/80 rounded-lg">
                        <div className="text-xl font-bold text-primary-600">{selectedMember.points}</div>
                        <div className="text-caption-sm text-neutral-600">Total Poin</div>
                      </div>
                    </div>

                    {/* Statistik Aktivitas */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedMember.online}</div>
                        <div className="text-[11px] text-blue-700 font-medium">Kegiatan Online</div>
                      </div>
                      <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedMember.offline}</div>
                        <div className="text-[11px] text-green-700 font-medium">Kegiatan Offline</div>
                      </div>
                    </div>

                    {/* Riwayat Aktivitas */}
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-700 mb-2">Riwayat Kegiatan</h3>
                      <div className="space-y-2">
                        {(selectedMember.activities || []).length === 0 ? (
                          <div className="text-xs text-neutral-500 text-center py-6 bg-neutral-50 rounded-lg">Belum ada riwayat kegiatan</div>
                        ) : (
                          (selectedMember.activities || []).map((act, i) => (
                            <div key={i} className="p-2.5 bg-neutral-50 rounded-lg">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="font-medium text-xs text-neutral-900 flex-1">{act.name}</div>
                                <div className="font-bold text-xs text-primary-600 whitespace-nowrap">+{act.points} pts</div>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                                <Calendar className="w-3 h-3" />
                                <span>{act.date}</span>
                                <span className={`px-1.5 py-0.5 rounded-full ${act.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{act.type}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
}
