import { useEffect, useState } from 'react'
import { KEYS, getJSON, setJSON, uid } from '../lib/storage'
import { useToasts } from '../components/Toasts'

export default function Divisi(){
  const { push } = useToasts()
  const [divisi, setDivisi] = useState(() => getJSON(KEYS.DIVISI, [
    { id: uid(), nama:'Kominfo', proker:['Template Library','Live Report','Konten Literasi'] }
  ]))
  const [draft, setDraft] = useState({ nama:'', proker:'' })
  useEffect(()=> setJSON(KEYS.DIVISI, divisi), [divisi])

  const add = () => { if(!draft.nama) return push('Nama divisi wajib','warning'); const proker = draft.proker ? draft.proker.split(',').map(s=>s.trim()).filter(Boolean) : []; setDivisi(p=>[...p,{id:uid(),nama:draft.nama,proker}]); setDraft({nama:'',proker:''}); push('Divisi ditambahkan','success') }

  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Divisi GenBI & Program Kerja</h3>
      <div className="grid lg:grid-cols-[420px_1fr] gap-4">
        <div className="card p-4 text-sm space-y-2 shadow-soft">
          <div><label className="block mb-1">Nama Divisi</label><input value={draft.nama} onChange={e=>setDraft(d=>({...d,nama:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
          <div><label className="block mb-1">Daftar Proker (pisahkan koma)</label><input value={draft.proker} onChange={e=>setDraft(d=>({...d,proker:e.target.value}))} className="h-9 w-full rounded-lg border border-neutral-200 px-3 focus-ring"/></div>
          <button onClick={add} className="btn-primary">Tambah Divisi</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {divisi.map(d => (
            <div key={d.id} className="card p-4 shadow-soft">
              <div className="font-semibold text-neutral-900">{d.nama}</div>
              <ul className="mt-2 text-sm list-disc pl-5 text-neutral-700 space-y-1">
                {d.proker.map((p,idx)=>(<li key={idx}>{p}</li>))}
                {d.proker.length===0 && <li className="text-neutral-500 italic">Belum ada proker.</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
