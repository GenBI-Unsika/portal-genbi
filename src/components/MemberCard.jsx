import React from 'react';
import SocialLinks from './SocialLinks';

function getInitials(name) {
  if (!name) return 'A';
  return String(name)
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
}

export default function MemberCard({ member = {}, onClick, onKeyDown, showStudyInfo = true }) {
  const { photo, name, jabatan, badgeText, major, faculty, socials } = member;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(member);
      }}
      onKeyDown={(e) => {
        if (onKeyDown) onKeyDown(e);
      }}
      className={[
        'group w-full text-left bg-white border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-sm',
        'transform-gpu transition-all duration-200 ease-out cursor-pointer hover-lift hover:shadow-xl-primary-500/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
        'card-enter',
      ].join(' ')}
    >
      {/* Media */}
      <div className="relative w-full h-36 sm:h-48 bg-gray-100 overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={`Foto ${name}`}
            className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.removeAttribute('src');
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 text-primary-900 grid place-items-center text-sm sm:text-base font-semibold">{getInitials(name)}</div>
          </div>
        )}

        {badgeText && <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 text-gray-800 text-caption-sm font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">{badgeText}</span>}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-caption mb-0.5 sm:mb-1 line-clamp-1">{name}</h3>
        <p className="text-gray-600 text-caption line-clamp-1">{jabatan}</p>

        {showStudyInfo && (major || faculty) && (
          <p className="mt-0.5 sm:mt-1 text-caption-sm text-gray-500 line-clamp-1">
            {major}
            {major && faculty ? ' • ' : ''}
            {faculty}
          </p>
        )}

        {/* Socials */}
        <div className="mt-2 sm:mt-3 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
          <SocialLinks links={socials} size="sm" />
        </div>
      </div>
    </div>
  );
}
