import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext(null)

export default function ToastProvider({ children }){
  const [items, setItems] = useState([])

  const dismiss = useCallback((id)=> setItems(xs=>xs.filter(x=>x.id!==id)), [])
  const push = useCallback((message, type='info')=>{
    const id = Math.random().toString(36).slice(2)
    setItems(xs=>[...xs,{id,message,type}])
    setTimeout(()=>dismiss(id), 3200)
  },[dismiss])

  const api = useMemo(()=>({ push, dismiss }), [push, dismiss])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed right-4 bottom-4 z-[60] flex w-[360px] max-w-[92vw] flex-col gap-2">
        {items.map(t=>{
          const color = t.type==='success' ? 'border-[rgb(167,243,208)] bg-[rgb(236,253,245)] text-[rgb(4,120,87)]'
            : t.type==='warning' ? 'border-[rgb(253,230,138)] bg-[rgb(255,251,235)] text-[rgb(180,83,9)]'
            : t.type==='error' ? 'border-secondary-200 bg-secondary-50 text-secondary-700'
            : 'border-primary-200 bg-primary-50 text-primary-700'
          return (
            <div key={t.id} className={`flex items-start justify-between rounded-xl border px-4 py-2.5 text-sm ${color}`}>
              <div className="pr-2">{t.message}</div>
              <button onClick={()=>dismiss(t.id)} className="text-xs underline opacity-80 hover:opacity-100">Tutup</button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast(){
  return useContext(ToastCtx) || { push:()=>{}, dismiss:()=>{} }
}
