import React from 'react'
import { Navigate } from 'react-router-dom'
import { getSession } from '../services/session'

export default function ProtectedRoute({ requiredRole, children }) {
  const session = getSession()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (session.role !== requiredRole) {
    return <Navigate to={session.role === 'doctor' ? '/doctor' : '/patient'} replace />
  }

  return children
}
