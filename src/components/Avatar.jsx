export default function Avatar({ name='A', size=32, src='' }){
  const initials = String(name||'A').split(' ').slice(0,2).map(s=>s[0]).join('').toUpperCase()
  const s = { width:size, height:size }
  return (
    <div className="grid place-items-center rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700" style={s} aria-label={name}>
      {src ? <img src={src} alt={name} className="rounded-full" style={{width:size,height:size}}/> : <span className="text-xs">{initials}</span>}
    </div>
  )
}
