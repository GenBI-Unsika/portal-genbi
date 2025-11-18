import { useState } from 'react'
import { KEYS, getJSON, setJSON, uid } from '../lib/storage'
import { useToasts } from '../components/Toasts'

export default function Dispensasi(){
  const { push } = useToasts()
  const [items, setItems] = useState(() => getJSON(KEYS.DISPENSASI, []))
  const [form, setForm] = useState({ nama:'', npm:'', prodi:'', kegiatan:'', tanggal:'', alasan:'' })
  const submit = () => { if(!form.nama||!form.npm||!form.kegiatan||!form.tanggal) return push('Isi field wajib','warning'); const next=[...items,{id:uid(),...form,status:'Diajukan'}]; setItems(next); setJSON(KEYS.DISPENSASI,next); setForm({ nama:'', npm:'', prodi:'', kegiatan:'', tanggal:'', alasan:'' }); push('Pengajuan terkirim (local)','success') }
  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Surat Dispensasi (Client Form)</h3>
      <div className="card p-4 text-sm space-y-2 shadow-soft">
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block mb-1">Nama</label><input value={form.nama} onChange={e=>setForm(f=>({...f,nama:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
          <div><label className="block mb-1">NPM</label><input value={form.npm} onChange={e=>setForm(f=>({...f,npm:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="block mb-1">Prodi</label><input value={form.prodi} onChange={e=>setForm(f=>({...f,prodi:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
          <div><label className="block mb-1">Tanggal Kegiatan</label><input type="date" value={form.tanggal} onChange={e=>setForm(f=>({...f,tanggal:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
        </div>
        <div><label className="block mb-1">Nama Kegiatan</label><input value={form.kegiatan} onChange={e=>setForm(f=>({...f,kegiatan:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
        <div><label className="block mb-1">Alasan</label><textarea rows={3} value={form.alasan} onChange={e=>setForm(f=>({...f,alasan:e.target.value}))} className="w-full rounded-lg border border-neutral-200 px-3 py-2 focus-ring"/></div>
        <div className="flex items-center gap-2">
          <button onClick={submit} className="btn-primary">Kirim Pengajuan</button>
          <span className="text-neutral-500">*Data disimpan di perangkat Anda.</span>
        </div>
      </div>
    </div>
  )
}
