import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, MapPin, Clock, Search, X } from 'lucide-react';
import { fetchEvents } from '../utils/api.js';
import LoadingState from '../components/ui/LoadingState.jsx';
import { useModal } from '../contexts/ModalContext.jsx';
import EventDetailModal from '../components/EventDetailModal.jsx';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

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

// Generate month matrix for calendar grid
function monthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const weeks = [];
  let week = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    week.push({ date: new Date(year, month - 1, prevMonthDays - i), inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push({ date: new Date(year, month, day), inMonth: true });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    const remaining = 7 - week.length;
    for (let day = 1; day <= remaining; day++) {
      week.push({ date: new Date(year, month + 1, day), inMonth: false });
    }
    weeks.push(week);
  }

  return weeks;
}

export default function Kalender() {
  const today = new Date();
  const { openModal, closeModal } = useModal();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'online' | 'offline'

  // Fetch events from API
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const data = await fetchEvents();
        setEvents(data || []);
      } catch (err) {
        console.error('Failed to load events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const matrix = useMemo(() => monthMatrix(year, month), [year, month]);

  // Get event mode from API response, fallback to local calculation
  const getEventMode = useCallback((event) => {
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
  }, []);

  // Filter events based on search and type filter
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return events.filter((e) => {
      const matchesQuery = !q || e.title?.toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q);
      const eventMode = getEventMode(e);
      const matchesType = filterType === 'all' || eventMode === filterType;
      return matchesQuery && matchesType;
    });
  }, [events, searchQuery, filterType, getEventMode]);

  // Group events by date
  const eventsByDay = useMemo(() => {
    const m = {};
    for (const e of filteredEvents) {
      (m[e.date] ??= []).push(e);
    }
    return m;
  }, [filteredEvents]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().slice(0, 10);
    return eventsByDay[dateStr] || [];
  }, [selectedDate, eventsByDay]);

  // Upcoming events (next 5)
  const upcomingEvents = useMemo(() => {
    const todayStr = today.toISOString().slice(0, 10);
    return filteredEvents
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [filteredEvents, today]);

  const prev = () => {
    const d = new Date(year, month - 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const next = () => {
    const d = new Date(year, month + 1, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(today);
  };

  const isToday = (date) => date.toDateString() === today.toDateString();
  const isSelected = (date) => selectedDate && date.toDateString() === selectedDate.toDateString();

  const formatTime = (time) => time || '00:00';

  const formatFullDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Open event detail modal using global modal context
  const openEventModal = useCallback(
    (event) => {
      openModal(<EventDetailModal event={event} onClose={closeModal} />);
    },
    [openModal, closeModal],
  );

  if (loading) {
    return <LoadingState message="Memuat kalender..." />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 page-enter">
      <div className="px-4 md:px-6 py-4 md:py-6 space-y-4">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-neutral-900 mb-1">Kalender GenBI Unsika</h1>
          <p className="text-neutral-600">Pantau jadwal kegiatan dan event GenBI</p>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
              {[
                { key: 'all', label: 'Semua', icon: CalendarIcon },
                { key: 'online', label: 'Online', icon: Video },
                { key: 'offline', label: 'Offline', icon: MapPin },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    filterType === f.key ? 'bg-white text-primary-700 shadow-sm border border-neutral-200' : 'text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <f.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{f.label}</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-200 rounded-full">
                  <X className="w-3.5 h-3.5 text-neutral-500" />
                </button>
              )}
            </div>

            {/* Month Navigation & Export */}
            <div className="flex items-center gap-2">
              <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-100 rounded-lg transition-colors">
                Hari Ini
              </button>
              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                <button onClick={prev} className="p-1.5 hover:bg-white rounded-md transition-colors" aria-label="Bulan sebelumnya">
                  <ChevronLeft className="w-4 h-4 text-neutral-600" />
                </button>
                <span className="px-3 text-sm font-semibold text-neutral-900 min-w-[120px] text-center">
                  {MONTHS[month]} {year}
                </span>
                <button onClick={next} className="p-1.5 hover:bg-white rounded-md transition-colors" aria-label="Bulan berikutnya">
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
          {/* Calendar Grid */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
              {DAYS.map((d, i) => (
                <div key={d} className={`text-center text-xs font-semibold py-3 uppercase tracking-wide ${i === 0 ? 'text-red-500' : 'text-neutral-600'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {matrix.flat().map(({ date, inMonth }, i) => {
                const key = date.toISOString().slice(0, 10);
                const dayEvents = eventsByDay[key] || [];
                const isTodayDate = isToday(date);
                const isSelectedDate = isSelected(date);
                const isSunday = date.getDay() === 0;

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    className={`min-h-[100px] md:min-h-[110px] border-r border-b border-neutral-100 last:border-r-0 cursor-pointer transition-colors group ${
                      !inMonth ? 'bg-neutral-50/60' : 'bg-white'
                    } ${isSelectedDate ? 'bg-primary-50 ring-2 ring-primary-500 ring-inset' : 'hover:bg-neutral-50'}`}
                  >
                    <div className="p-2 h-full flex flex-col">
                      {/* Date number */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                            isTodayDate ? 'bg-primary-600 text-white' : isSunday && inMonth ? 'text-red-500' : inMonth ? 'text-neutral-900' : 'text-neutral-400'
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dayEvents.length > 0 && <span className="text-xs text-neutral-500 font-medium">{dayEvents.length}</span>}
                      </div>

                      {/* Events indicators */}
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const colors = COLOR_MAP[ev.color] || COLOR_MAP.blue;
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEventModal(ev);
                              }}
                              className={`rounded px-1.5 py-0.5 text-xs font-medium truncate border ${colors.bg} ${colors.text} ${colors.border} hover:opacity-80 transition-opacity`}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && <div className="text-xs text-primary-600 font-medium pl-1">+{dayEvents.length - 2} lagi</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Upcoming Events */}
          <div className="space-y-4">
            {/* Selected Date Events */}
            {selectedDate && (
              <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-neutral-900 text-sm">{isToday(selectedDate) ? 'Hari Ini' : formatFullDate(selectedDate.toISOString().slice(0, 10))}</h3>
                  <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-neutral-100 rounded-md">
                    <X className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm text-neutral-500 text-center py-4">Tidak ada event</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEvents.map((ev) => {
                      const colors = COLOR_MAP[ev.color] || COLOR_MAP.blue;
                      const evMode = getEventMode(ev);
                      return (
                        <div key={ev.id} onClick={() => openEventModal(ev)} className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${colors.bg} ${colors.border}`}>
                          <div className={`font-medium text-sm ${colors.text}`}>{ev.title}</div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-600">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(ev.time)}</span>
                            {evMode === 'online' ? <Video className="w-3 h-3 text-purple-500" /> : <MapPin className="w-3 h-3 text-green-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
              <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary-600" />
                Event Mendatang
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">Tidak ada event mendatang</p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((ev) => {
                    const colors = COLOR_MAP[ev.color] || COLOR_MAP.blue;
                    const evDate = new Date(ev.date);
                    const evMode = getEventMode(ev);
                    return (
                      <div key={ev.id} onClick={() => openEventModal(ev)} className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
                        <div className="flex flex-col items-center justify-center bg-neutral-100 rounded-lg p-2 min-w-[48px]">
                          <div className="text-xs text-neutral-500 font-medium uppercase">{evDate.toLocaleDateString('id-ID', { month: 'short' })}</div>
                          <div className="text-lg font-bold text-neutral-900">{evDate.getDate()}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-neutral-900 truncate">{ev.title}</div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(ev.time)}</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${evMode === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{evMode === 'online' ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${colors.dot}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
              <h3 className="font-semibold text-neutral-900 mb-3 text-sm">Keterangan</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Video className="w-4 h-4 text-purple-500" />
                  <span>Event Online</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>Event Offline</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{today.getDate()}</span>
                  </div>
                  <span>Hari Ini</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
