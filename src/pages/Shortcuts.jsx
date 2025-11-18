import { useEffect, useState } from 'react'
import { KEYS, getJSON, setJSON, uid } from '../lib/storage'
import { useToasts } from '../components/Toasts'

const DEFAULT_LINKS = [
  { id: uid(), nama:'Form Request Upload Sosmed', url:'#' },
  { id: uid(), nama:'Template Feed & Story', url:'#' },
  { id: uid(), nama:'Template Live Report', url:'#' },
  { id: uid(), nama:'Folder Dokumentasi', url:'#' },
  { id: uid(), nama:'Rules Upload Konten', url:'#' },
]

export default function Shortcuts(){
  const { push } = useToasts()
  const [links, setLinks] = useState(() => getJSON(KEYS.SHORTCUTS, DEFAULT_LINKS))
  const [draft, setDraft] = useState({ nama:'', url:'' })
  useEffect(()=> setJSON(KEYS.SHORTCUTS, links), [links])
  const add = () => { if(!draft.nama||!draft.url) return push('Isi nama & URL','warning'); setLinks(p=>[...p,{id:uid(),...draft}]); setDraft({nama:'',url:''}); push('Shortcut ditambahkan','success') }
  const del = (id) => { setLinks(p=>p.filter(x=>x.id!==id)); push('Shortcut dihapus','info') }

  const [book, setBook] = useState(() => getJSON(KEYS.BOOKING, []))
  const [slot, setSlot] = useState({ tanggal:'', divisi:'', catatan:'' })
  useEffect(()=> setJSON(KEYS.BOOKING, book), [book])
  const addSlot = () => { if(!slot.tanggal||!slot.divisi) return push('Isi tanggal & divisi','warning'); const exists = book.some(b=>b.tanggal===slot.tanggal); if(exists) return push('Tanggal sudah dibooking divisi lain','error'); setBook(p=>[...p,{id:uid(),...slot}]); setSlot({ tanggal:'', divisi:'', catatan:'' }); push('Tanggal dibooking','success') }
  const delSlot = (id) => { setBook(p=>p.filter(x=>x.id!==id)); push('Booking dibatalkan','info') }

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-4">
      <div className="card p-4 shadow-soft">
        <h4 className="font-semibold text-neutral-900 mb-3">Tambah Shortcut</h4>
        <div className="text-sm space-y-2">
          <div><label className="block mb-1">Nama</label><input value={draft.nama} onChange={e=>setDraft(d=>({...d,nama:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
          <div><label className="block mb-1">URL</label><input value={draft.url} onChange={e=>setDraft(d=>({...d,url:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring" placeholder="https://..."/></div>
          <button onClick={add} className="btn-primary">Tambah</button>
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 p-4">
          <h4 className="font-semibold text-neutral-900 mb-3">Cek Booking Tanggal Upload</h4>
          <div className="text-sm space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block mb-1">Tanggal</label><input type="date" value={slot.tanggal} onChange={e=>setSlot(s=>({...s,tanggal:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
              <div><label className="block mb-1">Divisi</label><input value={slot.divisi} onChange={e=>setSlot(s=>({...s,divisi:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
            </div>
            <div><label className="block mb-1">Catatan</label><input value={slot.catatan} onChange={e=>setSlot(s=>({...s,catatan:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
            <button onClick={addSlot} className="btn-primary">Booking</button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
          <h4 className="font-semibold text-neutral-900 mb-3">Daftar Shortcut</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {links.map(l => (
              <a key={l.id} href={l.url} target="_blank" className="card p-3 card-hover">
                <div className="font-medium text-neutral-900">{l.nama}</div>
                <div className="text-xs text-neutral-500 break-all">{l.url}</div>
                <div className="mt-2 text-right">
                  <button onClick={(e)=>{e.preventDefault(); del(l.id)}} className="text-xs px-2 py-1 rounded-md border border-neutral-200 hover:bg-neutral-50 focus-ring">Hapus</button>
                </div>
              </a>
            ))}
            {links.length===0 && <div className="text-neutral-500 text-sm">Belum ada shortcut.</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-4 bg-white">
          <h4 className="font-semibold text-neutral-900 mb-3">Jadwal Booking Tanggal</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50"><tr className="text-left text-neutral-600"><th className="px-3 py-2">Tanggal</th><th className="px-3 py-2">Divisi</th><th className="px-3 py-2">Catatan</th><th className="px-3 py-2 text-right">Aksi</th></tr></thead>
              <tbody>
                {book.map(b => (<tr key={b.id} className="border-t border-neutral-200"><td className="px-3 py-2">{b.tanggal}</td><td className="px-3 py-2">{b.divisi}</td><td className="px-3 py-2">{b.catatan}</td><td className="px-3 py-2 text-right"><button onClick={()=>delSlot(b.id)} className="text-sm px-2 py-1 rounded-md border border-neutral-200 hover:bg-neutral-50">Hapus</button></td></tr>))}
                {book.length===0 && <tr><td className="px-3 py-6 text-center text-neutral-500" colSpan={4}>Belum ada booking.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
