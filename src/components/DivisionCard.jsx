import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DivisionCard({ divisionKey, title, members = [], description = '', bannerClass = 'bg-gradient-to-r from-primary-200 to-primary-400' }) {
  const navigate = useNavigate();

  const go = () => navigate(`/anggota/${divisionKey}`);
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  };

  return (
    <div
      className="group rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-xl transform-gpu transition-all duration-300 hover:scale-[1.02] hover:border-neutral-300 cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={onKeyDown}
      aria-label={`Buka halaman ${title}`}
    >
      {/* Banner area with photo placeholder */}
      <div className="relative h-32 flex items-center justify-center overflow-hidden bg-neutral-100">
        {/* Background image */}
        <img src="https://placehold.co/600x400" alt="" className="absolute inset-0 w-full h-full object-cover" />

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
      </div>

      {/* Content area */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
            {description && <p className="text-sm text-neutral-600 line-clamp-2">{description}</p>}
          </div>
        </div>

        {/* Member count badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full mb-4">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-neutral-900">{members.length} Anggota</span>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600 transition-colors">Lihat semua anggota</span>
          <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
