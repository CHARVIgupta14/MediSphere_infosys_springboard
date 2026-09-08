import React from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ErrorMessage({ message }) {
  return (
    <div className="error-state">
      <AlertTriangle size={20} />
      <p>{message}</p>
    </div>
  )
}
