import { useMemo, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Search, X, Plus, Clock, MapPin, Video, FileText } from 'lucide-react';
import { useConfirm } from '../contexts/ConfirmContext.jsx';
import { fetchEvents, fetchTeamMembers, apiFetch } from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';


function monthMatrix(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const weeks = [];
  let week = [];

  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    week.push(new Date(year, month - 1, prevMonthDays - i));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    const remaining = 7 - week.length;
    for (let day = 1; day <= remaining; day++) {
      week.push(new Date(year, month + 1, day));
    }
    weeks.push(week);
  }

  return weeks;
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const COLOR_MAP = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', hover: 'hover:bg-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', hover: 'hover:bg-green-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', hover: 'hover:bg-purple-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', hover: 'hover:bg-orange-200' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', hover: 'hover:bg-pink-200' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', hover: 'hover:bg-red-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', hover: 'hover:bg-teal-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300', hover: 'hover:bg-indigo-200' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', hover: 'hover:bg-yellow-200' },
};

const EMPTY_EVENT = {
  id: '',
  title: '',
  date: '',
  time: '09:00',
  type: 'offline',
  location: '',
  color: 'blue',
  description: '',
};

export default function ModernCalendar() {
  const { confirm } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today); // For mobile: selected date

  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [urlEventProcessed, setUrlEventProcessed] = useState(false);


  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const apiEvents = await fetchEvents();
        setEvents(apiEvents || []);
      } catch (err) {
        // Error fetching events
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);


  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const membersData = await fetchTeamMembers();
        if (!cancelled) setMembers(membersData || []);
      } catch (err) {
        // Error fetching members for birthdays
        if (!cancelled) setMembers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);


  useEffect(() => {
    if (loading || urlEventProcessed) return;

    const dateParam = searchParams.get('date');
    const eventIdParam = searchParams.get('eventId');

    if (dateParam) {
      const targetDate = new Date(dateParam);
      if (!isNaN(targetDate.getTime())) {
        setYear(targetDate.getFullYear());
        setMonth(targetDate.getMonth());
        setSelectedDate(targetDate);

        // Find and show the specific event if eventId is provided
        if (eventIdParam && events.length > 0) {
          const targetEvent = events.find((e) => e.id === eventIdParam);
          if (targetEvent) {
            // Small delay to ensure UI is ready
            setTimeout(() => {
              setSelectedEvent(targetEvent);
            }, 100);
          }
        }
      }
      // Clear URL params after processing
      setSearchParams({}, { replace: true });
    }
    setUrlEventProcessed(true);
  }, [loading, events, searchParams, setSearchParams, urlEventProcessed]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | online | offline

  const [formMode, setFormMode] = useState(null); // 'create' | 'edit' | null
  const [formEvent, setFormEvent] = useState(EMPTY_EVENT);

  const matrix = useMemo(() => monthMatrix(year, month), [year, month]);


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

  const birthdayEvents = useMemo(() => {
    const pad2 = (n) => String(n).padStart(2, '0');

    const parseMonthDay = (value) => {
      if (!value) return null;
      if (typeof value === 'string') {
        const ymd = value.slice(0, 10);
        const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) return { month: Number(match[2]) - 1, day: Number(match[3]) };
      }
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      return { month: d.getMonth(), day: d.getDate() };
    };

    return (members || [])
      .filter((m) => m.birthDate || m.birthday)
      .map((m) => {
        const md = parseMonthDay(m.birthDate || m.birthday);
        if (!md) return null;
        const dateStr = `${year}-${pad2(md.month + 1)}-${pad2(md.day)}`;
        return {
          id: `bday-${m.id}-${year}`,
          title: `Ulang Tahun: ${m.name}`,
          date: dateStr,
          time: '00:00',
          type: 'offline',
          mode: 'offline',
          location: '',
          color: 'pink',
          description: '',
          readOnly: true,
          isBirthday: true,
          member: {
            id: m.id,
            name: m.name,
            photo: m.photo || m.photoUrl || null,
          },
        };
      })
      .filter(Boolean);
  }, [members, year]);

  const displayEvents = useMemo(() => {
    return [...events, ...birthdayEvents];
  }, [events, birthdayEvents]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return displayEvents.filter((e) => {
      const matchesQuery = !q || e.title?.toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q);
      const eventMode = getEventMode(e);
      const matchesType = filterType === 'all' || eventMode === filterType;
      return matchesQuery && matchesType;
    });
  }, [displayEvents, searchQuery, filterType, getEventMode]);

  const eventsByDay = useMemo(() => {
    const m = {};
    for (const e of filteredEvents) {
      (m[e.date] ??= []).push(e);
    }
    return m;
  }, [filteredEvents]);

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
  };

  const monthName = MONTHS[month];
  const isToday = (date) => date.toDateString() === today.toDateString();
  const formatEventTime = (time) => time || '00:00';

  const openCreateModal = (date) => {
    const dateStr = date.toISOString().slice(0, 10);
    setFormEvent({
      ...EMPTY_EVENT,
      id: `tmp-${Date.now()}`,
      date: dateStr,
      originalType: null,
      initialMode: EMPTY_EVENT.type,
    });
    setSelectedEvent(null);
    setFormMode('create');
  };

  const openEditModal = (ev) => {
    const mode = getEventMode(ev);
    setFormEvent({
      ...ev,
      type: mode,
      originalType: ev?.type ?? null,
      initialMode: mode,
    });
    setSelectedEvent(null);
    setFormMode('edit');
  };

  const closeFormModal = () => {
    setFormMode(null);
    setFormEvent(EMPTY_EVENT);
  };

  const handleFormChange = (field, value) => {
    setFormEvent((prev) => ({ ...prev, [field]: value }));
  };

  const toast = useToast();

  const saveEvent = async () => {
    if (!formEvent.title.trim()) {
      toast.push({ type: 'error', message: 'Judul event wajib diisi' });
      return;
    }
    if (!formEvent.date) {
      toast.push({ type: 'error', message: 'Tanggal event wajib diisi' });
      return;
    }

    const ok = await confirm({
      title: formMode === 'create' ? 'Simpan event?' : 'Simpan perubahan event?',
      description: 'Pastikan informasi event sudah benar.',
      confirmText: 'Simpan',
      cancelText: 'Batal',
    });

    if (!ok) return;

    try {
      // Combine date and time into startDate
      const startDateTime = formEvent.time ? `${formEvent.date}T${formEvent.time}:00` : `${formEvent.date}T00:00:00`;

      const originalType = formEvent.originalType;
      const originalTypeNorm = (originalType || '').toLowerCase();
      const shouldPreserveOriginalType = formMode === 'edit' && originalType && originalTypeNorm !== 'online' && originalTypeNorm !== 'offline' && formEvent.initialMode && formEvent.type === formEvent.initialMode;

      const typeForPayload = shouldPreserveOriginalType ? originalType : formEvent.type?.toUpperCase() || 'OFFLINE';

      const payload = {
        title: formEvent.title,
        description: formEvent.description || '',
        type: typeForPayload,
        startDate: startDateTime,
        location: formEvent.location || '',
        color: formEvent.color || 'blue',
        isAllDay: !formEvent.time,
      };

      if (formMode === 'create') {
        const result = await apiFetch('/events', {
          method: 'POST',
          body: payload,
        });
        if (result?.data) {
          setEvents((prev) => [...prev, result.data]);
          toast.push({ type: 'success', message: 'Event berhasil ditambahkan' });
        }
      } else if (formMode === 'edit') {
        const result = await apiFetch(`/events/${formEvent.id}`, {
          method: 'PATCH',
          body: payload,
        });
        if (result?.data) {
          setEvents((prev) => prev.map((e) => (e.id === formEvent.id ? result.data : e)));
          setSelectedEvent((prev) => (prev && prev.id === formEvent.id ? result.data : prev));
          toast.push({ type: 'success', message: 'Event berhasil diperbarui' });
        }
      }
      closeFormModal();
    } catch (err) {
      // Error saving event
      toast.push({ type: 'error', message: err?.message || 'Gagal menyimpan event' });
    }
  };

  const deleteEvent = async (ev) => {
    const ok = await confirm({
      title: 'Hapus event?',
      description: 'Tindakan ini akan menghapus event dari kalender.',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      tone: 'danger',
    });

    if (!ok) return;

    try {
      await apiFetch(`/events/${ev.id}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      setSelectedEvent((prev) => (prev && prev.id === ev.id ? null : prev));
      toast.push({ type: 'success', message: 'Event berhasil dihapus' });
    } catch (err) {
      // Error deleting event
      toast.push({ type: 'error', message: err?.message || 'Gagal menghapus event' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 page-enter -m-3 sm:-m-4 md:-m-6">

      <div className="md:hidden flex flex-col h-[calc(100vh-60px)]">

        <div className="bg-white border-b border-neutral-200 px-3 py-2 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={prev} className="p-1.5 hover:bg-neutral-100 rounded-full" aria-label="Bulan sebelumnya">
                <ChevronLeft className="h-4 w-4 text-neutral-600" />
              </button>
              <button onClick={goToToday} className="px-2 py-1 text-xs font-semibold text-neutral-900 hover:bg-neutral-100 rounded-lg">
                {monthName} {year}
              </button>
              <button onClick={next} className="p-1.5 hover:bg-neutral-100 rounded-full" aria-label="Bulan berikutnya">
                <ChevronRight className="h-5 w-5 text-neutral-600" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToToday} className="text-xs font-medium text-blue-600 px-2 py-1 hover:bg-blue-50 rounded-lg">
                Hari Ini
              </button>
            </div>
          </div>
        </div>


        <div className="bg-white border-b border-neutral-200 px-2 py-1.5">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-0.5">
            {['M', 'S', 'S', 'R', 'K', 'J', 'S'].map((d, i) => (
              <div key={i} className={`text-center text-caption-sm font-medium py-0.5 ${i === 0 || i === 6 ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {d}
              </div>
            ))}
          </div>
          {/* Date grid - compact */}
          <div className="grid grid-cols-7 gap-px">
            {matrix.flat().map((date, i) => {
              const inMonth = date.getMonth() === month;
              const key = date.toISOString().slice(0, 10);
              const hasEvents = (eventsByDay[key] || []).length > 0;
              const isTodayDate = isToday(date);
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative w-8 h-8 flex items-center justify-center transition-all mx-auto
                    ${!inMonth ? 'text-neutral-300' : 'text-neutral-700'}
                  `}
                >
                  <span
                    className={`
                      relative w-5 h-5 flex items-center justify-center rounded-full text-caption-sm leading-none transition-colors
                      ${!inMonth ? 'text-neutral-300' : isSelected ? 'text-white font-bold' : isTodayDate ? 'text-blue-600 font-bold' : 'text-neutral-700'}
                      ${isSelected ? 'bg-blue-600' : isTodayDate ? 'bg-blue-50' : 'hover:bg-neutral-100'}
                    `}
                  >
                    {/* Event indicator dot - above number */}
                    {hasEvents && inMonth && <span className={`absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-red-500'}`} />}
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>


        <div className="flex-1 overflow-y-auto bg-neutral-50">
          {selectedDate && (
            <div className="px-3 py-2">
              {/* Selected date header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-caption-sm text-neutral-500">{selectedDate.toLocaleDateString('id-ID', { weekday: 'long' })}</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}
                  </p>
                </div>
                <button onClick={() => openCreateModal(selectedDate)} className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Events list */}
              {(() => {
                const key = selectedDate.toISOString().slice(0, 10);
                const items = eventsByDay[key] || [];

                if (items.length === 0) {
                  return (
                    <div className="text-center py-6">
                      <Calendar className="h-8 w-8 mx-auto text-neutral-300 mb-1.5" />
                      <p className="text-body-sm text-neutral-500">Tidak ada event</p>
                      <button onClick={() => openCreateModal(selectedDate)} className="mt-2 text-caption text-blue-600 font-medium hover:underline">
                        + Tambah event
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5">
                    {items.map((ev) => {
                      const colors = COLOR_MAP[ev.color] || COLOR_MAP.blue;
                      const mode = getEventMode(ev);
                      return (
                        <button key={ev.id} onClick={() => setSelectedEvent(ev)} className="w-full text-left bg-white rounded-lg p-2.5 border border-neutral-200 shadow-sm hover:shadow-md transition-all">
                          <div className="flex gap-2.5">
                            {/* Color bar */}
                            <div className={`w-1 rounded-full ${colors.bg.replace('bg-', 'bg-').replace('-100', '-500')}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-caption text-neutral-900 mb-0.5">{ev.title}</p>
                              <div className="flex items-center gap-1.5 text-caption-sm text-neutral-600">
                                <Clock className="h-3 w-3" />
                                <span>{formatEventTime(ev.time)}</span>
                              </div>
                              {ev.location && (
                                <div className="flex items-center gap-1.5 text-caption-sm text-neutral-500 mt-0.5">
                                  {mode === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                                  <span className="truncate">{ev.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Upcoming events section */}
              {(() => {
                const upcomingDays = matrix
                  .flat()
                  .filter((d) => {
                    const inMonth = d.getMonth() === month;
                    const isAfterSelected = d > selectedDate;
                    const key = d.toISOString().slice(0, 10);
                    return inMonth && isAfterSelected && (eventsByDay[key] || []).length > 0;
                  })
                  .slice(0, 3);

                if (upcomingDays.length === 0) return null;

                return (
                  <div className="mt-6">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Mendatang</p>
                    <div className="space-y-2">
                      {upcomingDays.map((d, idx) => {
                        const key = d.toISOString().slice(0, 10);
                        const items = eventsByDay[key] || [];
                        return (
                          <button key={idx} onClick={() => setSelectedDate(d)} className="w-full text-left bg-white rounded-lg p-2.5 border border-neutral-200 hover:border-blue-300 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-neutral-100 rounded-lg flex flex-col items-center justify-center">
                                <span className="text-caption-sm text-neutral-500">{['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()]}</span>
                                <span className="text-sm font-bold text-neutral-900">{d.getDate()}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-neutral-900 truncate">{items[0]?.title}</p>
                                {items.length > 1 && <p className="text-xs text-neutral-500">+{items.length - 1} event lainnya</p>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>



      <div className="hidden md:block px-6 py-3">
        <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl sticky top-0 z-10 shadow-sm border border-neutral-200 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
            {/* Top row: Month navigation */}
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4">
              <button onClick={goToToday} className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 text-btn font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-100 rounded-lg transition-colors">
                Hari Ini
              </button>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <button onClick={prev} className="p-1 sm:p-1.5 hover:bg-neutral-100 rounded-full transition-colors" aria-label="Bulan sebelumnya">
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600" />
                </button>
                <h2 className="text-title font-semibold text-neutral-900 min-w-[120px] sm:min-w-[140px] md:min-w-[200px] text-center">
                  {monthName} {year}
                </h2>
                <button onClick={next} className="p-1 sm:p-1.5 hover:bg-neutral-100 rounded-full transition-colors" aria-label="Bulan berikutnya">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Bottom row: Search and filters */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Filter type - compact pills */}
              <div className="hidden md:flex items-center gap-1 bg-neutral-50 border border-neutral-200 rounded-full px-1 py-0.5">
                {[
                  { key: 'all', label: 'Semua' },
                  { key: 'online', label: 'Online' },
                  { key: 'offline', label: 'Offline' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilterType(f.key)}
                    className={`px-3 py-1.5 text-btn rounded-full font-medium transition-colors ${filterType === f.key ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 h-9 sm:h-10 pl-9 sm:pl-11 pr-9 sm:pr-10 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-neutral-200 rounded-full transition-colors">
                    <X className="h-3.5 w-3.5 text-neutral-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      <div className="hidden md:block px-6 py-4">
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Day Headers (desktop only) */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d, i) => (
              <div key={d} className={`text-center text-xs font-semibold py-3 uppercase tracking-wide ${i === 0 || i === 6 ? 'text-neutral-500' : 'text-neutral-600'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid (desktop / md+) */}
          <div className="grid grid-cols-7">
            {matrix.flat().map((date, i) => {
              const inMonth = date.getMonth() === month;
              const key = date.toISOString().slice(0, 10);
              const items = eventsByDay[key] || [];
              const isTodayDate = isToday(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={i}
                  className={`min-h-[120px] border-r border-b border-neutral-100 last:border-r-0 ${!inMonth ? 'bg-neutral-50/60' : 'bg-white'} ${isWeekend && inMonth ? 'bg-blue-50/20' : ''
                    } hover:bg-blue-50/40 transition-colors group relative`}
                >
                  <div className="p-2 h-full flex flex-col">
                    {/* Date number & add button */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={isTodayDate ? 'w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold' : inMonth ? 'text-xs font-medium text-neutral-900' : 'text-xs text-neutral-400'}>
                        {date.getDate()}
                      </span>

                      {/* Add event button */}
                      {inMonth && (
                        <button type="button" onClick={() => openCreateModal(date)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded-md transition-all" title="Tambah event">
                          <Plus className="h-3.5 w-3.5 text-blue-600" />
                        </button>
                      )}
                    </div>

                    {/* Events list */}
                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                      {items.slice(0, 3).map((ev) => {
                        const colors = COLOR_MAP[ev.color] || COLOR_MAP.blue;
                        return (
                          <button
                            key={ev.id}
                            type="button"
                            onClick={() => setSelectedEvent(ev)}
                            className={`w-full text-left rounded-md px-2 py-1 text-xs font-medium border transition-all ${colors.bg} ${colors.text} ${colors.border} ${colors.hover} shadow-sm`}
                            title={ev.title}
                          >
                            <div className="flex items-start gap-1.5">
                              <Clock className="h-3 w-3 mt-0.5 flex-shrink-0 opacity-70" />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold">{formatEventTime(ev.time)}</div>
                                <div className="truncate leading-tight">{ev.title}</div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      {items.length > 3 && (
                        <button type="button" onClick={() => setSelectedEvent(items[0])} className="w-full text-left px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md font-medium transition-colors">
                          +{items.length - 3} lainnya
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {selectedEvent && (
        <Modal isOpen={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} zIndex="z-[9998]">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-neutral-200 max-w-md w-full overflow-hidden">
            {/* Modal header */}
            <div className={`p-4 sm:p-5 border-b border-neutral-200 ${COLOR_MAP[selectedEvent.color]?.bg || 'bg-blue-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-3">
                  <h3 className="text-subtitle font-bold text-neutral-900 mb-1 leading-tight">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-1.5 text-caption-sm text-neutral-700">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">
                      {formatEventTime(selectedEvent.time)} •{' '}
                      {new Date(selectedEvent.date).toLocaleDateString('id-ID', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0">
                  <X className="h-4 w-4 text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              {selectedEvent.location ? (
                <div className="flex items-start gap-2.5">
                  {getEventMode(selectedEvent) === 'online' ? <Video className="h-3.5 w-3.5 text-purple-600 mt-0.5 flex-shrink-0" /> : <MapPin className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="text-caption-sm font-semibold text-neutral-900 mb-0.5">Lokasi</div>
                    <div className="text-caption-sm text-neutral-600">{selectedEvent.location}</div>
                  </div>
                </div>
              ) : selectedEvent.isBirthday ? (
                <div className="flex items-start gap-2.5">
                  <Cake className="h-3.5 w-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-caption-sm font-semibold text-neutral-900 mb-0.5">Ulang Tahun Anggota</div>
                    <div className="text-caption-sm text-neutral-600">Event ini otomatis dari tanggal lahir anggota dan tidak bisa diedit dari kalender.</div>
                  </div>
                </div>
              ) : null}

              {selectedEvent.description && (
                <div className="flex items-start gap-2.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-caption-sm font-semibold text-neutral-900 mb-0.5">Deskripsi</div>
                    <div className="text-caption-sm text-neutral-600 whitespace-pre-line">{selectedEvent.description}</div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-caption-sm font-semibold ${getEventMode(selectedEvent) === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {getEventMode(selectedEvent) === 'online' ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                  {getEventMode(selectedEvent) === 'online' ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-3 sm:p-4 pb-6 sm:pb-4 bg-neutral-50 border-t border-neutral-200 flex gap-2">
              {selectedEvent.readOnly ? (
                <button type="button" onClick={() => setSelectedEvent(null)} className="w-full px-3 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium transition-colors">
                  Tutup
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => deleteEvent(selectedEvent)}
                    className="flex-1 px-3 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(selectedEvent)}
                    className="flex-1 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    Edit Event
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Event Modal */}
      {formMode && (
        <Modal isOpen={Boolean(formMode)} onClose={closeFormModal} zIndex="z-[9998]">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-neutral-200 max-w-md w-full overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">{formMode === 'create' ? 'Tambah Event' : 'Edit Event'}</h3>
              <button onClick={closeFormModal} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="h-4 w-4 text-neutral-600" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Judul</label>
                <input
                  type="text"
                  value={formEvent.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama event"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Tanggal</label>
                  <input
                    type="date"
                    value={formEvent.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Waktu</label>
                  <input
                    type="time"
                    value={formEvent.time}
                    onChange={(e) => handleFormChange('time', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Tipe</label>
                  <select
                    value={formEvent.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Warna</label>
                  <select
                    value={formEvent.color}
                    onChange={(e) => handleFormChange('color', e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.keys(COLOR_MAP).map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Lokasi / Link</label>
                <input
                  type="text"
                  value={formEvent.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formEvent.type === 'online' ? 'Link Zoom / Meet' : 'Alamat lokasi'}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Deskripsi</label>
                <textarea
                  value={formEvent.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-y"
                  placeholder="Rincian singkat (opsional)"
                />
              </div>
            </div>

            <div className="p-3 sm:p-4 pb-6 sm:pb-4 bg-neutral-50 border-t border-neutral-200 flex gap-2 justify-end">
              <button type="button" onClick={closeFormModal} className="px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium transition-colors">
                Batal
              </button>
              <button type="button" onClick={saveEvent} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
