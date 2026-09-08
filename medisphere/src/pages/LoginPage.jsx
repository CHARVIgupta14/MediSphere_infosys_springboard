import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getErrorMessage } from '../services/api'
import { setSession } from '../services/session'

export default function LoginPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('patient')

  const [patientId, setPatientId] = useState('')
  const [password, setPassword] = useState('')

  const [doctorUsername, setDoctorUsername] = useState('')
  const [doctorPassword, setDoctorPassword] = useState('')

  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function switchTab(next) {
    setTab(next)
    setError('')
  }

  async function handlePatientSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data = await login(patientId, password)
      setSession({ role: 'patient', patientId: data.patientId })
      navigate('/patient')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  function handleDoctorSubmit(e) {
    e.preventDefault()
    setError('')
    if (doctorUsername === 'doctor' && doctorPassword === '1234') {
      setSession({ role: 'doctor' })
      navigate('/doctor')
    } else {
      setError('Invalid doctor username or password')
    }
  }

  return (
    <div className="login-page">
      <div className="login-intro">
        <div className="login-brand">
          <span className="brand-mark large">MS</span>
          <div>
            <div className="brand-name">MediSphere</div>
            <div className="brand-tagline">Connected Care</div>
          </div>
        </div>
        <h1>One connected view of the patient.</h1>
        <p className="login-flow">FHIR → Patient Twin → Kafka → MongoDB</p>
      </div>

      <div className="login-card-wrap">
        <div className="login-card">
          <h2>Sign in</h2>

          <div className="tab-switch">
            <button type="button" className={tab === 'patient' ? 'active' : ''} onClick={() => switchTab('patient')}>
              Patient
            </button>
            <button type="button" className={tab === 'doctor' ? 'active' : ''} onClick={() => switchTab('doctor')}>
              Doctor
            </button>
          </div>

          {tab === 'patient' ? (
            <form onSubmit={handlePatientSubmit}>
              <label>
                Patient ID
                <input
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="sindhu-syn-000006"
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
                {busy ? 'Signing in...' : 'Sign in →'}
              </button>
              <p className="demo-hint">Demo: sindhu-syn-000006 / 1234</p>
            </form>
          ) : (
            <form onSubmit={handleDoctorSubmit}>
              <label>
                Username
                <input
                  value={doctorUsername}
                  onChange={(e) => setDoctorUsername(e.target.value)}
                  placeholder="doctor"
                  autoComplete="username"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={doctorPassword}
                  onChange={(e) => setDoctorPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="btn btn-primary btn-block" type="submit">
                Sign in →
              </button>
              <p className="demo-hint">Demo doctor login — not production security. Username: doctor, Password: 1234</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
