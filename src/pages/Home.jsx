import { CalendarDays, Trophy, Users, Wallet, ChevronLeft, ChevronRight, Cake, ExternalLink } from 'lucide-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTeamMembers, fetchEvents } from '../utils/api.js';
import { getMe } from '../utils/auth.js';
import LoadingState from '../components/ui/LoadingState.jsx';
import Avatar from '../components/Avatar.jsx';

const monthlyFee = 50000;

export default function Home() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const me = useMemo(() => getMe(), []);
  const userName = me?.profile?.name || me?.name || me?.email || 'Pengguna';


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [membersData, eventsData] = await Promise.all([fetchTeamMembers(), fetchEvents()]);
        setMembers(membersData || []);
        setEvents(eventsData || []);
      } catch (err) {
        // Error loading home data
        setMembers([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const totalMembers = members.length;
  const divisions = useMemo(() => {
    const divSet = new Set(members.map((m) => m.division).filter(Boolean));
    return Array.from(divSet);
  }, [members]);
  const totalDivisions = divisions.length;


  const totalCollected = useMemo(() => {
    return totalMembers * monthlyFee * 6; // Estimate: 6 months
  }, [totalMembers]);

  const today = new Date();
  const upcoming = useMemo(() => {
    return events
      .map((e) => ({ ...e, dateObj: new Date(e.date) }))
      .filter((e) => e.dateObj >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 5);
  }, [events]);

  const upcomingBirthdays = useMemo(() => {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const parseMonthDay = (value) => {
      if (!value) return null;

      if (typeof value === 'string') {
        const ymd = value.slice(0, 10);
        const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (match) {
          return { month: Number(match[2]) - 1, day: Number(match[3]) };
        }
      }

      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return null;
      return { month: d.getMonth(), day: d.getDate() };
    };

    const getNextBirthdayInfo = (birthValue, baseDate) => {
      const md = parseMonthDay(birthValue);
      if (!md) return null;

      const base = startOfDay(baseDate);
      let next = new Date(base.getFullYear(), md.month, md.day);
      if (next < base) next = new Date(base.getFullYear() + 1, md.month, md.day);
      const daysUntil = Math.round((next - base) / MS_PER_DAY);
      return { birthdayDate: next, daysUntil };
    };

    const baseToday = new Date();
    const upcomingAll = members
      .filter((m) => m.birthDate || m.birthday)
      .map((m) => {
        const info = getNextBirthdayInfo(m.birthDate || m.birthday, baseToday);
        if (!info) return null;
        return { ...m, ...info };
      })
      .filter(Boolean)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    if (upcomingAll.length === 0) return [];

    const nearestDays = upcomingAll[0].daysUntil;
    return upcomingAll.filter((m) => m.daysUntil === nearestDays).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' }));
  }, [members]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };


  const handleEventClick = (event) => {
    navigate(`/kalender?date=${event.date}&eventId=${event.id}`);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();

      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = dateObj.toISOString().slice(0, 10);
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;

      const dayEvents = events.filter((e) => e.date === dateStr);
      const hasEvent = dayEvents.length > 0;

      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex items-center justify-center rounded-full transition-all cursor-pointer group relative mx-auto font-semibold text-xs ${isToday ? 'bg-blue-600 text-white' : isSunday ? 'text-red-600' : hasEvent ? 'text-neutral-900 hover:bg-blue-100' : 'text-neutral-900'
            }`}
        >
          {day}
          {hasEvent && <div className="absolute top-1 right-2 w-2 h-2 bg-red-600 rounded-full z-40" />}


          {hasEvent && (
            <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 w-48 z-[9999]">
              {dayEvents.slice(0, 3).map((ev) => (
                <div key={ev.id} className="text-xs mb-1.5 last:mb-0">
                  <div className="font-semibold text-neutral-900">{ev.time}</div>
                  <div className="text-neutral-700 truncate">{ev.title}</div>
                  <div className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${ev.type === 'online' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{ev.type === 'online' ? 'Online' : 'Offline'}</div>
                </div>
              ))}
              {dayEvents.length > 3 && <div className="text-xs text-blue-600 font-semibold mt-1">+{dayEvents.length - 3} lagi</div>}
            </div>
          )}
        </div>,
      );
    }

    return days;
  };

  if (loading) {
    return <LoadingState message="Memuat dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-neutral-50 -m-3 sm:-m-4 md:-m-6 p-3 sm:p-4 md:p-6 page-enter">
      <div className="space-y-4 sm:space-y-6">
        <div
          className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden animate-fade-in-up"
          style={{
            boxShadow: '0 8px 32px rgba(2,6,23,0.12)',
            background: 'linear-gradient(120deg, #1e3a8a 0%, #3b82f6 100%)',
          }}
        >

          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <div className="inline-block px-2.5 py-1 sm:px-3 bg-white/20 backdrop-blur-sm rounded-full text-caption font-medium mb-2 sm:mb-3">Dashboard GenBI Unsika</div>
              <h2 className="text-white text-title-lg mb-2 sm:mb-3 leading-tight">
                Selamat datang,
                <br className="sm:hidden" /> {userName}!
              </h2>
              <p className="text-blue-100 max-w-2xl text-subtitle">Berikut ringkasan aktivitas dan informasi penting untuk hari ini.</p>
            </div>
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl blur-xl" />
                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Users className="h-16 w-16 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div
            className="group rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 md:p-5 transition-all duration-300 hover-lift cursor-pointer card-enter stagger-1"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid rgb(229, 231, 235)',
            }}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-caption text-neutral-500 mb-0.5 sm:mb-1">Total Anggota</div>
            <div className="text-stat-sm text-neutral-900">{totalMembers}</div>
          </div>

          <div
            className="group rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 md:p-5 transition-all duration-300 hover-lift cursor-pointer card-enter stagger-2"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid rgb(229, 231, 235)',
            }}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-caption text-neutral-500 mb-0.5 sm:mb-1">Total Divisi</div>
            <div className="text-stat-sm text-neutral-900">{totalDivisions}</div>
          </div>

          <div
            className="group rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 md:p-5 transition-all duration-300 hover-lift cursor-pointer card-enter stagger-3"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid rgb(229, 231, 235)',
            }}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600" />
              </div>
            </div>
            <div className="text-caption text-neutral-500 mb-0.5 sm:mb-1">Upcoming Events</div>
            <div className="text-stat-sm text-neutral-900">{upcoming.length}</div>
          </div>

          <div
            className="group rounded-xl sm:rounded-2xl bg-white p-3 sm:p-4 md:p-5 transition-all duration-300 hover-lift cursor-pointer card-enter stagger-4"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid rgb(229, 231, 235)',
            }}
          >
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-caption text-neutral-500 mb-0.5 sm:mb-1">Kas Periode</div>
            <div className="text-stat-sm text-neutral-900">Rp {totalCollected.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div
            className="rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 bg-white lg:col-span-2 animate-fade-in-up stagger-5"
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid rgb(229, 231, 235)',
            }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="text-title-sm">Upcoming Events</h4>
            </div>
            {upcoming.length === 0 && <div className="text-neutral-500 text-center py-6 sm:py-8 text-body-sm">Tidak ada event mendatang.</div>}
            <div className="space-y-2 sm:space-y-3">
              {upcoming.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => handleEventClick(ev)}
                  className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl flex items-start gap-2.5 sm:gap-3 md:gap-4 hover:bg-blue-50/50 transition-all duration-200 transform-gpu hover:-translate-y-1 hover:shadow-md cursor-pointer group"
                  style={{ border: '1px solid rgb(243, 244, 246)' }}
                >
                  <div className="flex flex-col items-center justify-center bg-blue-50 group-hover:bg-blue-100 rounded-lg p-2 sm:p-3 min-w-[48px] sm:min-w-[64px] transition-colors">
                    <div className="text-caption-sm text-blue-600 font-medium uppercase">
                      {new Date(ev.date).toLocaleDateString('id-ID', {
                        month: 'short',
                      })}
                    </div>
                    <div className="text-stat-sm text-blue-700">{new Date(ev.date).getDate()}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-title-sm text-neutral-900 mb-0.5 sm:mb-1 line-clamp-2">{ev.title}</div>
                    <div className="text-caption text-neutral-600 flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-caption-sm font-medium ${ev.type === 'online' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                        {ev.type === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 animate-fade-in-up stagger-6">
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 bg-white hover-glow transition-shadow duration-300"
              style={{
                border: '1px solid rgb(219, 234, 254)',
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h4 className="text-title-sm">Kalender GenBI</h4>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button onClick={() => changeMonth(-1)} className="p-1.5 sm:p-1 hover:bg-blue-100 rounded transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => changeMonth(1)} className="p-1.5 sm:p-1 hover:bg-blue-100 rounded transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-lg sm:rounded-xl p-2.5 sm:p-4">
                <div className="text-center mb-3 sm:mb-4">
                  <div className="text-body font-semibold text-neutral-900">
                    {currentMonth.toLocaleDateString('id-ID', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className={`text-caption-sm font-medium text-center h-6 sm:h-8 flex items-center justify-center uppercase ${i === 0 ? 'text-red-400' : 'text-neutral-400'}`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2">{renderCalendar()}</div>
              </div>
            </div>

            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 bg-white hover-glow transition-shadow duration-300"
              style={{
                border: '1px solid rgb(229, 231, 235)',
              }}
            >
              <h4 className="text-title-sm mb-3 sm:mb-4 flex items-center gap-2">
                <Cake className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
                Upcoming Birthdays
              </h4>
              {upcomingBirthdays.length === 0 && <div className="text-neutral-500 text-body-sm text-center py-3 sm:py-4">Tidak ada ulang tahun mendatang.</div>}
              <div className="space-y-2 sm:space-y-3">
                {upcomingBirthdays.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer group">
                    <div className="flex-shrink-0">
                      <Avatar name={m.name} src={m.photo || m.photoUrl || ''} size={40} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body-sm font-medium text-neutral-900 truncate">{m.name}</div>
                      <div className="text-caption-sm text-neutral-500 truncate">{m.division || m.major}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-caption-sm font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${m.daysUntil === 0 ? 'bg-pink-100 text-pink-700' : 'bg-neutral-100 text-neutral-600'}`}>
                        {m.daysUntil === 0 ? 'Today!' : `${m.daysUntil}d`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
