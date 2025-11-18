import React, { useState } from 'react';
import MemberCard from '../components/MemberCard';
import DivisionCard from '../components/DivisionCard';
import Modal from '../components/Modal';
import SocialLinks from '../components/SocialLinks';
import { divisions, sampleMembers } from '../lib/members';

export default function Anggota() {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const handleMemberClick = (m) => {
    setSelected(m);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Data Anggota</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {divisions.map((d) => (
          <DivisionCard key={d.key} divisionKey={d.key} title={d.name} description={d.description} bannerClass={d.bannerClass} members={sampleMembers[d.key] || []} onMemberClick={handleMemberClick} />
        ))}
      </div>

      {/* Modal Detail Anggota */}
      <Modal isOpen={open} onClose={handleClose} title={selected?.name || 'Detail Anggota'}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* FOTO + META (Jabatan, Divisi, Social) */}
          <div className="sm:col-span-1">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
              {selected?.photo ? (
                <img src={selected.photo} alt={`Foto ${selected.name}`} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 text-primary-900 grid place-items-center text-2xl font-semibold">
                    {(selected?.name || 'GN')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase())
                      .join('')}
                  </div>
                </div>
              )}
            </div>

            {/* Meta di bawah foto */}
            <div className="mt-4 space-y-3">
              <div className="text-xs inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-md px-2 py-1 w-fit">
                <span className="font-medium">Divisi:</span>
                <span>{selected?.division || '—'}</span>
              </div>

              {/* Social links */}
              <SocialLinks links={selected?.socials} size="md" />
            </div>
          </div>

          {/* PROFIL + MOTIVASI */}
          <div className="sm:col-span-2">
            <div className="mb-4">
              <p className="text-xs text-gray-500">Jabatan</p>
              <p className="font-medium text-gray-900">{selected?.jabatan || '—'}</p>
            </div>
            {/* Profil ringkas */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900">Profil</h4>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-xs text-gray-500">Fakultas</p>
                  <p className="text-gray-800">{selected?.faculty || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Jurusan/Prodi</p>
                  <p className="text-gray-800">{selected?.major || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Angkatan</p>
                  <p className="text-gray-800">{selected?.cohort ?? '—'}</p>
                </div>
              </div>
            </div>

            {/* Motivasi */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Motivasi</h4>
              <p className="text-gray-700">{selected?.motivasi || '—'}</p>
            </div>
          </div>

          {/* CERITA: full width di bawah */}
          <div className="sm:col-span-3">
            <h4 className="font-semibold text-gray-900">Cerita</h4>
            <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-4 max-h-[50vh] overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-line">{selected?.cerita || '—'}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
