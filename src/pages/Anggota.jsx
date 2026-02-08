import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Modal from '../components/Modal';
import SocialLinks from '../components/SocialLinks';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/EmptyState';
import { useApi } from '../hooks/useApi';
import { fetchTeamMembers, fetchDivisions } from '../utils/api';
import { Users, Search, ChevronRight, Briefcase, GraduationCap, Building2, Calendar, Quote, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

// Default division metadata for fallback
const defaultMeta = {
  gradient: 'from-neutral-400 to-neutral-500',
  bgLight: 'bg-neutral-50',
  textColor: 'text-neutral-600',
  borderColor: 'border-neutral-200',
  icon: '👥',
};

function getDivisionKey(division) {
  if (!division) return 'lainnya';
  return division.toLowerCase().replace(/\s+/g, '-');
}

function getInitials(name) {
  if (!name) return 'GN';
  return String(name)
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

export default function Anggota() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const isAdmin = context?.isAdmin || false;
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const membersFetcher = useCallback(() => fetchTeamMembers(), []);
  const divisionsFetcher = useCallback(() => fetchDivisions(), []);
  const { data: members, loading: membersLoading, error: membersError, refetch: refetchMembers } = useApi(membersFetcher);
  const { data: divisionsData, loading: divisionsLoading, error: divisionsError, refetch: refetchDivisions } = useApi(divisionsFetcher);


  const divisionMeta = useMemo(() => {
    if (!divisionsData || divisionsData.length === 0) return {};
    const meta = {};
    divisionsData.forEach((d) => {
      meta[d.key] = {
        name: d.name,
        description: d.description || '',
        gradient: d.gradient || defaultMeta.gradient,
        bgLight: d.bgLight || defaultMeta.bgLight,
        textColor: d.textColor || defaultMeta.textColor,
        borderColor: d.borderColor || defaultMeta.borderColor,
        icon: d.icon || defaultMeta.icon,
      };
    });
    return meta;
  }, [divisionsData]);


  const groupedMembers = useMemo(() => {
    if (!members || members.length === 0) return {};
    const groups = {};
    members.forEach((m) => {
      const key = getDivisionKey(m.division);
      if (!groups[key]) groups[key] = [];
      groups[key].push({
        ...m,
        jabatan: m.position || m.jabatan,
        faculty: m.faculty,
        major: m.studyProgram || m.major,
        cohort: m.cohort,
        photo: m.photoUrl || m.photo,
        socials: m.socials || [],
      });
    });
    return groups;
  }, [members]);


  const divisions = useMemo(() => {
    const keys = Object.keys(groupedMembers);
    return keys.map((key) => {
      const meta = divisionMeta[key] || {
        name: key
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        description: '',
        ...defaultMeta,
      };
      return { key, ...meta, count: groupedMembers[key]?.length || 0 };
    });
  }, [groupedMembers, divisionMeta]);


  const filteredDivisions = useMemo(() => {
    if (!searchQuery.trim()) return divisions;
    const q = searchQuery.toLowerCase();
    return divisions.filter((d) => {
      const matchDivision = d.name.toLowerCase().includes(q);
      const matchMembers = groupedMembers[d.key]?.some((m) => m.name?.toLowerCase().includes(q) || m.jabatan?.toLowerCase().includes(q) || m.major?.toLowerCase().includes(q));
      return matchDivision || matchMembers;
    });
  }, [divisions, groupedMembers, searchQuery]);


  const totalMembers = members?.length || 0;

  const handleMemberClick = (m) => {
    setSelected(m);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  const goToDivision = (divisionKey) => {
    navigate(`/anggota/${divisionKey}`);
  };

  const loading = membersLoading || divisionsLoading;
  const error = membersError || divisionsError;
  const refetch = () => {
    refetchMembers();
    refetchDivisions();
  };

  if (loading) return <LoadingState message="Memuat data anggota..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!members || members.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900">Data Anggota</h1>
        <EmptyState icon="users" title="Belum ada data anggota" description="Data anggota akan muncul di sini setelah ditambahkan oleh admin." variant="primary" />
      </div>
    );
  }

  return (
    <div className="page-enter space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900">Data Anggota</h1>
            <p className="text-sm sm:text-base text-neutral-600 mt-1">Kenali keluarga besar GenBI UNSIKA</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-200 rounded-xl">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
              <span className="text-sm sm:text-base font-semibold text-primary-700">{totalMembers} Anggota</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="animate-fade-in-up">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari divisi atau anggota..."
            className="w-full h-10 sm:h-11 pl-10 sm:pl-11 pr-4 py-2 rounded-xl border border-neutral-200 bg-white text-sm sm:text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Division Cards Grid */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900">Divisi GenBI</h2>

        {filteredDivisions.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Tidak ditemukan</h3>
            <p className="text-sm text-neutral-500">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredDivisions.map((d, idx) => (
              <div
                key={d.key}
                onClick={() => goToDivision(d.key)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && goToDivision(d.key)}
                role="button"
                tabIndex={0}
                className={`group bg-white rounded-xl sm:rounded-2xl border ${d.borderColor} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-neutral-300 hover:-translate-y-1 animate-fade-in-up`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${d.bgLight} flex items-center justify-center text-xl sm:text-2xl`}>{d.icon}</div>
                    <span className={`px-2 py-1 ${d.bgLight} ${d.textColor} rounded-full text-xs sm:text-sm font-semibold`}>{d.count} anggota</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">{d.name}</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 line-clamp-2 mb-4">{d.description}</p>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className="text-xs sm:text-sm font-medium text-neutral-600 group-hover:text-primary-600 transition-colors">Lihat semua anggota</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail Anggota */}
      <Modal isOpen={open} onClose={handleClose} title={selected?.name || 'Detail Anggota'}>
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Photo */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-100 shadow-lg">
                {selected?.photo ? (
                  <img src={selected.photo} alt={`Foto ${selected.name}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-white">{getInitials(selected?.name)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">{selected?.name}</h3>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium ${divisionMeta[getDivisionKey(selected?.division)]?.bgLight || 'bg-neutral-100'} ${divisionMeta[getDivisionKey(selected?.division)]?.textColor || 'text-neutral-600'} mb-3`}
              >
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {selected?.jabatan || 'Anggota'}
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md text-xs text-neutral-600">
                  <Building2 className="w-3 h-3" />
                  {selected?.division || 'Divisi'}
                </span>
                {selected?.cohort && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-md text-xs text-neutral-600">
                    <Calendar className="w-3 h-3" />
                    Angkatan {selected.cohort}
                  </span>
                )}
              </div>

              <SocialLinks links={selected?.socials} size="md" />
            </div>
          </div>

          {/* Profile Details */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-neutral-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Fakultas</span>
              </div>
              <p className="text-sm sm:text-base font-medium text-neutral-900">{selected?.faculty || '—'}</p>
            </div>
            <div className="bg-neutral-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Program Studi</span>
              </div>
              <p className="text-sm sm:text-base font-medium text-neutral-900">{selected?.major || '—'}</p>
            </div>
          </div>

          {/* Motivasi */}
          {selected?.motivasi && (
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 mb-2">Motivasi</h4>
                  <p className="text-sm sm:text-base text-neutral-700 italic leading-relaxed">"{selected.motivasi}"</p>
                </div>
              </div>
            </div>
          )}

          {/* Cerita */}
          {selected?.cerita && (
            <div>
              <h4 className="text-sm font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Cerita
              </h4>
              <div className="bg-neutral-50 rounded-xl p-4 max-h-[40vh] overflow-y-auto">
                <p className="text-sm sm:text-base text-neutral-700 whitespace-pre-line leading-relaxed">{selected.cerita}</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
