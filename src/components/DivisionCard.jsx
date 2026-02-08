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
      className="group rounded-xl sm:rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-xl transform-gpu transition-all duration-300 hover-lift hover:border-neutral-300 cursor-pointer card-enter"
      role="link"
      tabIndex={0}
      onClick={go}
      onKeyDown={onKeyDown}
      aria-label={`Buka halaman ${title}`}
    >
      {/* Banner area with photo placeholder */}
      <div className="relative h-24 sm:h-32 flex items-center justify-center overflow-hidden bg-neutral-100">
        <div className="absolute inset-0 flex items-center justify-center text-neutral-500">
          <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" aria-hidden="true">
              <path
                d="m 4 1 c -1.644531 0 -3 1.355469 -3 3 v 1 h 1 v -1 c 0 -1.109375 0.890625 -2 2 -2 h 1 v -1 z m 2 0 v 1 h 4 v -1 z m 5 0 v 1 h 1 c 1.109375 0 2 0.890625 2 2 v 1 h 1 v -1 c 0 -1.644531 -1.355469 -3 -3 -3 z m -5 4 c -0.550781 0 -1 0.449219 -1 1 s 0.449219 1 1 1 s 1 -0.449219 1 -1 s -0.449219 -1 -1 -1 z m -5 1 v 4 h 1 v -4 z m 13 0 v 4 h 1 v -4 z m -4.5 2 l -2 2 l -1.5 -1 l -2 2 v 0.5 c 0 0.5 0.5 0.5 0.5 0.5 h 7 s 0.472656 -0.035156 0.5 -0.5 v -1 z m -8.5 3 v 1 c 0 1.644531 1.355469 3 3 3 h 1 v -1 h -1 c -1.109375 0 -2 -0.890625 -2 -2 v -1 z m 13 0 v 1 c 0 1.109375 -0.890625 2 -2 2 h -1 v 1 h 1 c 1.644531 0 3 -1.355469 3 -3 v -1 z m -8 3 v 1 h 4 v -1 z m 0 0"
                fill="currentColor"
                fillOpacity="0.55"
              />
            </svg>
          </div>
        </div>
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
      </div>

      {/* Content area */}
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-title font-bold text-neutral-900 mb-1 sm:mb-2 group-hover:text-primary-600 transition-colors truncate">{title}</h3>
            {description && <p className="text-body-sm text-neutral-600 line-clamp-2">{description}</p>}
          </div>
        </div>

        {/* Member count badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-neutral-100 rounded-full mb-2 sm:mb-4">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary-500 rounded-full animate-pulse" />
          <span className="text-caption font-semibold text-neutral-900">{members.length} Anggota</span>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-neutral-100">
          <span className="text-caption font-medium text-neutral-700 group-hover:text-primary-600 transition-colors">Lihat semua anggota</span>
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
