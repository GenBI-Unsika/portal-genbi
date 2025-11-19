import { useMemo, useState, useEffect } from "react";
import Avatar from "../components/Avatar.jsx";
import { ChevronRight, Trophy, TrendingUp, Calendar, X } from "lucide-react";

const MEMBERS = [
  {
    id: "m1",
    name: "Devi Fitriani",
    points: 320,
    online: 8,
    offline: 6,
    activities: [
      { date: "2025-11-15", name: "Webinar GenBI", type: "online", points: 12 },
      {
        date: "2025-11-10",
        name: "GENBI Mengajar",
        type: "offline",
        points: 10,
      },
      {
        date: "2025-11-05",
        name: "Raker Triwulan",
        type: "offline",
        points: 12,
      },
      {
        date: "2025-10-28",
        name: "GENBI Literasi",
        type: "offline",
        points: 9,
      },
      { date: "2025-10-20", name: "Webinar WJES", type: "online", points: 7 },
    ],
  },
  {
    id: "m2",
    name: "Adeeva Caria",
    points: 280,
    online: 10,
    offline: 3,
    activities: [
      {
        date: "2025-11-16",
        name: "Capacity Building",
        type: "offline",
        points: 10,
      },
      { date: "2025-11-12", name: "GENBI Study", type: "online", points: 7 },
      {
        date: "2025-11-08",
        name: "Sertifikasi Online",
        type: "online",
        points: 7,
      },
      {
        date: "2025-10-30",
        name: "Field Trip CerLing",
        type: "offline",
        points: 8,
      },
    ],
  },
  {
    id: "m3",
    name: "Ahad Fayroz",
    points: 240,
    online: 6,
    offline: 4,
    activities: [
      { date: "2025-11-14", name: "GENBI Kasih", type: "offline", points: 10 },
      { date: "2025-11-06", name: "GenBI News", type: "online", points: 9 },
      { date: "2025-10-25", name: "KUMIS Event", type: "offline", points: 13 },
    ],
  },
  {
    id: "m4",
    name: "Rangga Mukti",
    points: 210,
    online: 5,
    offline: 4,
    activities: [
      {
        date: "2025-11-13",
        name: "BI Goes to Campus",
        type: "offline",
        points: 12,
      },
      { date: "2025-11-02", name: "Webinar WJIS", type: "online", points: 12 },
      { date: "2025-10-22", name: "SEDARAH Event", type: "offline", points: 9 },
    ],
  },
  {
    id: "m5",
    name: "Anya Kusuma",
    points: 190,
    online: 7,
    offline: 1,
    activities: [
      { date: "2025-11-11", name: "GENBI Edukasi", type: "online", points: 7 },
      { date: "2025-11-01", name: "Gen Expo", type: "offline", points: 13 },
      { date: "2025-10-18", name: "Repost Konten", type: "online", points: 6 },
    ],
  },
];

export default function Leaderboard() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // small delay so progress bars animate from 0 -> target on first paint
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);
  const sorted = useMemo(
    () => MEMBERS.slice().sort((a, b) => b.points - a.points),
    []
  );
  const max = sorted[0]?.points || 1;

  const getRankBadge = (idx) => {
    if (idx === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (idx === 1) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (idx === 2) return <Trophy className="w-5 h-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Leaderboard & Tracker Poin</h1>

        {/* close button placed inline in header (not absolute) */}
        {selectedMember && (
          <div className="inline-flex items-center">
            <div className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1.5 text-sm text-neutral-700 shadow-sm">
              <button
                onClick={() => setSelectedMember(null)}
                className="flex items-center gap-1.5 cursor-pointer"
                aria-label="Tutup detail anggota"
              >
                <X className="w-4 h-4" />
                Tutup Detail
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-neutral-600 font-medium">
                Top Performer
              </div>
              <div className="font-semibold text-neutral-900">
                {sorted[0]?.name}
              </div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary-600" />
            </div>
            <div>
              <div className="text-sm text-neutral-600 font-medium">
                Rata-rata Poin
              </div>
              <div className="font-semibold text-neutral-900">
                {Math.round(
                  sorted.reduce((sum, m) => sum + m.points, 0) / sorted.length
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <div className="text-sm text-neutral-600 font-medium">
                Total Anggota
              </div>
              <div className="font-semibold text-neutral-900">
                {MEMBERS.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`grid gap-4 transition-all ${
          selectedMember ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Leaderboard */}
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Peringkat Anggota</h2>
          <ol className="divide-y divide-neutral-200">
            {sorted.map((m, idx) => {
              const pct = Math.round((m.points / max) * 100);
              const isSelected = selectedMember?.id === m.id;

              return (
                <li
                  key={m.id}
                  className={`py-3.5 flex items-center gap-3.5 cursor-pointer hover:bg-neutral-50 -mx-5 px-5 transform hover:scale-[1.01] active:scale-[0.995] ${
                    isSelected ? "bg-primary-50 hover:bg-primary-50" : ""
                  } transition-smooth`}
                  onClick={() => setSelectedMember(m)}
                >
                  <div className="w-8 flex items-center justify-center text-neutral-600 font-semibold">
                    {getRankBadge(idx) || (
                      <span className="text-neutral-700">{idx + 1}.</span>
                    )}
                  </div>
                  <Avatar name={m.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-neutral-900 truncate">
                        {m.name}
                      </div>
                      <div className="text-sm font-semibold text-primary-600 ml-2">
                        {m.points} pts
                      </div>
                    </div>
                    <div
                      className="progress h-2 bg-neutral-100 rounded-full overflow-hidden"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={pct}
                    >
                      <span
                        className="block h-full bg-gradient-to-r from-primary-400 to-primary-600"
                        style={{ width: mounted ? pct + "%" : "0%" }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-600">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        Online {m.online}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-700">
                        Offline {m.offline}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ease-out ${
                          isSelected ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Tracker Detail Panel */}
        {selectedMember && (
          <div className="card p-5 space-y-4 animate-slide-fade">
            <div>
              <h2 className="text-lg font-semibold mb-1">
                Detail Tracker Poin
              </h2>
              <p className="text-sm text-neutral-600">
                Riwayat aktivitas dan perolehan poin
              </p>
            </div>

            {/* Member Profile */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg">
              <Avatar name={selectedMember.name} size={56} />
              <div className="flex-1">
                <div className="font-semibold text-lg text-neutral-900">
                  {selectedMember.name}
                </div>
                <div className="text-sm text-neutral-600 mt-0.5">
                  Peringkat{" "}
                  <span className="font-semibold">
                    {sorted.findIndex((m) => m.id === selectedMember.id) + 1}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold text-primary-600">
                  {selectedMember.points}
                </div>
                <div className="text-xs text-neutral-600">Total Poin</div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-semibold text-secondary-600">
                  {selectedMember.online}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  Kegiatan Online
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-semibold text-accent-600">
                  {selectedMember.offline}
                </div>
                <div className="text-xs text-neutral-600 mt-1">
                  Kegiatan Offline
                </div>
              </div>
            </div>

            {/* Activity History */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                Riwayat Kegiatan
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {selectedMember.activities.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors transform hover:translate-x-1 duration-150"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-medium text-sm text-neutral-900 flex-1">
                        {act.name}
                      </div>
                      <div className="font-semibold text-sm text-primary-600 whitespace-nowrap">
                        +{act.points} pts
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-600">
                      <Calendar className="w-3 h-3" />
                      <span>{act.date}</span>
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-full ${
                          act.type === "online"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {act.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
