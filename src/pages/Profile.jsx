import { useMemo, useState } from 'react'
import { getMe, setMe } from '../utils/auth.js'
import { useToast } from '../components/Toast.jsx'

const TABS = [
  { key:'akun', label:'Data Akun' },
  { key:'rekening', label:'Rekening' },
  { key:'akademik', label:'Akademik' },
  { key:'perpointan', label:'Perpointan' },
  { key:'uangkas', label:'Uang Kas' },
  { key:'dispensasi', label:'Surat Dispensasi' },
]

export default function Profile(){
  const toast = useToast()
  const [tab, setTab] = useState('akun')
  const [me, setLocalMe] = useState(()=> getMe())

  const saveAkun = (e)=>{
    e.preventDefault()
    setMe(me)
    toast.push('Profil diperbarui','success')
  }

  const Section = useMemo(()=>{
    if(tab==='akun') return (
      <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={saveAkun}>
        <label className="block">
          <span className="label">Nama</span>
          <input className="input mt-2" value={me.name||''} onChange={e=>setLocalMe({...me, name:e.target.value})} />
        </label>
        <label className="block">
          <span className="label">Email</span>
          <input className="input mt-2" type="email" value={me.email||''} onChange={e=>setLocalMe({...me, email:e.target.value})} />
        </label>
        <label className="block">
          <span className="label">No. HP</span>
          <input className="input mt-2" value={me.phone||''} onChange={e=>setLocalMe({...me, phone:e.target.value})} />
        </label>
        <label className="block">
          <span className="label">Fakultas</span>
          <input className="input mt-2" value={me.faculty||''} onChange={e=>setLocalMe({...me, faculty:e.target.value})} />
        </label>
        <label className="block md:col-span-2">
          <span className="label">Program Studi</span>
          <input className="input mt-2" value={me.study||''} onChange={e=>setLocalMe({...me, study:e.target.value})} />
        </label>
        <div className="md:col-span-2 flex items-center justify-end gap-2">
          <button type="reset" className="btn btn-quiet">Reset</button>
          <button type="submit" className="btn btn-primary">Simpan</button>
        </div>
      </form>
    )

    if(tab==='rekening') return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Info label="Nama Bank" value="Bank Indonesia (contoh)" />
        <Info label="No. Rekening" value="1234 5678 9012" />
        <Info label="Atas Nama" value={me.name||'-'} />
      </div>
    )

    if(tab==='akademik') return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Info label="NPM" value="2010631250000" />
        <Info label="Semester" value="7" />
        <Info label="IPK Terakhir" value="3.85" />
        <Info label="Status" value="Aktif" />
      </div>
    )

    if(tab==='perpointan') return (
      <div className="space-y-3">
        <Row l="Kehadiran Webinar" r="+40 pts" />
        <Row l="Panitia Event" r="+120 pts" />
        <Row l="Konten Kominfo" r="+60 pts" />
      </div>
    )

    if(tab==='uangkas') return (
      <div className="space-y-3">
        <Row l="Saldo Kas Per 30/09/2025" r="Rp 1.250.000" />
        <Row l="Iuran Bulanan (Okt)" r="Rp 20.000" />
      </div>
    )

    if(tab==='dispensasi') return (
      <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={(e)=>{e.preventDefault(); toast.push('Permohonan terkirim (dummy).','success')}}>
        <label className="block">
          <span className="label">Tanggal Kegiatan</span>
          <input className="input mt-2" type="date" required />
        </label>
        <label className="block">
          <span className="label">Divisi</span>
          <select className="input mt-2">
            <option>Kominfo</option>
            <option>PSDM</option>
            <option>Kewirausahaan</option>
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="label">Alasan</span>
          <textarea className="input mt-2" rows="4" placeholder="Tuliskan alasan singkat..." />
        </label>
        <div className="md:col-span-2 flex items-center justify-end">
          <button className="btn btn-primary">Kirim Permohonan</button>
        </div>
      </form>
    )

    return null
  },[tab, me, toast])

  return (
    <div className="space-y-4">
      <h1>Profile</h1>
      <div className="card">
        <div className="border-b border-neutral-200 px-4 md:px-6">
          <div className="flex flex-wrap gap-1.5">
            {TABS.map(t => (
              <button key={t.key} onClick={()=>setTab(t.key)}
                className={`px-4 py-3.5 text-sm font-semibold focus-ring
                  ${tab===t.key ? 'text-primary-700 border-b-2 border-primary-600' : 'text-neutral-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          {Section}
        </div>
      </div>
    </div>
  )
}

function Info({label, value}){
  return (
    <div className="rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4">
      <div className="text-xs text-neutral-600">{label}</div>
      <div className="mt-1 font-semibold text-neutral-900">{value}</div>
    </div>
  )
}
function Row({l, r}){
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-[rgb(255,255,255)] p-4">
      <div className="text-neutral-800">{l}</div>
      <div className="font-semibold text-neutral-900">{r}</div>
    </div>
  )
}
