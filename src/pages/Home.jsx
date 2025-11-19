import {
  CalendarDays,
  Trophy,
  Users,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Cake,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const membersData = {
  divisions: ["Divisi A", "Divisi B", "Divisi C", "Divisi D"],
  sampleMembers: {
    "divisi-a": [
      {
        name: "Ahmad Zaki",
        cohort: 2023,
        major: "Informatika",
        birthday: "1998-11-25",
        division: "Kominfo",
      },
      {
        name: "Siti Nurhaliza",
        cohort: 2023,
        major: "Sistem Informasi",
        birthday: "1999-11-20",
        division: "Kominfo",
      },
    ],
    "divisi-b": [
      {
        name: "Budi Santoso",
        cohort: 2022,
        major: "Teknik Komputer",
        birthday: "1998-12-15",
        division: "Lingkungan Hidup",
      },
      {
        name: "Dewi Lestari",
        cohort: 2024,
        major: "Informatika",
        birthday: "2000-11-22",
        division: "Lingkungan Hidup",
      },
    ],
    "divisi-c": [
      {
        name: "Eko Prasetyo",
        cohort: 2023,
        major: "Data Science",
        birthday: "1999-11-28",
        division: "Pendidikan",
      },
      {
        name: "Fitri Handayani",
        cohort: 2024,
        major: "Cyber Security",
        birthday: "2000-11-19",
        division: "Kewirausahaan",
      },
    ],
  },
};

const EVENTS = [
  {
    id: 1,
    title: "Workshop React Dasar",
    date: "2025-11-25",
    time: "14:00",
    location: "Lab A",
    type: "offline",
  },
  {
    id: 2,
    title: "Mini Hackathon Internal",
    date: "2025-11-28",
    time: "09:00",
    location: "Online",
    type: "online",
  },
  {
    id: 3,
    title: "Rapat Bulanan",
    date: "2025-12-05",
    time: "16:00",
    location: "Ruang Rapat",
    type: "offline",
  },
  {
    id: 4,
    title: "Workshop Python Lanjutan",
    date: "2025-12-10",
    time: "13:00",
    location: "Lab B",
    type: "offline",
  },
  {
    id: 5,
    title: "Team Building",
    date: "2025-12-15",
    time: "10:00",
    location: "Outdoor",
    type: "offline",
  },
  {
    id: 6,
    title: "Rapat Koordinasi Bulanan",
    date: "2025-11-03",
    time: "09:00",
    location: "Ruang Rapat Lt.3",
    type: "offline",
  },
  {
    id: 7,
    title: "Workshop Fotografi",
    date: "2025-11-03",
    time: "14:00",
    location: "Studio GenBI",
    type: "offline",
  },
  {
    id: 8,
    title: "Webinar Literasi Digital",
    date: "2025-11-07",
    time: "19:00",
    location: "Zoom Meeting",
    type: "online",
  },
  {
    id: 9,
    title: "Pelatihan Konten Kreatif",
    date: "2025-11-12",
    time: "13:00",
    location: "Lab Multimedia",
    type: "offline",
  },
  {
    id: 10,
    title: "Diskusi Strategi Media Sosial",
    date: "2025-11-15",
    time: "15:30",
    location: "Google Meet",
    type: "online",
  },
];

const userName = "Arabella Chloe";

const monthlyFee = 50000;
const totalCollected = 8500000;
const collectionRate = 85;

function flattenMembers(sample) {
  return Object.keys(sample).flatMap((k) =>
    sample[k].map((m) => ({ ...m, divisionKey: k }))
  );
}

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const divisions = membersData.divisions || [];
  const members = flattenMembers(membersData.sampleMembers || {});
  const totalMembers = members.length;
  const totalDivisions = divisions.length;

  const today = new Date();
  const upcoming = EVENTS.map((e) => ({ ...e, dateObj: new Date(e.date) }))
    .filter(
      (e) =>
        e.dateObj >=
        new Date(today.getFullYear(), today.getMonth(), today.getDate())
    )
    .sort((a, b) => a.dateObj - b.dateObj)
    .slice(0, 5);

  const upcomingBirthdays = members
    .filter((m) => m.birthday)
    .map((m) => {
      const bday = new Date(m.birthday);
      const thisYearBday = new Date(
        today.getFullYear(),
        bday.getMonth(),
        bday.getDate()
      );
      if (thisYearBday < today) {
        thisYearBday.setFullYear(today.getFullYear() + 1);
      }
      const daysUntil = Math.ceil(
        (thisYearBday - today) / (1000 * 60 * 60 * 24)
      );
      return { ...m, birthdayDate: thisYearBday, daysUntil };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 4);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (direction) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1
      )
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear();

      const dateObj = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const dateStr = dateObj.toISOString().slice(0, 10);
      const dayOfWeek = dateObj.getDay();
      const isSunday = dayOfWeek === 0;

      const dayEvents = EVENTS.filter((e) => e.date === dateStr);
      const hasEvent = dayEvents.length > 0;

      days.push(
        <div
          key={day}
          className={`h-10 w-10 flex items-center justify-center rounded-full transition-all cursor-pointer group relative mx-auto font-semibold text-xs ${
            isToday
              ? "bg-blue-600 text-white"
              : isSunday
              ? "text-red-600"
              : hasEvent
              ? "text-neutral-900 hover:bg-blue-100"
              : "text-neutral-900"
          }`}
        >
          {day}
          {hasEvent && (
            <div className="absolute top-1 right-2 w-2 h-2 bg-red-600 rounded-full z-40" />
          )}

          {/* Events - hanya muncul saat hover */}
          {hasEvent && (
            <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-2 w-48 z-[9999]">
              {dayEvents.slice(0, 3).map((ev) => (
                <div key={ev.id} className="text-xs mb-1.5 last:mb-0">
                  <div className="font-semibold text-neutral-900">
                    {ev.time}
                  </div>
                  <div className="text-neutral-700 truncate">{ev.title}</div>
                  <div
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${
                      ev.type === "online"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {ev.type === "online" ? "Online" : "Offline"}
                  </div>
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-blue-600 font-semibold mt-1">
                  +{dayEvents.length - 3} lagi
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div
          className="rounded-2xl p-6 text-white"
          style={{
            boxShadow: "0 4px 18px rgba(2,6,23,0.08)",
            background: "linear-gradient(90deg,#0b67c3 0%,#0052a5 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-2">
                Selamat datang, Rangga Mukti!
              </h2>
              <p className="text-blue-100 max-w-xl">
                Berikut ringkasan aktivitas dan informasi penting untuk hari
                ini.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="group rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform-gpu hover:scale-[1.02] cursor-pointer"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid rgb(229, 231, 235)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-neutral-500 mb-1">Total Anggota</div>
            <div className="text-3xl font-bold text-neutral-900">
              {totalMembers}
            </div>
          </div>

          <div
            className="group rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform-gpu hover:scale-[1.02] cursor-pointer"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid rgb(229, 231, 235)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
                <CalendarDays className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-neutral-500 mb-1">Total Divisi</div>
            <div className="text-3xl font-bold text-neutral-900">
              {totalDivisions}
            </div>
          </div>

          <div
            className="group rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform-gpu hover:scale-[1.02] cursor-pointer"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid rgb(229, 231, 235)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-amber-50 group-hover:bg-amber-100 transition-colors">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="text-sm text-neutral-500 mb-1">Upcoming Events</div>
            <div className="text-3xl font-bold text-neutral-900">
              {upcoming.length}
            </div>
          </div>

          <div
            className="group rounded-2xl bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg transform-gpu hover:scale-[1.02] cursor-pointer"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid rgb(229, 231, 235)",
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-sm text-neutral-500 mb-1">Kas Periode</div>
            <div className="text-3xl font-bold text-neutral-900">
              Rp {totalCollected.toLocaleString("id-ID")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            className="rounded-2xl p-5 bg-white lg:col-span-2"
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid rgb(229, 231, 235)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">Upcoming Events</h4>
            </div>
            {upcoming.length === 0 && (
              <div className="text-neutral-500 text-center py-8">
                Tidak ada event mendatang.
              </div>
            )}
            <div className="space-y-3">
              {upcoming.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl flex items-start gap-4 hover:bg-neutral-50 transition-transform duration-200 transform-gpu hover:-translate-y-1 hover:shadow-md cursor-pointer group"
                  style={{ border: "1px solid rgb(243, 244, 246)" }}
                >
                  <div className="flex flex-col items-center justify-center bg-blue-50 group-hover:bg-blue-100 rounded-lg p-3 min-w-[64px] transition-colors">
                    <div className="text-xs text-blue-600 font-medium uppercase">
                      {new Date(ev.date).toLocaleDateString("id-ID", {
                        month: "short",
                      })}
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {new Date(ev.date).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900 mb-1">
                      {ev.title}
                    </div>
                    <div className="text-sm text-neutral-600 flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ev.type === "online"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {ev.type === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div
              className="rounded-2xl p-5 bg-white"
              style={{
                border: "1px solid rgb(219, 234, 254)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Kalender GenBI Unsika</h4>
                <div className="flex  items-center gap-2">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-1 hover:bg-blue-100 rounded transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-blue-50/50 rounded-xl p-4">
                <div className="text-center mb-4">
                  <div className="text-sm font-semibold text-neutral-900">
                    {currentMonth.toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div
                      key={i}
                      className={`text-xs font-medium text-center h-8 flex items-center justify-center uppercase ${
                        i === 0 ? "text-red-400" : "text-neutral-400"
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
              </div>
            </div>

            <div
              className="rounded-2xl p-5 bg-white"
              style={{
                border: "1px solid rgb(229, 231, 235)",
              }}
            >
              <h4 className="font-semibold mb-4 text-lg flex items-center gap-2">
                <Cake className="h-5 w-5 text-pink-500" />
                Upcoming Birthdays
              </h4>
              {upcomingBirthdays.length === 0 && (
                <div className="text-neutral-500 text-sm text-center py-4">
                  Tidak ada ulang tahun mendatang.
                </div>
              )}
              <div className="space-y-3">
                {upcomingBirthdays.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-pink-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-sm font-bold text-white">
                      {(m.name || "")
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-neutral-900">
                        {m.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {m.division || m.major}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          m.daysUntil === 0
                            ? "bg-pink-100 text-pink-700"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {m.daysUntil === 0 ? "Today!" : `${m.daysUntil}d`}
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
