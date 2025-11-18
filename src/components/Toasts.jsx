
import React, { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)
export const useToasts = () => useContext(ToastCtx)

export default function ToastProvider({ children }){
  const [items, setItems] = useState([])
  const push = useCallback((message, type='info') => {
    const id = Math.random().toString(36).slice(2)
    setItems(t => [...t, { id, message, type }])
    setTimeout(()=> setItems(t => t.filter(x=>x.id!==id)), 2800)
  }, [])
  const remove = (id) => setItems(t => t.filter(x=>x.id!==id))

  const palette = {
    info: 'border-neutral-200 bg-white text-neutral-900',
    success: 'border-[rgb(var(--success-200))] bg-[rgb(var(--success-50))] text-[rgb(var(--success-700))]',
    warning: 'border-[rgb(var(--warning-200))] bg-[rgb(var(--warning-50))] text-[rgb(var(--warning-700))]',
    error: 'border-[rgb(var(--primary-200))] bg-[rgb(var(--primary-50))] text-[rgb(var(--primary-700))]',
  }

  return (
    <ToastCtx.Provider value={{ push, remove }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[320px] flex-col gap-2">
        {items.map(t => (
          <div key={t.id} className={`card shadow-soft-sm border ${palette[t.type]}`}>
            <div className="p-3 text-sm flex items-start justify-between gap-3">
              <div className="pr-1">{t.message}</div>
              <button className="btn-outline px-2 py-1" onClick={()=>remove(t.id)}>Tutup</button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
