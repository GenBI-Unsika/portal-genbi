import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

export default function SocialLinks({ links = [], size = 'sm' }) {
  // normalize links into a map by type
  const map = { instagram: null, linkedin: null, email: null };
  if (Array.isArray(links)) {
    links.forEach((l) => {
      const t = (l.type || l.label || '').toString().toLowerCase();
      if (t.includes('insta') || t.includes('ig')) map.instagram = l;
      else if (t.includes('link') || t.includes('linkedin')) map.linkedin = l;
      else if (t.includes('mail') || t.includes('email')) map.email = l;
    });
  }

  const small = size === 'sm';
  const common = 'inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700';
  const btnSize = small ? 'px-2 py-1' : 'px-3 py-1.5';

  const renderIcon = (type) => {
    if (type === 'instagram') return <Instagram className={small ? 'h-4 w-4' : 'h-5 w-5'} />;
    if (type === 'linkedin') return <Linkedin className={small ? 'h-4 w-4' : 'h-5 w-5'} />;
    return <Mail className={small ? 'h-4 w-4' : 'h-5 w-5'} />;
  };

  // Always render Instagram and Email icons (disabled styling if missing). LinkedIn only when present.
  return (
    <div className={small ? 'inline-flex items-center gap-2 text-xs' : 'inline-flex items-center gap-3 text-sm'}>
      {/* Instagram (required visually) */}
      {map.instagram ? (
        <a href={map.instagram.url} target="_blank" rel="noreferrer" className={`${common} ${btnSize}`} title="Instagram">
          {renderIcon('instagram')}
        </a>
      ) : (
        <div className={`${common} ${btnSize} opacity-40 pointer-events-none`} title="Instagram tidak tersedia">
          {renderIcon('instagram')}
        </div>
      )}

      {/* LinkedIn (optional) */}
      {map.linkedin ? (
        <a href={map.linkedin.url} target="_blank" rel="noreferrer" className={`${common} ${btnSize}`} title="LinkedIn">
          {renderIcon('linkedin')}
        </a>
      ) : null}

      {/* Email (required visually) */}
      {map.email ? (
        <a href={map.email.url} className={`${common} ${btnSize}`} title="Email">
          {renderIcon('email')}
        </a>
      ) : (
        <div className={`${common} ${btnSize} opacity-40 pointer-events-none`} title="Email tidak tersedia">
          {renderIcon('email')}
        </div>
      )}
    </div>
  );
}
