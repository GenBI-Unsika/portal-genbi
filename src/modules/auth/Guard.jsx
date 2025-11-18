
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { KEYS } from '../../lib/storage'

export default function Guard({ children }){
  const { token } = useAuth()
  const loc = useLocation()
  if(!token){
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return children
}
