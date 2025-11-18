import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Search, X, Plus, Clock, MapPin, Video, FileText } from 'lucide-react';

// Utility function to generate month matrix
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

// Mock events
const MOCK_EVENTS = [
  {
    id: 'e1',
    date: '2025-11-03',
    title: 'Rapat Koordinasi Bulanan',
    type: 'offline',
    time: '09:00',
    location: 'Ruang Rapat Lt.3',
    color: 'blue',
    description: 'Rapat koordinasi rutin untuk evaluasi program dan perencanaan agenda bulan berikutnya.',
  },
  {
    id: 'e2',
    date: '2025-11-03',
    title: 'Workshop Fotografi',
    type: 'offline',
    time: '14:00',
    location: 'Studio GenBI',
    color: 'green',
    description: 'Pelatihan dasar fotogarfi untuk dokumentasi kegiatan GenBI Unsika.',
  },
  {
    id: 'e3',
    date: '2025-11-07',
    title: 'Webinar Literasi Digital',
    type: 'online',
    time: '19:00',
    location: 'Zoom Meeting',
    color: 'purple',
    description: 'Webinar mengenai literasi digital dan keamanan berinternet.',
  },
  {
    id: 'e4',
    date: '2025-11-12',
    title: 'Pelatihan Konten Kreatif',
    type: 'offline',
    time: '13:00',
    location: 'Lab Multimedia',
    color: 'orange',
    description: 'Pelatihan membuat konten kreatif untuk media sosial GenBI.',
  },
  {
    id: 'e5',
    date: '2025-11-15',
    title: 'Diskusi Strategi Media Sosial',
    type: 'online',
    time: '15:30',
    location: 'Google Meet',
    color: 'pink',
    description: 'Diskusi santai terkait strategi konten dan jadwal posting.',
  },
  {
    id: 'e6',
    date: '2025-11-18',
    title: 'Coaching Leadership',
    type: 'offline',
    time: '10:00',
    location: 'Aula Utama',
    color: 'blue',
    description: 'Sesi coaching untuk pengurus terkait kepemimpinan dan manajemen tim.',
  },
  {
    id: 'e7',
    date: '2025-11-18',
    title: 'Live Instagram Kominfo',
    type: 'online',
    time: '20:00',
    location: 'Instagram Live',
    color: 'red',
    description: 'Live Instagram bersama Kominfo untuk sosialisasi program.',
  },
  {
    id: 'e8',
    date: '2025-11-22',
    title: 'Kolaborasi dengan Komunitas',
    type: 'offline',
    time: '16:00',
    location: 'Cafe Hub',
    color: 'teal',
    description: 'Pertemuan kolaborasi dengan komunitas eksternal.',
  },
  {
    id: 'e9',
    date: '2025-11-25',
    title: 'Pelatihan Public Speaking',
    type: 'offline',
    time: '09:30',
    location: 'Gedung Seminar',
    color: 'indigo',
    description: 'Pelatihan public speaking untuk persiapan MC dan moderator acara.',
  },
  {
    id: 'e10',
    date: '2025-11-28',
    title: 'Evaluasi Program Kerja',
    type: 'online',
    time: '14:00',
    location: 'Microsoft Teams',
    color: 'purple',
    description: 'Evaluasi program kerja dan pencapaian target.',
  },
  {
    id: 'e11',
    date: '2025-12-05',
    title: 'Rapat Inti Pengurus',
    type: 'offline',
    time: '13:00',
    location: 'Sekretariat',
    color: 'blue',
    description: 'Rapat inti pengurus untuk membahas keputusan penting organisasi.',
  },
  {
    id: 'e12',
    date: '2025-12-10',
    title: 'Webinar Ekonomi Digital',
    type: 'online',
    time: '18:00',
    location: 'Zoom',
    color: 'green',
    description: 'Webinar mengenai tren ekonomi digital dan peluangnya.',
  },
  {
    id: 'e13',
    date: '2025-12-15',
    title: 'Gathering End of Year',
    type: 'offline',
    time: '17:00',
    location: 'Villa Puncak',
    color: 'yellow',
    description: 'Gathering penutup tahun bersama seluruh anggota GenBI Unsika.',
  },
  {
    id: 'e14',
    date: '2025-12-20',
    title: 'Persiapan Event Tahunan',
    type: 'offline',
    time: '10:00',
    location: 'Sekretariat',
    color: 'orange',
    description: 'Persiapan teknis dan pembagian tugas untuk event tahunan.',
  },
  {
    id: 'e15',
    date: '2025-10-05',
    title: 'Kick-off Program Semester',
    type: 'offline',
    time: '08:00',
    location: 'Auditorium',
    color: 'blue',
    description: 'Pembukaan resmi program kegiatan untuk satu semester ke depan.',
  },
  {
    id: 'e16',
    date: '2025-10-12',
    title: 'Training Content Creator',
    type: 'offline',
    time: '13:00',
    location: 'Studio',
    color: 'pink',
    description: 'Training untuk tim konten mengenai produksi foto dan video.',
  },
  {
    id: 'e17',
    date: '2025-10-20',
    title: 'Podcast Recording Session',
    type: 'online',
    time: '15:00',
    location: 'Studio Podcast',
    color: 'purple',
    description: 'Sesi rekaman podcast untuk kanal resmi GenBI.',
  },
  {
    id: 'e18',
    date: '2025-10-28',
    title: 'Monitoring & Evaluasi',
    type: 'online',
    time: '10:00',
    location: 'Zoom',
    color: 'indigo',
    description: 'Monitoring dan evaluasi pelaksanaan program berjalan.',
  },
];

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
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const [events, setEvents] = useState(() => [...MOCK_EVENTS]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // all | online | offline

  const [formMode, setFormMode] = useState(null); // 'create' | 'edit' | null
  const [formEvent, setFormEvent] = useState(EMPTY_EVENT);

  const matrix = useMemo(() => monthMatrix(year, month), [year, month]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return events.filter((e) => {
      const matchesQuery = !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
      const matchesType = filterType === 'all' || e.type === filterType;
      return matchesQuery && matchesType;
    });
  }, [events, searchQuery, filterType]);

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
    });
    setFormMode('create');
  };

  const openEditModal = (ev) => {
    setFormEvent({ ...ev });
    setFormMode('edit');
  };

  const closeFormModal = () => {
    setFormMode(null);
    setFormEvent(EMPTY_EVENT);
  };

  const handleFormChange = (field, value) => {
    setFormEvent((prev) => ({ ...prev, [field]: value }));
  };

  const saveEvent = () => {
    if (!formEvent.title.trim()) return;
    if (!formEvent.date) return;

    if (formMode === 'create') {
      setEvents((prev) => [...prev, { ...formEvent }]);
    } else if (formMode === 'edit') {
      setEvents((prev) => prev.map((e) => (e.id === formEvent.id ? { ...formEvent } : e)));
      setSelectedEvent((prev) => (prev && prev.id === formEvent.id ? { ...formEvent } : prev));
    }

    closeFormModal();
  };

  const deleteEvent = (ev) => {
    setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    setSelectedEvent((prev) => (prev && prev.id === ev.id ? null : prev));
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top Navigation Bar */}
      <div className="max-w-[1600px] mx-auto px-6 py-3">
        <div className="bg-white p-4 rounded-xl sticky top-0 z-10">
          <div className="flex items-center justify-between gap-4">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-3 pr-4 border-r border-neutral-200">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-neutral-900">Kalender</h1>
              </div> */}

              <button onClick={goToToday} className="px-3 py-1.5 text-sm font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-100 rounded-lg transition-colors">
                Hari Ini
              </button>

              <div className="flex items-center gap-1">
                <button onClick={prev} className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors" aria-label="Bulan sebelumnya">
                  <ChevronLeft className="h-5 w-5 text-neutral-600" />
                </button>
                <button onClick={next} className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors" aria-label="Bulan berikutnya">
                  <ChevronRight className="h-5 w-5 text-neutral-600" />
                </button>
              </div>

              <h2 className="text-xl font-normal text-neutral-900 min-w-[200px]">
                {monthName} {year}
              </h2>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
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
                    className={`px-2.5 py-1 text-[11px] rounded-full font-medium transition-colors ${filterType === f.key ? 'bg-white text-blue-700 shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari event (judul / lokasi)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 pr-9 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
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

      {/* Main Calendar */}
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
            {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d, i) => (
              <div key={d} className={`text-center text-xs font-semibold py-3 uppercase tracking-wide ${i === 0 || i === 6 ? 'text-neutral-500' : 'text-neutral-600'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
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
                  className={`min-h-[120px] border-r border-b border-neutral-100 last:border-r-0 ${!inMonth ? 'bg-neutral-50/60' : 'bg-white'} ${
                    isWeekend && inMonth ? 'bg-blue-50/20' : ''
                  } hover:bg-blue-50/40 transition-colors group relative`}
                >
                  <div className="p-2 h-full flex flex-col">
                    {/* Date number & add button */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={isTodayDate ? 'w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold' : inMonth ? 'text-sm font-medium text-neutral-900' : 'text-sm text-neutral-400'}>
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className={`p-6 border-b border-neutral-200 ${COLOR_MAP[selectedEvent.color]?.bg || 'bg-blue-100'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 leading-tight">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-700">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      {formatEventTime(selectedEvent.time)} •{' '}
                      {new Date(selectedEvent.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0">
                  <X className="h-5 w-5 text-neutral-600" />
                </button>
              </div>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                {selectedEvent.type === 'online' ? <Video className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" /> : <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-900 mb-1">Lokasi</div>
                  <div className="text-sm text-neutral-600">{selectedEvent.location}</div>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-neutral-900 mb-1">Deskripsi</div>
                    <div className="text-sm text-neutral-600 whitespace-pre-line">{selectedEvent.description}</div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-neutral-200">
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${selectedEvent.type === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {selectedEvent.type === 'online' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  {selectedEvent.type === 'online' ? 'Event Online' : 'Event Offline'}
                </span>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-3">
              <button type="button" onClick={() => deleteEvent(selectedEvent)} className="flex-1 px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-red-600 rounded-lg font-medium transition-colors">
                Hapus
              </button>
              <button type="button" onClick={() => openEditModal(selectedEvent)} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Edit Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Event Modal */}
      {formMode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeFormModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">{formMode === 'create' ? 'Tambah Event' : 'Edit Event'}</h3>
              <button onClick={closeFormModal} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-neutral-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Judul</label>
                <input
                  type="text"
                  value={formEvent.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama kegiatan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Tanggal</label>
                  <input
                    type="date"
                    value={formEvent.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Waktu</label>
                  <input
                    type="time"
                    value={formEvent.time}
                    onChange={(e) => handleFormChange('time', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Tipe Event</label>
                  <select
                    value={formEvent.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formEvent.type === 'online' ? 'Link Zoom / Google Meet / dsb.' : 'Ruang / gedung / alamat'}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Deskripsi</label>
                <textarea
                  value={formEvent.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-y"
                  placeholder="Rincian singkat mengenai kegiatan (opsional)."
                />
              </div>
            </div>

            <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex gap-3 justify-end">
              <button type="button" onClick={closeFormModal} className="px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-700 rounded-lg font-medium transition-colors">
                Batal
              </button>
              <button type="button" onClick={saveEvent} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
