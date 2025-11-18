import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Avatar from '../components/Avatar';
import { KEYS, getJSON } from '../lib/storage';
import { Search } from 'lucide-react';

const seed = [
  {
    nama: 'Alya Putri',
    prodi: 'SI',
    skor: 120,
    logs: [
      { tanggal: '2025-02-01', kategori: 'Event', mode: 'offline', skor: 15 },
      { tanggal: '2025-02-15', kategori: 'Rapat', mode: 'online', skor: 5 },
    ],
  },
  { nama: 'Bima Adi', prodi: 'TI', skor: 98, logs: [{ tanggal: '2025-02-03', kategori: 'Event', mode: 'offline', skor: 12 }] },
  { nama: 'Citra Lestari', prodi: 'IK', skor: 135, logs: [{ tanggal: '2025-01-30', kategori: 'Pelatihan', mode: 'offline', skor: 20 }] },
  { nama: 'Dimas A.', prodi: 'SI', skor: 80, logs: [] },
  { nama: 'Eka R.', prodi: 'TI', skor: 104, logs: [] },
  { nama: 'Farhan', prodi: 'SI', skor: 112, logs: [] },
  { nama: 'Ghina', prodi: 'IK', skor: 75, logs: [] },
  { nama: 'Hasan', prodi: 'SI', skor: 125, logs: [] },
];
if (!getJSON(KEYS.RANK)) localStorage.setItem(KEYS.RANK, JSON.stringify(seed));

export default function Peringkat() {
  const [q, setQ] = useState('');
  const data = getJSON(KEYS.RANK, seed);
  const filtered = useMemo(() => data.filter((d) => `${d.nama} ${d.prodi}`.toLowerCase().includes(q.trim().toLowerCase())), [q, data]);
  const top = useMemo(() => [...data].sort((a, b) => b.skor - a.skor).slice(0, 8), [data]);

  return (
    <div className="space-y-4">
      <h3>Peringkat</h3>

      <div className="card p-4 shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-neutral-700">Top 8</div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama/prodi" className="h-9 w-56 rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm outline-none placeholder:text-neutral-400 focus-ring" />
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <XAxis dataKey="nama" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={50} />
              <YAxis width={35} />
              <Tooltip />
              <Bar dataKey="skor" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-4 shadow-soft overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left text-neutral-600">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Anggota</th>
              <th className="px-3 py-2">Prodi</th>
              <th className="px-3 py-2">Skor</th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .sort((a, b) => b.skor - a.skor)
              .map((r, idx) => (
                <tr key={r.nama} className="border-t border-neutral-200">
                  <td className="px-3 py-2 w-[50px]">{idx + 1}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.nama} size={28} />
                      <span className="font-medium">{r.nama}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-neutral-600">{r.prodi}</td>
                  <td className="px-3 py-2 font-semibold">{r.skor}</td>
                </tr>
              ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-neutral-500" colSpan={4}>
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
