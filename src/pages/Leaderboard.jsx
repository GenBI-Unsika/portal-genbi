import { useMemo, useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReactDOM from 'react-dom';
import Avatar from '../components/Avatar.jsx';
import Modal from '../components/Modal.jsx';
import { ChevronRight, Trophy, TrendingUp, Calendar, X, RefreshCw, AlertCircle, Plus, Edit3, Trash2, Shield, Loader2, Save, Search } from 'lucide-react';
import { fetchLeaderboard, createPointRecord, updatePointRecord, deletePointRecord } from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Leaderboard() {
  const context = useOutletContext();
  const isAdmin = context?.isAdmin || false;
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Admin state
  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'manage'
  const [searchTerm, setSearchTerm] = useState('');
  const [pointModal, setPointModal] = useState(null); // null | { mode: 'create'|'edit', member?, activity? }
  const [pointForm, setPointForm] = useState({ name: '', points: '', type: 'online', date: '' });
  const [pointSaving, setPointSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

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
      console.error('Failed to fetch leaderboard:', err);
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

  // Lock body scroll ONLY for the mobile bottom-sheet detail view.
  // On desktop, the detail shows as a side panel and the page should remain scrollable.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 1023px)'); // < lg
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
  }, [selectedMember, pointModal, deleteModal]);

  useEffect(() => {
    // small delay so progress bars animate from 0 -> target on first paint
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

  // Admin: Filtered members
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) return sorted;
    const term = searchTerm.toLowerCase();
    return sorted.filter((m) => m.name?.toLowerCase().includes(term));
  }, [sorted, searchTerm]);

  // Admin: Open add point modal
  const openAddPointModal = (member) => {
    setPointForm({
      name: '',
      points: '',
      type: 'online',
      date: new Date().toISOString().split('T')[0],
    });
    setPointModal({ mode: 'create', member });
  };

  // Admin: Open edit point modal
  const openEditPointModal = (member, activity, activityIndex) => {
    setPointForm({
      name: activity.name,
      points: activity.points.toString(),
      type: activity.type,
      date: activity.date,
    });
    setPointModal({ mode: 'edit', member, activity, activityIndex });
  };

  // Admin: Handle point form submit
  const handlePointSubmit = async () => {
    if (!pointForm.name.trim() || !pointForm.points || !pointForm.date) {
      toast.push('Lengkapi semua field yang diperlukan', 'warning');
      return;
    }

    setPointSaving(true);
    try {
      if (pointModal.mode === 'create') {
        await createPointRecord({
          memberId: pointModal.member.id,
          name: pointForm.name.trim(),
          points: parseInt(pointForm.points, 10),
          type: pointForm.type,
          date: pointForm.date,
        });
        toast.push('Poin berhasil ditambahkan', 'success');
      } else {
        await updatePointRecord(pointModal.member.id, pointModal.activityIndex, {
          name: pointForm.name.trim(),
          points: parseInt(pointForm.points, 10),
          type: pointForm.type,
          date: pointForm.date,
        });
        toast.push('Poin berhasil diperbarui', 'success');
      }
      setPointModal(null);
      loadData();
    } catch (err) {
      toast.push(err?.message || 'Gagal menyimpan poin', 'error');
    } finally {
      setPointSaving(false);
    }
  };

  // Admin: Handle delete point
  const handleDeletePoint = async () => {
    if (!deleteModal) return;

    setPointSaving(true);
    try {
      await deletePointRecord(deleteModal.member.id, deleteModal.activityIndex);
      toast.push('Poin berhasil dihapus', 'success');
      setDeleteModal(null);
      loadData();
    } catch (err) {
      toast.push(err?.message || 'Gagal menghapus poin', 'error');
    } finally {
      setPointSaving(false);
    }
  };

  if (loading) return <LoadingState message="Memuat leaderboard..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;
  if (members.length === 0 && !isAdmin) {
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
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-title-lg text-neutral-900">Leaderboard & Tracker Poin</h1>
              {isAdmin && <span className="text-caption-sm font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full shadow-sm">Admin</span>}
            </div>
            <p className="text-subtitle text-neutral-600">Pantau perolehan poin dan peringkat anggota GenBI</p>
          </div>

          {/* close button placed inline in header (not absolute) */}
          {selectedMember && !isAdmin && (
            <div className="inline-flex items-center">
              <button onClick={() => setSelectedMember(null)} className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-600 hover:text-neutral-800" aria-label="Tutup detail anggota">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Admin Tabs */}
        {isAdmin && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-neutral-200 p-1 sm:p-1.5 inline-flex gap-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('view')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-btn transition-all ${activeTab === 'view' ? 'bg-primary-600 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                Lihat Peringkat
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-btn transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${activeTab === 'manage' ? 'bg-primary-600 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100'}`}
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Kelola Poin
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
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

        {/* Main Content - Admin Manage Tab */}
        {isAdmin && activeTab === 'manage' && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-title text-white">Kelola Poin Anggota</h2>
                    <p className="text-caption text-amber-100">Tambah, edit, atau hapus poin aktivitas</p>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="p-3 sm:p-4 border-b border-neutral-200 bg-neutral-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama anggota..."
                    className="w-full h-9 sm:h-10 pl-9 sm:pl-10 pr-4 py-2 rounded-lg border border-neutral-300 text-sm placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="p-3 sm:p-4 md:p-6">
                {filteredMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-400" />
                    </div>
                    <h3 className="text-subtitle font-semibold text-neutral-900 mb-1">{searchTerm ? 'Tidak ada hasil' : 'Belum ada anggota'}</h3>
                    <p className="text-neutral-500 text-caption">{searchTerm ? 'Coba ubah kata kunci pencarian' : 'Data akan muncul setelah anggota terdaftar'}</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredMembers.map((m, idx) => (
                      <div key={m.id} className="border border-neutral-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-neutral-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            {getRankBadge(sorted.findIndex((s) => s.id === m.id)) || <span className="w-5 text-center text-neutral-600 font-semibold text-sm">{sorted.findIndex((s) => s.id === m.id) + 1}.</span>}
                            <Avatar name={m.name} size={36} className="sm:w-11 sm:h-11" />
                            <div className="min-w-0">
                              <h4 className="font-semibold text-body text-neutral-900 truncate">{m.name}</h4>
                              <p className="text-caption text-neutral-500">
                                {m.points} poin • {m.online || 0} online, {m.offline || 0} offline
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => openAddPointModal(m)}
                            className="w-full sm:w-auto h-9 px-3 sm:px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 text-btn shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah Poin
                          </button>
                        </div>

                        {/* Activities list */}
                        <div className="space-y-2">
                          <h5 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Riwayat Aktivitas</h5>
                          {(m.activities || []).length === 0 ? (
                            <p className="text-sm text-neutral-400 italic">Belum ada aktivitas tercatat</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {(m.activities || []).map((act, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-neutral-900">{act.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                                      <span>{act.date}</span>
                                      <span className={`px-2 py-0.5 rounded-full ${act.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{act.type}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary-600 text-sm">+{act.points}</span>
                                    <button onClick={() => openEditPointModal(m, act, i)} className="p-1.5 text-neutral-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteModal({ member: m, activity: act, activityIndex: i })} className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - View Tab (default) */}
        {(!isAdmin || activeTab === 'view') && (
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

            {/* Tracker Detail Panel - Desktop Only */}
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

                {/* Member Profile */}
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

                {/* Activity Stats */}
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

                {/* Activity History */}
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

            {/* Mobile Bottom Sheet Modal for Selected Member - RENDER KE BODY DENGAN PORTAL */}
            {selectedMember &&
              ReactDOM.createPortal(
                <div className="lg:hidden fixed inset-0 z-[9998] flex flex-col pt-20 pb-20" onClick={() => setSelectedMember(null)}>
                  {/* Backdrop - Full coverage tapi di bawah navbar */}
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

                  {/* Bottom Sheet - dengan margin dari bottom nav */}
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

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {/* Member Profile */}
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

                      {/* Activity Stats */}
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

                      {/* Activity History */}
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
        )}
      </div>

      {/* Admin Point Modal */}
      {isAdmin && pointModal && (
        <Modal onClose={() => setPointModal(null)} title={pointModal.mode === 'create' ? 'Tambah Poin' : 'Edit Poin'} zIndex="z-[9998]">
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center gap-3">
                <Avatar name={pointModal.member.name} size={40} />
                <div>
                  <p className="font-semibold text-neutral-900">{pointModal.member.name}</p>
                  <p className="text-sm text-neutral-500">Total: {pointModal.member.points} poin</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700">
                Nama Aktivitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pointForm.name}
                onChange={(e) => setPointForm((f) => ({ ...f, name: e.target.value }))}
                className="h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Nama aktivitas"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Jumlah Poin <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={pointForm.points}
                  onChange={(e) => setPointForm((f) => ({ ...f, points: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-neutral-700">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={pointForm.date}
                  onChange={(e) => setPointForm((f) => ({ ...f, date: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-neutral-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-neutral-700">Tipe Kegiatan</label>
              <div className="flex gap-3">
                {['online', 'offline'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPointForm((f) => ({ ...f, type }))}
                    className={`flex-1 h-11 rounded-lg border-2 font-medium transition-all capitalize ${
                      pointForm.type === type ? (type === 'online' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-green-400 bg-green-50 text-green-700') : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-200">
              <button type="button" onClick={() => setPointModal(null)} disabled={pointSaving} className="h-10 px-5 border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 font-medium rounded-lg transition-all">
                Batal
              </button>
              <button
                type="button"
                onClick={handlePointSubmit}
                disabled={pointSaving}
                className="h-10 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-primary-300 disabled:to-primary-400 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm"
              >
                {pointSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Delete Confirmation Modal */}
      {isAdmin && deleteModal && (
        <Modal onClose={() => setDeleteModal(null)} title="Hapus Poin" zIndex="z-[9998]">
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700">
                Apakah Anda yakin ingin menghapus poin aktivitas <span className="font-semibold">"{deleteModal.activity.name}"</span> dari <span className="font-semibold">{deleteModal.member.name}</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                disabled={pointSaving}
                className="h-10 px-5 border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 font-medium rounded-lg transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeletePoint}
                disabled={pointSaving}
                className="h-10 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-300 disabled:to-red-400 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm"
              >
                {pointSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
