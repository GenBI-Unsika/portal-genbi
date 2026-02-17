import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, GraduationCap, Building2, Calendar, Quote, BookOpen } from 'lucide-react';
import MemberCard from '../components/MemberCard';
import Modal from '../components/Modal';
import SocialLinks from '../components/SocialLinks';
import EmptyState from '../components/EmptyState';
import { fetchMembers, groupByDivision, fetchDivisionByKey } from '../lib/members';
import { normalizeFileUrl } from '../utils/api';

// Default metadata when division is not found in API
const defaultMeta = {
  gradient: 'from-neutral-400 to-neutral-500',
  bgLight: 'bg-neutral-100',
  textColor: 'text-neutral-600',
  borderColor: 'border-neutral-200',
  icon: '👥',
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

export default function DivisionDetail() {
  const { divisionKey } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {

        const [allMembers, divisionData] = await Promise.all([
          fetchMembers(),
          fetchDivisionByKey(divisionKey),
        ]);

        const grouped = groupByDivision(allMembers);
        setMembers(grouped[divisionKey] || []);


        if (divisionData) {
          setMeta({
            name: divisionData.name,
            description: divisionData.description || '',
            icon: divisionData.icon || defaultMeta.icon,
            bgLight: divisionData.bgLight || defaultMeta.bgLight,
            textColor: divisionData.textColor || defaultMeta.textColor,
            borderColor: divisionData.borderColor || defaultMeta.borderColor,
            gradient: divisionData.gradient || defaultMeta.gradient,
          });
        } else {

          setMeta({
            name: divisionKey
              .split('-')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' '),
            description: '',
            ...defaultMeta,
          });
        }
      } catch (err) {
        // Error loading data
        setMembers([]);
        setMeta({
          name: divisionKey
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          description: '',
          ...defaultMeta,
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [divisionKey]);

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const openMember = (m) => {
    setSelected(m);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div className="page-enter space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="animate-fade-in space-y-3">
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-btn text-neutral-600 hover:text-neutral-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg shadow-sm">
            <Users className="w-4 h-4 text-neutral-600" />
            <span className="text-body font-semibold text-neutral-900">{members.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${meta?.bgLight || 'bg-neutral-100'} flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0`}>{meta?.icon || '👥'}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-title-lg font-bold text-neutral-900">{meta?.name || 'Divisi'}</h1>
            {meta?.description && <p className="text-subtitle text-neutral-600 mt-0.5">{meta.description}</p>}
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-body text-neutral-600">Memuat anggota...</p>
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="col-span-full">
            <EmptyState icon="users" title="Belum Ada Anggota" description="Divisi ini belum memiliki anggota terdaftar." variant="primary" size="sm" />
          </div>
        ) : (
          members.map((m, i) => <MemberCard key={m.id || i} member={m} onClick={() => openMember(m)} />)
        )}
      </div>

      {/* Modal Detail Anggota */}
      <Modal isOpen={open} onClose={close} title={selected?.name || 'Detail Anggota'}>
        <div className="space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Photo */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200">
                {selected?.photo || selected?.photoUrl || selected?.avatar ? (
                  <img
                    src={normalizeFileUrl(selected.photo || selected.photoUrl || selected.avatar)}
                    alt={`Foto ${selected.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-500 flex items-center justify-center text-xl sm:text-2xl font-bold text-white">{getInitials(selected?.name)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2">{selected?.name}</h3>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200">
                  <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {selected?.jabatan || 'Anggota'}
                </span>

                <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-full text-xs text-neutral-600">
                  <Building2 className="w-3 h-3" />
                  {selected?.division || meta?.name || 'Divisi'}
                </span>

                {selected?.cohort && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-full text-xs text-neutral-600">
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


        </div>
      </Modal>
    </div>
  );
}
