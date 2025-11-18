import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../utils/auth.js'
import { useToast } from '../components/Toast.jsx'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()
  const loc = useLocation()
  const toast = useToast()

  const submit = async (e)=>{
    e.preventDefault()
    if(!email || !password){
      toast.push('Email & password wajib diisi','warning')
      return
    }
    await login(email,password)
    toast.push('Login berhasil','success')
    const next = loc.state?.from?.pathname || '/'
    nav(next, { replace:true })
  }

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-50 p-5 md:p-8">
      <div className="w-full max-w-md card p-8">
        <h1 className="mb-2">Masuk</h1>
        <p className="text-sm text-neutral-600 mb-6">Portal GenBI Unsika</p>
        <form className="space-y-5" onSubmit={submit}>
          <label className="block">
            <span className="label">Email</span>
            <input className="input mt-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@kampus.ac.id" />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input className="input mt-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          <button type="submit" className="btn btn-primary w-full">Masuk</button>
        </form>
      </div>
    </div>
  )
}
