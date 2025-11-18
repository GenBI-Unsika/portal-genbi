import { Link } from 'react-router-dom';
import { CalendarDays, Trophy, UserRound, ExternalLink, Users } from 'lucide-react';
import membersData from '../lib/members';
import EVENTS from '../lib/events';

function flattenMembers(sample) {
  return Object.keys(sample).flatMap((k) => sample[k].map((m) => ({ ...m, divisionKey: k })));
}

export default function Home() {
  const divisions = membersData.divisions || [];
  const members = flattenMembers(membersData.sampleMembers || {});
  const totalMembers = members.length;
  const totalDivisions = divisions.length;

  const today = new Date();
  const upcoming = EVENTS.map((e) => ({ ...e, dateObj: new Date(e.date) }))
    .filter((e) => e.dateObj >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => a.dateObj - b.dateObj)
    .slice(0, 5);

  const latestMembers = members
    .slice()
    .sort((a, b) => (b.cohort || 0) - (a.cohort || 0))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1>Dashboard</h1>
        <div className="text-sm text-neutral-600">Ringkasan cepat aktivitas dan data organisasi</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">Total Anggota</div>
              <div className="text-2xl font-semibold">{totalMembers}</div>
            </div>
            <Users className="h-8 w-8 text-primary-700" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">Total Divisi</div>
              <div className="text-2xl font-semibold">{totalDivisions}</div>
            </div>
            <CalendarDays className="h-8 w-8 text-primary-700" />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">Upcoming Events</div>
              <div className="text-2xl font-semibold">{upcoming.length}</div>
            </div>
            <Trophy className="h-8 w-8 text-primary-700" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutral-200 p-4 bg-white lg:col-span-2">
          <h4 className="font-semibold mb-3">Upcoming Events</h4>
          {upcoming.length === 0 && <div className="text-neutral-500">Tidak ada event mendatang.</div>}
          <div className="space-y-3">
            {upcoming.map((ev) => (
              <div key={ev.id} className="p-3 rounded-md border border-neutral-100 flex items-start gap-3 hover:bg-neutral-50 transition-colors">
                <div className="text-sm font-semibold text-neutral-900" style={{ minWidth: 96 }}>
                  {new Date(ev.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-sm text-neutral-600">
                    {ev.time} · {ev.location} · {ev.type === 'online' ? 'Online' : 'Offline'}
                  </div>
                </div>
                <div className="text-xs text-neutral-500">{ev.color}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
          <h4 className="font-semibold mb-3">Anggota Terbaru</h4>
          {latestMembers.length === 0 && <div className="text-neutral-500">Belum ada anggota.</div>}
          <div className="space-y-3">
            {latestMembers.map((m, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-semibold text-neutral-600">
                  {(m.name || '')
                    .split(' ')
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-sm text-neutral-500">{m.jabatan || m.major || m.division}</div>
                </div>
                <div className="text-xs text-neutral-500">{m.cohort || '-'}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <Link to="/divisi" className="text-sm text-primary-700 inline-flex items-center gap-1">
              Lihat semua <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
