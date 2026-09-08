import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
