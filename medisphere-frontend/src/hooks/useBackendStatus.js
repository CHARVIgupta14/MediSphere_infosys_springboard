import { useEffect, useState } from 'react'
import api from '../services/api'

export function useBackendStatus() {
  const [status, setStatus] = useState('checking') // checking | connected | disconnected

  useEffect(() => {
    let cancelled = false

    api
      .get('/api/patients')
      .then(() => {
        if (!cancelled) setStatus('connected')
      })
      .catch(() => {
        if (!cancelled) setStatus('disconnected')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return status
}
