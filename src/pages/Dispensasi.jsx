import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getMe } from '../utils/auth.js';
import { useToast } from '../components/Toast.jsx';
import {
  fetchMyDispensations,
  fetchAllDispensations,
  createDispensation,
  updateDispensation,
  deleteDispensation,
  updateDispensationStatus,
  fetchDispensationTemplate,
  uploadDispensationTemplate,
  deleteDispensationTemplate,
  generateDispensationLetter,
} from '../utils/api';
import { FileText, Clock, CheckCircle, XCircle, Loader2, Send, Search, Eye, Download, Upload, File, Trash2, ChevronDown, Pencil, Undo2, Calendar, User, AlertCircle, X, Filter, FileCheck } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import { isProfileComplete as checkIsProfileComplete } from '../utils/profile.js';

const FORM_DRAFT_KEY = 'portal_dispensasi_form_draft';

const statusConfig = {
  DIAJUKAN: { label: 'Menunggu', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  DIPROSES: { label: 'Diproses', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Clock },
  DISETUJUI: { label: 'Disetujui', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  DITOLAK: { label: 'Ditolak', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
};

const initialForm = { kegiatan: '', tanggal: '' };

export default function Dispensasi() {
  const toast = useToast();
  const { confirm } = useConfirm();
  const context = useOutletContext();
  const isAdmin = context?.isAdmin || false;
  const me = getMe();
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formExpanded, setFormExpanded] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [adminTab, setAdminTab] = useState('kelola');
  const [template, setTemplate] = useState(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [statusTab, setStatusTab] = useState('ALL');

  const userName = me?.profile?.name || '';
  const userNpm = me?.profile?.npm || '';
  const userFakultas = me?.profile?.faculty?.name || '';
  const userProdi = me?.profile?.studyProgram?.name || '';
  const isProfileComplete = checkIsProfileComplete(me);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORM_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Object.values(parsed).some((v) => v)) setForm(parsed);
      }
    } catch { }
    loadDispensations();
    if (isAdmin) loadTemplate();
  }, []);

  async function loadTemplate() {
    setLoadingTemplate(true);
    try {
      const data = await fetchDispensationTemplate();
      setTemplate(data);
    } catch {
      toast.push('Gagal memuat template', 'error');
    } finally {
      setLoadingTemplate(false);
    }
  }

  useEffect(() => {
    const hasValue = Object.values(form).some((v) => v);
    if (hasValue) localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  async function loadDispensations() {
    setLoading(true);
    try {
      const data = await fetchMyDispensations();
      setItems(data);
      if (isAdmin) {
        const allData = await fetchAllDispensations();
        setAllItems(allData);
      }
    } catch {
      toast.push('Gagal memuat data dispensasi', 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleTemplateUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      toast.push('Hanya file Word (.doc/.docx) yang diizinkan', 'error');
      return;
    }
    setUploadingTemplate(true);
    try {
      const result = await uploadDispensationTemplate(file);
      setTemplate(result.data);
      toast.push('Template berhasil diupload', 'success');
    } catch (err) {
      toast.push(err?.message || 'Gagal upload template', 'error');
    } finally {
      setUploadingTemplate(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteTemplate = async () => {
    const ok = await confirm({
      title: 'Hapus template surat?',
      description: 'Template surat akan dihapus dari server.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });
    if (!ok || !template?.id) return;
    try {
      await deleteDispensationTemplate(template.id);
      setTemplate(null);
      toast.push('Template dihapus', 'success');
    } catch (err) {
      toast.push(err?.message || 'Gagal hapus template', 'error');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewModal || !reviewStatus) return;
    setReviewSaving(true);
    try {
      await updateDispensationStatus(reviewModal.id, { status: reviewStatus, reviewNotes });
      setAllItems((prev) => prev.map((item) => (item.id === reviewModal.id ? { ...item, status: reviewStatus, reviewNotes } : item)));
      setItems((prev) => prev.map((item) => (item.id === reviewModal.id ? { ...item, status: reviewStatus, reviewNotes } : item)));
      toast.push('Status dispensasi berhasil diperbarui', 'success');
      setReviewModal(null);
      setReviewNotes('');
      setReviewStatus('');
    } catch {
      toast.push('Gagal memperbarui status', 'error');
    } finally {
      setReviewSaving(false);
    }
  };

  const handleGenerateLetter = async (dispensationId) => {
    if (!template) {
      toast.push('Upload template terlebih dahulu', 'warning');
      return;
    }
    try {
      const result = await generateDispensationLetter(dispensationId);
      setAllItems((prev) => prev.map((item) => (item.id === dispensationId ? { ...item, fileUrl: result.fileUrl } : item)));
      setItems((prev) => prev.map((item) => (item.id === dispensationId ? { ...item, fileUrl: result.fileUrl } : item)));
      toast.push('Surat berhasil digenerate', 'success');
    } catch (err) {
      toast.push(err?.message || 'Gagal generate surat', 'error');
    }
  };

  const filteredAllItems = allItems.filter((item) => {
    const matchSearch = !searchTerm || item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || item.kegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) || item.npm?.includes(searchTerm);
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const validateForm = () => {
    if (!userName) {
      toast.push('Lengkapi nama di profile terlebih dahulu', 'warning');
      return false;
    }
    if (!userNpm) {
      toast.push('Lengkapi NPM di profile terlebih dahulu', 'warning');
      return false;
    }
    if (!form.kegiatan.trim()) {
      toast.push('Nama kegiatan wajib diisi', 'warning');
      return false;
    }
    if (!form.tanggal) {
      toast.push('Tanggal kegiatan wajib diisi', 'warning');
      return false;
    }
    return true;
  };

  async function submit() {
    if (!validateForm()) return;
    const ok = await confirm({
      title: editingId ? 'Simpan perubahan?' : 'Ajukan dispensasi?',
      description: editingId ? `Simpan perubahan untuk "${form.kegiatan}"?` : `Ajukan dispensasi untuk "${form.kegiatan}"?`,
      confirmText: editingId ? 'Simpan' : 'Ajukan',
      cancelText: 'Batal',
    });
    if (!ok) return;
    setSubmitting(true);
    try {
      const payload = { kegiatan: form.kegiatan.trim(), tanggal: new Date(form.tanggal).toISOString() };
      if (editingId) {
        const updated = await updateDispensation(editingId, payload);
        setItems((prev) => prev.map((it) => (it.id === editingId ? updated : it)));
        toast.push('Pengajuan berhasil diperbarui!', 'success');
      } else {
        const newItem = await createDispensation({ nama: userName, npm: userNpm, fakultas: userFakultas || null, prodi: userProdi || null, ...payload });
        setItems((prev) => [newItem, ...prev]);
        toast.push('Pengajuan berhasil dikirim!', 'success');
      }
      setForm(initialForm);
      setEditingId(null);
      localStorage.removeItem(FORM_DRAFT_KEY);
      setFormExpanded(false);
    } catch (err) {
      toast.push(err?.message || 'Gagal mengirim pengajuan', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function withdraw(id) {
    const ok = await confirm({
      title: 'Tarik pengajuan?',
      description: 'Pengajuan dispensasi ini akan dihapus.',
      confirmText: 'Tarik',
      cancelText: 'Batal',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await deleteDispensation(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.push('Pengajuan berhasil ditarik', 'success');
      if (previewItem?.id === id) setPreviewItem(null);
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
        localStorage.removeItem(FORM_DRAFT_KEY);
      }
    } catch (err) {
      toast.push(err?.message || 'Gagal menarik pengajuan', 'error');
    }
  }

  function startEdit(item) {
    if (item.status !== 'DIAJUKAN') {
      toast.push('Hanya bisa edit saat status menunggu', 'warning');
      return;
    }
    setEditingId(item.id);
    setForm({ kegiatan: item.kegiatan || '', tanggal: new Date(item.tanggal).toISOString().slice(0, 10) });
    setFormExpanded(true);
    toast.push('Mode edit aktif', 'info');
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });



  if (!isAdmin) {
    return (
      <div className="space-y-3 sm:space-y-4">

        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-title-lg font-bold text-neutral-900">Surat Dispensasi</h1>
            <p className="text-caption text-neutral-500 mt-0.5">Ajukan surat dispensasi untuk kegiatan GenBI</p>
          </div>
          <div className="flex items-center gap-2 text-caption flex-shrink-0">
            <span className="px-2 py-1 sm:px-2.5 rounded-md border border-neutral-200 bg-white text-neutral-600">{items.length} pengajuan</span>
          </div>
        </div>


        {!isProfileComplete && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-caption text-amber-800">Lengkapi nama dan NPM di profil terlebih dahulu.</p>
            </div>
            <a href="/profile" className="w-full sm:w-auto px-3 py-1.5 bg-amber-600 text-white text-btn font-medium rounded-md hover:bg-amber-700 text-center">
              Ke Profil
            </a>
          </div>
        )}


        <div className="bg-white rounded-lg border border-neutral-200">
          <button onClick={() => setFormExpanded(!formExpanded)} className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-neutral-50">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center ${editingId ? 'bg-blue-100 text-blue-600' : 'bg-primary-100 text-primary-600'}`}>
                {editingId ? <Pencil className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="font-semibold text-subtitle text-neutral-900">{editingId ? 'Edit Pengajuan' : 'Ajukan Dispensasi Baru'}</h2>
                <p className="text-caption text-neutral-500">{editingId ? 'Perbarui data pengajuan' : 'Isi form untuk mengajukan'}</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${formExpanded ? 'rotate-180' : ''}`} />
          </button>

          {formExpanded && (
            <div className="p-3 sm:p-4 pt-0 border-t border-neutral-100 space-y-3 sm:space-y-4">

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 sm:p-3 bg-neutral-50 rounded-lg">
                <div>
                  <span className="text-caption-sm text-neutral-500">Nama</span>
                  <p className="text-caption font-medium text-neutral-900 truncate">{userName || '-'}</p>
                </div>
                <div>
                  <span className="text-caption-sm text-neutral-500">NPM</span>
                  <p className="text-caption font-medium text-neutral-900">{userNpm || '-'}</p>
                </div>
                <div>
                  <span className="text-caption-sm text-neutral-500">Fakultas</span>
                  <p className="text-caption font-medium text-neutral-900 truncate">{userFakultas || '-'}</p>
                </div>
                <div>
                  <span className="text-caption-sm text-neutral-500">Prodi</span>
                  <p className="text-caption font-medium text-neutral-900 truncate">{userProdi || '-'}</p>
                </div>
              </div>


              <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-caption-sm font-medium text-neutral-700 mb-1">
                    Nama Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.kegiatan}
                    onChange={(e) => setForm({ ...form, kegiatan: e.target.value })}
                    className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-lg border border-neutral-300 text-input placeholder:text-caption-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Contoh: Rapat Koordinasi Nasional"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-caption-sm font-medium text-neutral-700 mb-1">
                    Tanggal Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-lg border border-neutral-300 text-input focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={submitting}
                  />
                </div>
              </div>


              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setForm(initialForm);
                      localStorage.removeItem(FORM_DRAFT_KEY);
                    }}
                    className="w-full sm:w-auto px-3 py-2 sm:py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg text-btn hover:bg-neutral-50"
                  >
                    Batal
                  </button>
                )}
                <button
                  onClick={submit}
                  disabled={submitting || !isProfileComplete}
                  className="w-full sm:w-auto px-3 py-2 sm:py-2 bg-primary-600 text-white font-medium rounded-lg text-btn hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editingId ? <CheckCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  {submitting ? 'Memproses...' : editingId ? 'Simpan' : 'Kirim'}
                </button>
              </div>
            </div>
          )}
        </div>


        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="p-3 sm:p-4 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-title-sm text-neutral-900">Riwayat Pengajuan</h2>
                  <p className="text-caption text-neutral-500">Daftar semua pengajuan dispensasi Anda</p>
                </div>
              </div>


              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-neutral-400 hidden sm:block" />
                <select
                  value={statusTab}
                  onChange={(e) => setStatusTab(e.target.value)}
                  className="flex-1 sm:flex-none h-9 px-3 pr-8 rounded-lg border border-neutral-200 text-input bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="DIAJUKAN">Menunggu</option>
                  <option value="DIPROSES">Diproses</option>
                  <option value="DISETUJUI">Disetujui</option>
                  <option value="DITOLAK">Ditolak</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-10 sm:py-12">
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-primary-500 mb-2" />
              <p className="text-caption text-neutral-500">Memuat data...</p>
            </div>
          ) : items.filter((item) => statusTab === 'ALL' || item.status === statusTab).length === 0 ? (
            <div className="flex flex-col items-center py-10 sm:py-12 px-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3 sm:mb-4">
                <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-400" />
              </div>
              <p className="text-subtitle text-neutral-900 font-semibold mb-1 text-center">{statusTab === 'ALL' ? 'Belum ada pengajuan' : `Tidak ada pengajuan ${statusConfig[statusTab]?.label.toLowerCase()}`}</p>
              <p className="text-caption text-neutral-500 text-center">{statusTab === 'ALL' ? 'Gunakan form di atas untuk membuat pengajuan baru' : 'Coba ubah filter status'}</p>
            </div>
          ) : (
            <>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200">
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">No</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider min-w-[250px]">Kegiatan</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Tanggal</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">File</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {items
                      .filter((item) => statusTab === 'ALL' || item.status === statusTab)
                      .map((item, index) => {
                        const config = statusConfig[item.status] || statusConfig.DIAJUKAN;
                        const StatusIcon = config.icon;
                        const canEdit = item.status === 'DIAJUKAN';
                        const isApproved = item.status === 'DISETUJUI';

                        return (
                          <tr key={item.id} className="hover:bg-neutral-50 transition-colors group">
                            <td className="px-3 py-3">
                              <span className="text-sm font-medium text-neutral-500">{index + 1}</span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-start gap-2.5">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                                  <StatusIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{item.kegiatan}</p>
                                  {item.reviewNotes && (
                                    <div className="mt-1.5 flex items-start gap-1.5">
                                      <AlertCircle className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-neutral-600 line-clamp-1">{item.reviewNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4.5 h-4.5 text-neutral-400" />
                                <span className="text-sm font-medium text-neutral-700 whitespace-nowrap">{formatDate(item.tanggal)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium border ${config.color} whitespace-nowrap`}>
                                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                {config.label}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              {isApproved ? (
                                item.fileUrl ? (
                                  <div className="flex items-center gap-1.5">
                                    <FileCheck className="w-4.5 h-4.5 text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700">Tersedia</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4.5 h-4.5 text-amber-600" />
                                    <span className="text-sm font-medium text-amber-700">Proses</span>
                                  </div>
                                )
                              ) : (
                                <span className="text-sm text-neutral-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => setPreviewItem(item)} className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors" title="Detail">
                                  <Eye className="w-4 h-4" />
                                </button>
                                {canEdit && (
                                  <>
                                    <button onClick={() => startEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                                      <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => withdraw(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Tarik">
                                      <Undo2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {isApproved && item.fileUrl && (
                                  <a href={item.fileUrl} download className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Download">
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>


              <div className="md:hidden divide-y divide-neutral-100">
                {items
                  .filter((item) => statusTab === 'ALL' || item.status === statusTab)
                  .map((item, index) => {
                    const config = statusConfig[item.status] || statusConfig.DIAJUKAN;
                    const StatusIcon = config.icon;
                    const canEdit = item.status === 'DIAJUKAN';
                    const isApproved = item.status === 'DISETUJUI';

                    return (
                      <div key={item.id} className="p-3 hover:bg-neutral-50 transition-colors">
                        {/* Header */}
                        <div className="flex items-start gap-2.5 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-caption text-neutral-900 line-clamp-2">{item.kegiatan}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-caption-sm text-neutral-500">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(item.tanggal)}</span>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-caption-sm font-medium border ${config.color} whitespace-nowrap flex-shrink-0`}>{config.label}</span>
                        </div>

                        {/* Review Notes */}
                        {item.reviewNotes && (
                          <div className="mb-2 p-2 rounded-lg bg-neutral-50 border border-neutral-200">
                            <div className="flex items-start gap-1.5">
                              <AlertCircle className="w-3 h-3 text-neutral-400 flex-shrink-0 mt-0.5" />
                              <p className="text-caption-sm text-neutral-600">{item.reviewNotes}</p>
                            </div>
                          </div>
                        )}

                        {/* File Status for approved */}
                        {isApproved && (
                          <div className={`mb-2 p-2 rounded-lg border ${item.fileUrl ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="flex items-center gap-1.5">
                              {item.fileUrl ? (
                                <>
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-caption-sm font-medium text-emerald-700">Surat tersedia</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  <span className="text-caption-sm font-medium text-amber-700">Surat diproses</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-caption-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </button>
                          {canEdit && (
                            <>
                              <button onClick={() => startEdit(item)} className="px-2.5 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit">
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => withdraw(item.id)} className="px-2.5 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Tarik">
                                <Undo2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {isApproved && item.fileUrl && (
                            <a href={item.fileUrl} download className="px-2.5 py-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5">
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}


          {!loading && items.filter((item) => statusTab === 'ALL' || item.status === statusTab).length > 0 && (
            <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200">
              <p className="text-xs text-neutral-600">
                Menampilkan <span className="font-semibold text-neutral-900">{items.filter((item) => statusTab === 'ALL' || item.status === statusTab).length}</span> dari{' '}
                <span className="font-semibold text-neutral-900">{items.length}</span> pengajuan
              </p>
            </div>
          )}
        </div>


        {previewItem && (
          <Modal onClose={() => setPreviewItem(null)} title={previewItem.showFilePreview ? 'Preview Surat Dispensasi' : 'Detail Pengajuan'}>
            <div className="space-y-4">
              {/* File Preview Mode */}
              {previewItem.showFilePreview && previewItem.fileUrl ? (
                <div className="space-y-4">
                  {/* PDF Preview Iframe */}
                  <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-100">
                    <iframe src={`${previewItem.fileUrl}#toolbar=1`} className="w-full h-[400px]" title="Preview Surat Dispensasi" />
                  </div>

                  {/* Alternative if iframe doesn't work */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">💡 Jika preview tidak muncul, gunakan tombol di bawah:</p>
                    <div className="flex gap-2">
                      <a href={previewItem.fileUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-100">
                        <Eye className="w-4 h-4" /> Buka di Tab Baru
                      </a>
                      <a href={previewItem.fileUrl} download className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">
                        <Download className="w-4 h-4" /> Download File
                      </a>
                    </div>
                  </div>

                  <button onClick={() => setPreviewItem({ ...previewItem, showFilePreview: false })} className="w-full py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50">
                    ← Kembali ke Detail
                  </button>
                </div>
              ) : (
                <>
                  {/* Detail Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-xs text-neutral-500">Nama</span>
                      <p className="font-medium text-neutral-900">{previewItem.nama}</p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-xs text-neutral-500">NPM</span>
                      <p className="font-medium text-neutral-900">{previewItem.npm}</p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-xs text-neutral-500">Fakultas</span>
                      <p className="font-medium text-neutral-900">{previewItem.fakultas || '-'}</p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-xs text-neutral-500">Prodi</span>
                      <p className="font-medium text-neutral-900">{previewItem.prodi || '-'}</p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg col-span-2">
                      <span className="text-xs text-neutral-500">Kegiatan</span>
                      <p className="font-medium text-neutral-900">{previewItem.kegiatan}</p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-xs text-neutral-500">Tanggal</span>
                      <p className="font-medium text-neutral-900">{formatDate(previewItem.tanggal)}</p>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <span className="text-xs text-neutral-500">Status</span>
                      <p className={`font-medium ${statusConfig[previewItem.status]?.color?.split(' ')[0]}`}>{statusConfig[previewItem.status]?.label}</p>
                    </div>
                  </div>

                  {previewItem.reviewNotes && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Catatan Admin:</span>
                      <p className="text-sm text-blue-700 mt-1">{previewItem.reviewNotes}</p>
                    </div>
                  )}

                  {/* File Section - Prominent for approved */}
                  {previewItem.status === 'DISETUJUI' && (
                    <div className={`p-4 rounded-lg border-2 ${previewItem.fileUrl ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${previewItem.fileUrl ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                          {previewItem.fileUrl ? <FileText className="w-6 h-6 text-emerald-600" /> : <Clock className="w-6 h-6 text-amber-600" />}
                        </div>
                        <div>
                          <p className={`font-semibold ${previewItem.fileUrl ? 'text-emerald-800' : 'text-amber-800'}`}>{previewItem.fileUrl ? '📄 Surat Dispensasi Tersedia!' : '⏳ Menunggu Proses'}</p>
                          <p className={`text-sm ${previewItem.fileUrl ? 'text-emerald-600' : 'text-amber-600'}`}>{previewItem.fileUrl ? 'Anda dapat preview atau download surat' : 'Admin sedang memproses surat Anda'}</p>
                        </div>
                      </div>

                      {previewItem.fileUrl && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewItem({ ...previewItem, showFilePreview: true })}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border-2 border-emerald-400 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" /> Preview Surat
                          </button>
                          <a href={previewItem.fileUrl} download className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                            <Download className="w-4 h-4" /> Download Surat
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {previewItem.status === 'DIAJUKAN' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPreviewItem(null);
                          startEdit(previewItem);
                        }}
                        className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 flex items-center justify-center gap-2"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setPreviewItem(null);
                          withdraw(previewItem.id);
                        }}
                        className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <Undo2 className="w-4 h-4" /> Tarik
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Modal>
        )}
      </div>
    );
  }


  const stats = {
    total: allItems.length,
    diajukan: allItems.filter((i) => i.status === 'DIAJUKAN').length,
    diproses: allItems.filter((i) => i.status === 'DIPROSES').length,
    disetujui: allItems.filter((i) => i.status === 'DISETUJUI').length,
    ditolak: allItems.filter((i) => i.status === 'DITOLAK').length,
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-neutral-900">Kelola Dispensasi</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">Review pengajuan dan kelola template surat</p>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-neutral-900' },
          { label: 'Menunggu', value: stats.diajukan, color: 'text-amber-600' },
          { label: 'Diproses', value: stats.diproses, color: 'text-blue-600' },
          { label: 'Disetujui', value: stats.disetujui, color: 'text-emerald-600' },
          { label: 'Ditolak', value: stats.ditolak, color: 'text-red-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-neutral-200 p-2 sm:p-3 text-center">
            <div className={`text-base sm:text-xl lg:text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[9px] sm:text-xs text-neutral-500 truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg w-full overflow-x-auto">
        {['kelola', 'template'].map((t) => (
          <button
            key={t}
            onClick={() => setAdminTab(t)}
            className={`flex-1 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${adminTab === t ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            {t === 'kelola' ? 'Pengajuan' : 'Template'}
          </button>
        ))}
      </div>

      {adminTab === 'kelola' && (
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="p-2.5 sm:p-3 border-b border-neutral-100 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, NPM..."
                className="w-full h-9 pl-9 pr-3 py-2 rounded-lg border border-neutral-200 text-[11px] sm:text-xs placeholder:text-[10px] focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-neutral-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="ALL">Semua Status</option>
              <option value="DIAJUKAN">Menunggu</option>
              <option value="DIPROSES">Diproses</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-10 sm:py-12">
              <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin text-primary-500 mb-2" />
              <p className="text-xs sm:text-sm text-neutral-500">Memuat...</p>
            </div>
          ) : filteredAllItems.length === 0 ? (
            <div className="flex flex-col items-center py-10 sm:py-12 px-4">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500 font-medium text-center">Tidak ada data</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredAllItems.map((item) => {
                const config = statusConfig[item.status] || statusConfig.DIAJUKAN;
                return (
                  <div key={item.id} className="p-3 sm:p-4 hover:bg-neutral-50 transition-colors">
                    {/* Mobile Layout */}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                        <config.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-neutral-900 line-clamp-2">{item.kegiatan}</p>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${config.color}`}>{config.label}</span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-1">{item.nama}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                          <span>{item.npm}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.tanggal)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setReviewModal(item);
                            setReviewStatus(item.status);
                            setReviewNotes(item.reviewNotes || '');
                          }}
                          className="mt-3 w-full sm:w-auto px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {adminTab === 'template' && (
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <h2 className="font-semibold text-neutral-900 mb-3">Template Surat</h2>

          {loadingTemplate ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
              <p className="text-sm text-neutral-500">Memuat template...</p>
            </div>
          ) : template ? (
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <File className="w-10 h-10 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">{template.fileName}</p>
                <p className="text-sm text-neutral-500">Diupload {formatDate(template.uploadedAt)}</p>
              </div>
              <button onClick={handleDeleteTemplate} className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus template">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-neutral-300 rounded-lg p-6 sm:p-8 text-center hover:border-primary-400 hover:bg-primary-50/50 transition-all">
              <input ref={fileInputRef} type="file" accept=".doc,.docx" onChange={handleTemplateUpload} className="hidden" />
              {uploadingTemplate ? (
                <>
                  <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-3" />
                  <p className="font-medium text-neutral-700">Mengupload...</p>
                  <p className="text-sm text-neutral-500 mt-1">Mohon tunggu</p>
                </>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                  <p className="font-medium text-neutral-700">Upload Template Surat</p>
                  <p className="text-sm text-neutral-500 mt-1">Klik untuk upload file Word (.doc/.docx)</p>
                </>
              )}
            </div>
          )}

          <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-800 mb-3">📋 Placeholder yang tersedia:</p>
            <div className="grid grid-cols-2 gap-2">
              {['{{nama}}', '{{npm}}', '{{fakultas}}', '{{prodi}}', '{{kegiatan}}', '{{tanggal}}', '{{tanggal_surat}}', '{{alasan}}'].map((p) => (
                <code key={p} className="px-2 py-1.5 sm:px-3 sm:py-2 bg-white border border-blue-200 rounded text-xs sm:text-sm text-blue-700 font-mono text-center">
                  {p}
                </code>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-3">💡 Gunakan placeholder ini di file Word. Data akan otomatis terisi saat generate surat.</p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <Modal onClose={() => setReviewModal(null)} title="Review Pengajuan">
          <div className="space-y-4">
            <div className="p-3 bg-neutral-50 rounded-lg">
              <p className="font-medium text-neutral-900">{reviewModal.kegiatan}</p>
              <p className="text-sm text-neutral-500">
                {reviewModal.nama} • {reviewModal.npm} • {formatDate(reviewModal.tanggal)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(statusConfig).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => setReviewStatus(key)}
                    className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${reviewStatus === key ? `${color} border-current` : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Catatan</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm placeholder:text-[10px] placeholder:sm:text-[11px] focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Catatan untuk pemohon (opsional)"
              />
            </div>

            {/* Generate Letter Button - Show only for approved without fileUrl */}
            {reviewStatus === 'DISETUJUI' && !reviewModal.fileUrl && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-2">💡 Setelah menyetujui, Anda bisa generate surat menggunakan template.</p>
              </div>
            )}

            {/* Download Letter if already generated */}
            {reviewModal.status === 'DISETUJUI' && reviewModal.fileUrl && (
              <a href={reviewModal.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">
                <Download className="w-4 h-4" /> Download Surat
              </a>
            )}

            <div className="flex gap-2">
              <button onClick={() => setReviewModal(null)} disabled={reviewSaving} className="flex-1 py-2.5 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50">
                Batal
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={reviewSaving || !reviewStatus}
                className="flex-1 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reviewSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
