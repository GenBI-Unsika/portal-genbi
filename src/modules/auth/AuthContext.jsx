
import React, { createContext, useContext, useEffect, useState } from 'react'
import { KEYS, getJSON, setJSON, removeKey } from '../../lib/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=> getJSON(KEYS.USER, null))
  const [token, setToken] = useState(()=> localStorage.getItem(KEYS.TOKEN))

  const login = (email) => {
    const t = crypto.randomUUID()
    localStorage.setItem(KEYS.TOKEN, t)
    const u = { email }
    setJSON(KEYS.USER, u)
    setUser(u); setToken(t)
  }
  const logout = () => {
    removeKey(KEYS.TOKEN); removeKey(KEYS.USER)
    setUser(null); setToken(null)
  }
  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
