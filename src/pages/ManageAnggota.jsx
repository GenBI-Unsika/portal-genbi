'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Edit2, Trash2, Save, X, Loader2, ArrowLeft, Calendar, Phone, Mail, Briefcase, Building2, GraduationCap, RefreshCw, Cake, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, fetchDivisions } from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import Avatar from '../components/Avatar.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';

const initialFormState = {
  name: '',
  jabatan: '',
  division: '',
  faculty: '',
  major: '',
  cohort: '',
  phone: '',
  email: '',
  birthDate: '',
  photo: '',
  isActive: true,
  motivasi: '',
  cerita: '',
  sortOrder: 0,
};

function getInitials(name) {
  if (!name) return 'GN';
  return String(name)
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

export default function ManageAnggota() {
  const toast = useToast();
  const navigate = useNavigate();
  const context = useOutletContext();
  const isAdmin = context?.isAdmin || false;

  const [data, setData] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/anggota');
      toast.push('Anda tidak memiliki akses ke halaman ini', 'error');
    }
  }, [isAdmin, navigate, toast]);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersData, divisionsData] = await Promise.all([fetchAllTeamMembers(), fetchDivisions()]);
      setData(membersData || []);
      setDivisions(divisionsData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Gagal memuat data anggota');
      toast.push('Gagal memuat data anggota', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [loadData, isAdmin]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    return data.filter((member) => {
      const matchSearch = !searchTerm || member.name?.toLowerCase().includes(searchTerm.toLowerCase()) || member.position?.toLowerCase().includes(searchTerm.toLowerCase()) || member.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDivision = !filterDivision || member.division === filterDivision;
      return matchSearch && matchDivision;
    });
  }, [data, searchTerm, filterDivision]);

  // Group by division for stats
  const stats = useMemo(() => {
    const total = data.length;
    const active = data.filter((m) => m.isActive).length;
    const withBirthday = data.filter((m) => m.birthDate).length;
    return { total, active, withBirthday };
  }, [data]);

  // Upcoming birthdays
  const upcomingBirthdays = useMemo(() => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const parseMonthDay = (value) => {
      if (!value) return null;

      if (typeof value === 'string') {
        const ymd = value.slice(0, 10);
        const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
          return { month: Number(match[2]) - 1, day: Number(match[3]) };
        }
      }

      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      return { month: d.getMonth(), day: d.getDate() };
    };

    const getNextBirthdayInfo = (birthValue, baseDate) => {
      const md = parseMonthDay(birthValue);
      if (!md) return null;

      const today = startOfDay(baseDate);
      let next = new Date(today.getFullYear(), md.month, md.day);
      if (next < today) next = new Date(today.getFullYear() + 1, md.month, md.day);

      const daysUntil = Math.round((next - today) / MS_PER_DAY);
      return { nextBd: next, daysUntil };
    };

    const today = new Date();
    const upcomingAll = data
      .filter((m) => m.birthDate && m.isActive)
      .map((m) => {
        const info = getNextBirthdayInfo(m.birthDate, today);
        if (!info) return null;
        return { ...m, ...info };
      })
      .filter(Boolean)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    if (upcomingAll.length === 0) return [];

    const nearestDays = upcomingAll[0].daysUntil;
    return upcomingAll.filter((m) => m.daysUntil === nearestDays).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' }));
  }, [data]);

  // Modal handlers
  const openCreateModal = () => {
    setFormData(initialFormState);
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setFormData({
      ...initialFormState,
      ...member,
      birthDate: formatDateForInput(member.birthDate),
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialFormState);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.push('Nama wajib diisi', 'warning');
      return;
    }
    if (!formData.division) {
      toast.push('Divisi wajib dipilih', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
      };

      if (modalMode === 'create') {
        const newMember = await createTeamMember(payload);
        setData((prev) => [...prev, newMember]);
        toast.push('Anggota berhasil ditambahkan', 'success');
      } else {
        const updated = await updateTeamMember(formData.id, payload);
        setData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        toast.push('Data anggota berhasil diperbarui', 'success');
      }
      closeModal();
    } catch (err) {
      console.error('Save error:', err);
      toast.push(`Gagal ${modalMode === 'create' ? 'menambahkan' : 'memperbarui'} anggota`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTeamMember(id);
      setData((prev) => prev.filter((m) => m.id !== id));
      toast.push('Anggota berhasil dihapus', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.push('Gagal menghapus anggota', 'error');
    }
  };

  // Mobile Card Component
  const MemberCard = ({ member, index }) => {
    const isExpanded = expandedRow === member.id;

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" /> : <span className="text-white text-sm font-bold">{getInitials(member.name)}</span>}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-sm truncate">{member.name}</h3>
              {!member.isActive && <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Nonaktif</span>}
            </div>
            <p className="text-xs text-slate-500 truncate">{member.jabatan || 'Anggota'}</p>
            <p className="text-xs text-primary-600 truncate">{member.division}</p>
          </div>

          <button onClick={() => setExpandedRow(isExpanded ? null : member.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Fakultas:</span>
                <p className="font-medium text-slate-700">{member.faculty || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Prodi:</span>
                <p className="font-medium text-slate-700">{member.major || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Angkatan:</span>
                <p className="font-medium text-slate-700">{member.cohort || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Tanggal Lahir:</span>
                <p className="font-medium text-slate-700">{formatDate(member.birthDate)}</p>
              </div>
              <div>
                <span className="text-slate-500">Telepon:</span>
                <p className="font-medium text-slate-700">{member.phone || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Email:</span>
                <p className="font-medium text-slate-700 truncate">{member.email || '-'}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => openEditModal(member)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-xs font-medium transition-all">
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button onClick={() => setDeleteConfirm(member.id)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-medium transition-all">
                <Trash2 className="w-3.5 h-3.5" />
                Hapus
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isAdmin) return null;
  if (loading) return <LoadingState message="Memuat data anggota..." />;
  if (error) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <div className="page-enter space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/anggota')} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Kelola Anggota</h1>
            <p className="text-sm text-slate-500">Tambah, edit, dan hapus data anggota</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 hover:bg-slate-100 rounded-lg transition-all" title="Refresh">
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-all">
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Anggota</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-xs text-slate-500">Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Cake className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.withBirthday}</p>
              <p className="text-xs text-slate-500">Ada Ultah</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{divisions.length}</p>
              <p className="text-xs text-slate-500">Divisi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Cake className="w-4 h-4" />
            Ulang Tahun Terdekat
          </h3>
          <div className="space-y-2">
            {upcomingBirthdays.map((m) => (
              <div key={m.id} className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border border-amber-200">
                <Avatar name={m.name} src={m.photo || m.photoUrl || ''} size={32} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-xs text-amber-600">{m.daysUntil === 0 ? 'Hari ini! 🎉' : m.daysUntil === 1 ? 'Besok' : `${m.daysUntil} hari lagi`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, jabatan, email..."
            className="w-full h-10 pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)} className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Semua Divisi</option>
          {divisions.map((d) => (
            <option key={d.key} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Members List */}
      {filteredData.length === 0 ? (
        <EmptyState
          icon="users"
          title={searchTerm || filterDivision ? 'Tidak ditemukan' : 'Belum ada anggota'}
          description={searchTerm || filterDivision ? 'Coba ubah kata kunci atau filter' : 'Klik tombol "Tambah Anggota" untuk menambah anggota baru'}
          variant="primary"
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {filteredData.map((member, idx) => (
            <MemberCard key={member.id} member={member} index={idx} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Nama</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Divisi</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Jabatan</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Tanggal Lahir</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Kontak</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  <th className="text-center p-4 font-semibold text-slate-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center overflow-hidden">
                          {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" /> : <span className="text-white text-xs font-bold">{getInitials(member.name)}</span>}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.major || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{member.division}</td>
                    <td className="p-4 text-slate-600">{member.jabatan || 'Anggota'}</td>
                    <td className="p-4 text-slate-600">{formatDate(member.birthDate)}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {member.phone && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </div>
                        )}
                        {member.email && (
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </div>
                        )}
                        {!member.phone && !member.email && <span className="text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{member.isActive ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEditModal(member)} className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-all" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(member.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Form Modal */}
      <Modal isOpen={showModal} onClose={closeModal} title={modalMode === 'create' ? 'Tambah Anggota Baru' : 'Edit Data Anggota'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Informasi Dasar</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Divisi <span className="text-red-500">*</span>
                </label>
                <select value={formData.division} onChange={(e) => handleFormChange('division', e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Pilih Divisi</option>
                  {divisions.map((d) => (
                    <option key={d.key} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={formData.jabatan}
                  onChange={(e) => handleFormChange('jabatan', e.target.value)}
                  placeholder="Misal: Koordinator"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Informasi Akademik</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fakultas</label>
                <input
                  type="text"
                  value={formData.faculty}
                  onChange={(e) => handleFormChange('faculty', e.target.value)}
                  placeholder="Misal: Fakultas Teknik"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Program Studi</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => handleFormChange('major', e.target.value)}
                  placeholder="Misal: Informatika"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Angkatan</label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => handleFormChange('cohort', e.target.value)}
                placeholder="Misal: 2022"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Kontak & Tanggal Lahir</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleFormChange('birthDate', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                placeholder="email@example.com"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL Foto</label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => handleFormChange('photo', e.target.value)}
              placeholder="https://..."
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => handleFormChange('isActive', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="isActive" className="text-sm text-slate-700">
              Anggota Aktif
            </label>
          </div>

          {/* Motivasi & Cerita */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Motivasi & Cerita (Opsional)</h4>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivasi</label>
              <textarea
                value={formData.motivasi}
                onChange={(e) => handleFormChange('motivasi', e.target.value)}
                placeholder="Motivasi mengikuti GenBI..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cerita</label>
              <textarea
                value={formData.cerita}
                onChange={(e) => handleFormChange('cerita', e.target.value)}
                placeholder="Cerita pengalaman di GenBI..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={closeModal} disabled={saving} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-all">
            Batal
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {modalMode === 'create' ? 'Tambah' : 'Simpan'}
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus">
        <p className="text-slate-600 mb-6">Apakah Anda yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan.</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg text-sm font-medium transition-all">
            Batal
          </button>
          <button onClick={() => handleDelete(deleteConfirm)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all">
            <Trash2 className="w-4 h-4" />
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}
