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
        'group w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm',
        'transform-gpu transition-transform duration-200 ease-out cursor-pointer hover:scale-[1.02] hover:shadow-xl-primary-500/30',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      {/* Media */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-200 to-primary-400 text-primary-900 grid place-items-center font-semibold">{getInitials(name)}</div>
          </div>
        )}

        {badgeText && <span className="absolute top-3 left-3 bg-white/90 text-gray-800 text-xs font-medium px-2 py-1 rounded-md">{badgeText}</span>}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{name}</h3>
        <p className="text-gray-600 text-sm line-clamp-1">{jabatan}</p>

        {showStudyInfo && (major || faculty) && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-1">
            {major}
            {major && faculty ? ' • ' : ''}
            {faculty}
          </p>
        )}

        {/* Socials */}
        <div className="mt-3 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
          <SocialLinks links={socials} size="sm" />
        </div>
      </div>
    </div>
  );
}
