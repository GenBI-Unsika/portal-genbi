import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trophy, Wallet, User, GraduationCap, CreditCard, Phone, Mail, Building2, BookOpen, Award, TrendingUp, Copy, Check, Download, Loader2, AlertCircle, Star, Clock, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getMe, setMe, syncMe } from '../utils/auth.js';
import { updateMyProfile, fetchFaculties, fetchStudyPrograms, fetchMyPoints, fetchMyTreasury } from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import { useConfirm } from '../contexts/ConfirmContext.jsx';

const TABS = [
  { key: 'akun', label: 'Data Akun', icon: User },
  { key: 'rekening', label: 'Rekening', icon: CreditCard },
  { key: 'akademik', label: 'Akademik', icon: GraduationCap },
  { key: 'perpointan', label: 'Perpointan', icon: Trophy },
  { key: 'uangkas', label: 'Uang Kas', icon: Wallet },
];

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [tab, setTab] = useState('akun');
  const [me, setLocalMe] = useState(() => getMe());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [studyPrograms, setStudyPrograms] = useState([]);
  const [pointsData, setPointsData] = useState({ total: 0, breakdown: [], history: [] });
  const [treasuryData, setTreasuryData] = useState({ entries: [], summary: { paid: 0, unpaid: 0 } });
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const freshMe = await syncMe();
        setLocalMe(freshMe || {});
        const facs = await fetchFaculties();
        setFaculties(facs);
        const [pts, treasury] = await Promise.all([fetchMyPoints(), fetchMyTreasury()]);
        setPointsData(pts);
        setTreasuryData(treasury);
      } catch (err) {
        if (err?.status === 401) {
          toast.push('Sesi login telah berakhir. Silakan login kembali.', 'error');
          navigate('/login', { replace: true });
          return;
        }
        setError(err?.message || 'Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (me?.profile?.facultyId) {
      fetchStudyPrograms(me.profile.facultyId)
        .then(setStudyPrograms)
        .catch(() => setStudyPrograms([]));
    } else {
      setStudyPrograms([]);
    }
  }, [me?.profile?.facultyId]);

  const copyToClipboard = async (text, label, field) => {
    try {
      await navigator.clipboard.writeText(String(text));
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
      toast.push(`${label} disalin`, 'success');
    } catch {
      toast.push(`Gagal menyalin`, 'error');
    }
  };

  const formatCurrency = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;
  const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-');

  const saveAkun = async (e) => {
    e.preventDefault();
    const ok = await confirm({ title: 'Simpan perubahan?', description: 'Perubahan profil akan disimpan.', confirmText: 'Simpan', cancelText: 'Batal' });
    if (!ok) return;
    setSaving(true);
    try {
      const updatedProfile = await updateMyProfile({
        name: me.profile?.name || me.name,
        phone: me.profile?.phone || me.phone,
        facultyId: me.profile?.facultyId,
        studyProgramId: me.profile?.studyProgramId,
        semester: me.profile?.semester,
        npm: me.profile?.npm,
        motivasi: me.profile?.motivasi,
      });

      const nextMe = { ...me, profile: updatedProfile };
      setLocalMe(nextMe);
      setMe(nextMe);
      toast.push('Profil berhasil disimpan', 'success');
    } catch (err) {
      toast.push(err?.message || 'Gagal menyimpan profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const profile = me?.profile || {};
  const getName = () => profile.name || me?.name || '';
  const getEmail = () => me?.email || '';
  const getPhone = () => profile.phone || '';
  const getDivision = () =>
    profile?.division?.name ||
    profile?.divisionName ||
    profile?.division ||
    profile?.divisi?.name ||
    profile?.divisiName ||
    profile?.divisi ||
    profile?.teamMember?.division?.name ||
    profile?.teamMember?.division ||
    me?.division?.name ||
    me?.divisionName ||
    me?.division ||
    me?.divisi?.name ||
    me?.divisiName ||
    me?.divisi ||
    me?.teamMember?.division?.name ||
    me?.teamMember?.division ||
    '';
  const getFaculty = () => profile.faculty?.name || '';
  const getStudyProgram = () => profile.studyProgram?.name || '';
  const getNpm = () => profile.npm || '';
  const getSemester = () => profile.semester || '';

  const getAvatar = () => profile.avatar || me?.picture || null;
  const getMotivasi = () => profile.motivasi || '';
  const getInitials = () => {
    const name = getName();
    if (!name) return 'U';
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0]?.[0]?.toUpperCase() || 'U';
  };


  const [bankForm, setBankForm] = useState({
    bankName: profile.bankName || 'BRI',
    bankAccountNumber: profile.bankAccountNumber || '',
    bankAccountName: profile.bankAccountName || getName(),
  });
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    setBankForm({
      bankName: profile.bankName || 'BRI',
      bankAccountNumber: profile.bankAccountNumber || '',
      bankAccountName: profile.bankAccountName || getName(),
    });
  }, [profile.bankName, profile.bankAccountNumber, profile.bankAccountName]);

  const saveRekening = async (e) => {
    e.preventDefault();
    const ok = await confirm({ title: 'Simpan data rekening?', description: 'Data rekening akan disimpan.', confirmText: 'Simpan', cancelText: 'Batal' });
    if (!ok) return;
    setSavingBank(true);
    try {
      const updatedProfile = await updateMyProfile({
        bankName: bankForm.bankName,
        bankAccountNumber: bankForm.bankAccountNumber,
        bankAccountName: bankForm.bankAccountName,
      });

      const nextMe = { ...me, profile: updatedProfile };
      setLocalMe(nextMe);
      setMe(nextMe);
      toast.push('Rekening berhasil disimpan', 'success');
    } catch (err) {
      toast.push(err?.message || 'Gagal menyimpan rekening', 'error');
    } finally {
      setSavingBank(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-3" />
        <p className="text-neutral-500">Memuat profil...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-neutral-900 font-medium mb-1">Gagal Memuat Profil</p>
        <p className="text-sm text-neutral-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700">
          Coba Lagi
        </button>
      </div>
    );
  }


  const renderTabContent = () => {

    if (tab === 'akun') {
      return (
        <form className="space-y-3 sm:space-y-4" onSubmit={saveAkun}>

          <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-neutral-100">
            <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0">
              {getAvatar() ? <img src={getAvatar()} alt={getName()} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="text-body font-bold text-primary-600">{getInitials()}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body font-semibold text-neutral-900 truncate">{getName() || 'Nama belum diisi'}</p>
              <p className="text-caption text-neutral-500 truncate">{getEmail()}</p>
              {getMotivasi() && <p className="text-caption text-neutral-600 italic mt-0.5 truncate">"{getMotivasi()}"</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <InputField label="Nama Lengkap" value={getName()} onChange={(v) => setLocalMe({ ...me, profile: { ...profile, name: v } })} />
            <InputField label="Email" value={getEmail()} disabled />
            <InputField label="Divisi" value={getDivision() || '-'} disabled placeholder="Belum ditentukan" />
            <InputField label="No. HP" value={getPhone()} onChange={(v) => setLocalMe({ ...me, profile: { ...profile, phone: v } })} placeholder="08xxxxxxxxxx" />
            <InputField label="NPM" value={getNpm()} onChange={(v) => setLocalMe({ ...me, profile: { ...profile, npm: v } })} />
            <SelectField
              label="Fakultas"
              value={profile.facultyId || ''}
              options={faculties.map((f) => ({ value: f.id, label: f.name }))}
              onChange={(v) => setLocalMe({ ...me, profile: { ...profile, facultyId: v, studyProgramId: null } })}
            />
            <SelectField
              label="Program Studi"
              value={profile.studyProgramId || ''}
              options={studyPrograms.map((sp) => ({ value: sp.id, label: sp.name }))}
              onChange={(v) => setLocalMe({ ...me, profile: { ...profile, studyProgramId: v } })}
              disabled={!profile.facultyId}
            />
            <SelectField label="Semester" value={profile.semester || ''} options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({ value: s, label: `Semester ${s}` }))} onChange={(v) => setLocalMe({ ...me, profile: { ...profile, semester: v } })} />
          </div>


          <div>
            <label className="block text-caption font-medium text-neutral-700 mb-1">Motivasi / Kata-kata</label>
            <textarea
              value={getMotivasi()}
              onChange={(e) => setLocalMe({ ...me, profile: { ...profile, motivasi: e.target.value } })}
              placeholder="Tulis motivasi atau kata-kata singkat kamu..."
              rows={2}
              maxLength={200}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-neutral-300 text-input placeholder:text-caption focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <p className="text-caption-sm text-neutral-400 mt-0.5 text-right">{getMotivasi().length}/200</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 sm:pt-4 border-t border-neutral-100">
            <button type="reset" className="px-3 sm:px-4 py-1.5 sm:py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg text-btn hover:bg-neutral-50" disabled={saving}>
              Reset
            </button>
            <button type="submit" disabled={saving} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-600 text-white font-medium rounded-lg text-btn hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      );
    }


    if (tab === 'rekening') {
      return (
        <form className="space-y-3 sm:space-y-4" onSubmit={saveRekening}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <InputField label="Nama Bank" value={bankForm.bankName} onChange={(v) => setBankForm({ ...bankForm, bankName: v })} placeholder="Contoh: BRI, BNI, Mandiri, BCA" />
            <InputField label="No. Rekening" value={bankForm.bankAccountNumber} onChange={(v) => setBankForm({ ...bankForm, bankAccountNumber: v })} placeholder="Nomor rekening" />
            <InputField label="Atas Nama" value={bankForm.bankAccountName} onChange={(v) => setBankForm({ ...bankForm, bankAccountName: v })} placeholder="Nama pemilik rekening" />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 sm:pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setBankForm({ bankName: profile.bankName || '', bankAccountNumber: profile.bankAccountNumber || '', bankAccountName: profile.bankAccountName || getName() })}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg text-btn hover:bg-neutral-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={savingBank}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-primary-600 text-white font-medium rounded-lg text-btn hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {savingBank ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {savingBank ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      );
    }


    if (tab === 'akademik') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <InfoCard label="NPM" value={getNpm() || '-'} icon={GraduationCap} copyable onCopy={() => copyToClipboard(getNpm(), 'NPM', 'npm')} copied={copiedField === 'npm'} />
          <InfoCard label="Semester" value={getSemester() || '-'} icon={BookOpen} />
          <InfoCard label="IPK Terakhir" value={profile.gpa || '-'} icon={TrendingUp} />
          <InfoCard label="Status" value={profile.status || 'Aktif'} icon={Award} />
          <InfoCard label="Fakultas" value={getFaculty() || '-'} icon={Building2} />
          <InfoCard label="Program Studi" value={getStudyProgram() || '-'} icon={BookOpen} />
        </div>
      );
    }


    if (tab === 'perpointan') {
      const activities = pointsData.history || [];
      const breakdown = pointsData.breakdown || [];
      const total = pointsData.total || 0;


      const rankThresholds = {
        platinum: 80,
        gold: 60,
        silver: 40,
        bronze: 20,
      };


      const getRankInfo = (pts) => {
        if (pts >= rankThresholds.platinum) return { label: 'Platinum', threshold: rankThresholds.platinum, color: 'bg-violet-100 text-violet-700 border-violet-200', icon: '🏆' };
        if (pts >= rankThresholds.gold) return { label: 'Gold', threshold: rankThresholds.gold, color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🥇' };
        if (pts >= rankThresholds.silver) return { label: 'Silver', threshold: rankThresholds.silver, color: 'bg-neutral-100 text-neutral-700 border-neutral-300', icon: '🥈' };
        if (pts >= rankThresholds.bronze) return { label: 'Bronze', threshold: rankThresholds.bronze, color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🥉' };
        return { label: 'Min. Poin', threshold: rankThresholds.bronze, color: 'bg-neutral-50 text-neutral-600 border-neutral-200', icon: null };
      };
      const rank = getRankInfo(total);

      return (
        <div className="space-y-2.5 sm:space-y-3">

          <div className="flex flex-col sm:flex-row gap-2">

            <div className="flex-1 bg-primary-50 border border-primary-200 rounded-lg p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-primary-600 font-medium">Total Poin</p>
                <p className="text-lg sm:text-xl font-bold text-primary-700">{total}</p>
              </div>
            </div>

            <div className={`flex-shrink-0 sm:w-28 border rounded-lg p-2 sm:p-2.5 flex flex-col items-center justify-center ${rank.color}`}>
              {rank.icon && <span className="text-base sm:text-lg mb-0.5">{rank.icon}</span>}
              <p className="text-[10px] font-medium opacity-75">{rank.label}</p>
              <p className="text-xs sm:text-sm font-semibold">{rank.threshold} poin</p>
            </div>
          </div>


          {breakdown.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2">
              {breakdown.map((b, i) => (
                <div key={i} className="bg-white border border-neutral-200 rounded-lg p-1.5 sm:p-2 text-center">
                  <p className="text-xs sm:text-sm font-bold text-neutral-900">{b.points}</p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 truncate">{b.category}</p>
                </div>
              ))}
            </div>
          )}


          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="p-2 sm:p-2.5 border-b border-neutral-100 flex items-center justify-between">
              <p className="font-semibold text-[11px] sm:text-[12px] text-neutral-900">Riwayat Aktivitas</p>
              <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 bg-neutral-100 rounded-full text-neutral-600">{activities.length} entri</span>
            </div>
            {activities.length === 0 ? (
              <div className="py-6 text-center">
                <Trophy className="w-7 h-7 text-neutral-300 mx-auto mb-2" />
                <p className="text-[11px] text-neutral-500">Belum ada riwayat poin</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">Ikuti kegiatan untuk mendapatkan poin</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 sm:p-2.5 border-b border-neutral-50 last:border-0 hover:bg-neutral-50">

                    <div className="flex flex-col items-center pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      {i < activities.length - 1 && <div className="w-0.5 h-full bg-neutral-200 mt-1" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[11px] text-neutral-900 truncate">{act.description || act.category}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] text-neutral-500 flex items-center gap-0.5">
                          <Calendar className="w-2.5 h-2.5" /> {formatDate(act.date)}
                        </span>
                        <span className="px-1 py-0.5 bg-neutral-100 rounded text-[10px] text-neutral-600">{act.category}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-md">
                      <span className="text-[11px] sm:text-[12px] font-bold text-emerald-600">+{act.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }


    if (tab === 'uangkas') {
      const entries = treasuryData.entries || [];
      const summary = treasuryData.summary || { paid: 0, unpaid: 0, monthsPaid: 0, monthsUnpaid: 0 };
      const totalMonths = summary.totalMonths || 9;

      const generatePDF = () => {
        try {
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('LAPORAN PEMBAYARAN KAS', pageWidth / 2, 20, { align: 'center' });

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          let y = 35;
          doc.text(`Nama: ${getName() || '-'}`, 20, y);
          doc.text(`NPM: ${getNpm() || '-'}`, 20, y + 6);
          doc.text(`Email: ${getEmail() || '-'}`, 20, y + 12);

          doc.autoTable({
            startY: y + 25,
            head: [['Periode', 'Status', 'Jumlah']],
            body: entries.map((e) => [e.period, e.status, formatCurrency(e.amount)]),
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
          });

          const finalY = doc.lastAutoTable.finalY + 10;
          doc.text(`Total Dibayar: ${formatCurrency(summary.paid)}`, 20, finalY);
          doc.text(`Tunggakan: ${formatCurrency(summary.unpaid)}`, 20, finalY + 6);

          doc.save(`Laporan-Kas-${getName().replace(/\s+/g, '-')}.pdf`);
          toast.push('PDF berhasil diunduh', 'success');
        } catch {
          toast.push('Gagal membuat PDF', 'error');
        }
      };

      return (
        <div className="space-y-3 sm:space-y-4">

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs text-emerald-600 font-medium">Total Dibayar</p>
              <p className="text-sm sm:text-lg font-bold text-emerald-700">{formatCurrency(summary.paid)}</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-lg p-2 sm:p-3">
              <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">Bulan Terbayar</p>
              <p className="text-sm sm:text-lg font-bold text-neutral-900">
                {summary.monthsPaid}/{totalMonths}
              </p>
              <div className="mt-1 h-1 sm:h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(summary.monthsPaid / totalMonths) * 100}%` }} />
              </div>
            </div>
            <div className={`rounded-lg p-2 sm:p-3 border ${summary.unpaid > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-neutral-200'}`}>
              <p className="text-[10px] sm:text-xs text-neutral-500 font-medium">Tunggakan</p>
              <p className={`text-sm sm:text-lg font-bold ${summary.unpaid > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(summary.unpaid)}</p>
            </div>
          </div>

          {summary.unpaid > 0 && (
            <div className="flex items-center gap-1.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] sm:text-[13px] text-amber-800">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                Anda memiliki tunggakan {formatCurrency(summary.unpaid)} untuk {summary.monthsUnpaid} bulan.
              </span>
            </div>
          )}


          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="p-2.5 sm:p-3 border-b border-neutral-100 flex items-center justify-between">
              <p className="font-semibold text-[13px] sm:text-sm text-neutral-900">Riwayat Pembayaran</p>
              <button onClick={generatePDF} className="px-2 py-1 bg-primary-600 text-white text-[11px] sm:text-[13px] font-medium rounded-md hover:bg-primary-700 flex items-center gap-1">
                <Download className="w-3 h-3" /> PDF
              </button>
            </div>
            {entries.length === 0 ? (
              <div className="py-8 text-center">
                <Wallet className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-[13px] text-neutral-500">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                {entries.map((e, i) => (
                  <div key={i} className="p-2.5 sm:p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[13px] text-neutral-900">{e.period}</p>
                      <p className="text-[10px] sm:text-[11px] text-neutral-500">{e.paidAt ? `Dibayar: ${formatDate(e.paidAt)}` : 'Belum dibayar'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium ${e.status === 'LUNAS' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{e.status}</span>
                      <span className="font-medium text-[13px] text-neutral-900">{formatCurrency(e.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-3 sm:space-y-4">

      <div>
        <h1 className="text-lg sm:text-xl font-bold text-neutral-900">Profil Saya</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">Kelola informasi akun dan data pribadi</p>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-neutral-200 p-1 sm:p-2">
            <nav className="flex lg:flex-col gap-0.5 sm:gap-1 overflow-x-auto lg:overflow-visible pb-0.5 lg:pb-0 -mx-0.5 px-0.5 scrollbar-hide">
              {TABS.map((t) => {
                const Icon = t.icon;
                const isActive = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex-shrink-0 lg:w-full flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg text-left text-xs sm:text-sm md:text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    <span className="hidden xs:inline sm:inline lg:inline">{t.label}</span>
                    <span className="xs:hidden sm:hidden lg:hidden">{t.key === 'perpointan' ? 'Poin' : t.key === 'uangkas' ? 'Kas' : t.key === 'rekening' ? 'Bank' : t.key === 'akademik' ? 'Akad' : 'Akun'}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>


        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-neutral-200">
            <div className="p-3 sm:p-4 border-b border-neutral-100">
              <h2 className="font-semibold text-subtitle text-neutral-900 flex items-center gap-2">
                {(() => {
                  const Icon = TABS.find((t) => t.key === tab)?.icon;
                  return Icon ? <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" /> : null;
                })()}
                {TABS.find((t) => t.key === tab)?.label}
              </h2>
            </div>
            <div className="p-3 sm:p-4">{renderTabContent()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}



function InputField({ label, value, onChange, disabled, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="block text-caption-sm font-medium text-neutral-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full h-8 sm:h-10 px-2 sm:px-3 rounded-lg border text-input placeholder:text-caption-sm transition-colors ${disabled ? 'bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed' : 'border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
          }`}
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange, disabled }) {
  return (
    <div>
      <label className="block text-caption-sm font-medium text-neutral-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full h-8 sm:h-10 px-2 sm:px-3 rounded-lg border text-input bg-white transition-colors ${disabled ? 'bg-neutral-100 border-neutral-200 text-neutral-500 cursor-not-allowed' : 'border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
          }`}
      >
        <option value="">Pilih {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon, copyable, onCopy, copied }) {
  return (
    <div className="p-2.5 sm:p-3.5 bg-white border border-neutral-200 rounded-lg flex items-start justify-between gap-2">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-neutral-600" />
        </div>
        <div>
          <p className="text-caption-sm text-neutral-500">{label}</p>
          <p className="font-medium text-caption text-neutral-900">{value}</p>
        </div>
      </div>
      {copyable && value && value !== '-' && (
        <button onClick={onCopy} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-md">
          {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      )}
    </div>
  );
}
