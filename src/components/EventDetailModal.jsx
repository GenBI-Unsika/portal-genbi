import React from 'react';
import { Clock, X, Video, MapPin, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { getGoogleCalendarUrl } from '../utils/api.js';

const COLOR_MAP = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', dot: 'bg-green-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

const formatTime = (time) => time || '00:00';

const formatFullDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// Helper to determine if event is online/offline
const getEventMode = (event) => {
  // Use mode from API if available
  if (event.mode === 'online' || event.mode === 'offline') {
    return event.mode;
  }
  // Fallback: calculate from type/location
  const type = (event.type || '').toLowerCase();
  if (type === 'online') return 'online';
  if (type === 'offline') return 'offline';
  const loc = (event.location || '').toLowerCase();
  if (loc.includes('http') || loc.includes('zoom') || loc.includes('meet.google') || loc.includes('teams')) {
    return 'online';
  }
  return 'offline';
};

export default function EventDetailModal({ event, onClose }) {
  if (!event) return null;

  const eventMode = getEventMode(event);

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-neutral-200" onClick={(e) => e.stopPropagation()}>
      {/* Modal Header */}
      <div className={`p-6 ${COLOR_MAP[event.color]?.bg || 'bg-blue-50'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">{event.title}</h3>
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(event.time)} • {formatFullDate(event.date)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          {eventMode === 'online' ? <Video className="w-5 h-5 text-purple-600 mt-0.5" /> : <MapPin className="w-5 h-5 text-green-600 mt-0.5" />}
          <div>
            <div className="text-sm font-semibold text-neutral-900 mb-1">Lokasi</div>
            <div className="text-sm text-neutral-600">{event.location || '-'}</div>
          </div>
        </div>

        {event.description && (
          <div className="flex items-start gap-3">
            <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-neutral-900 mb-1">Deskripsi</div>
              <div className="text-sm text-neutral-600 whitespace-pre-line">{event.description}</div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-200">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${eventMode === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
            {eventMode === 'online' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
            {eventMode === 'online' ? 'Event Online' : 'Event Offline'}
          </span>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="p-4 bg-neutral-50 border-t border-neutral-200 space-y-2">
        <button
          onClick={async () => {
            const url = await getGoogleCalendarUrl(event.id);
            if (url) {
              window.open(url, '_blank');
            }
          }}
          className="w-full px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Google Calendar
        </button>
        <button onClick={onClose} className="w-full px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2" aria-label="Tutup">
          <X className="w-4 h-4" />
          <span className="sr-only">Tutup</span>
        </button>
      </div>
    </div>
  );
}
