import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Users, Activity } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import PatientList from '../components/PatientList'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { getDoctorDashboard, getErrorMessage } from '../services/api'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const firstLoad = useRef(true)

  const loadList = useCallback(async () => {
    try {
      const result = await getDoctorDashboard()
      setPatients(result || [])
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      if (firstLoad.current) {
        setLoading(false)
        firstLoad.current = false
      }
    }
  }, [])

  useEffect(() => {
    loadList()
    const interval = setInterval(loadList, 5000)
    return () => clearInterval(interval)
  }, [loadList])

  return (
    <div className="app-shell">
      <Sidebar role="doctor" />
      <div className="app-main">
        <Topbar eyebrow="Clinical workspace" title="Doctor dashboard" syncing={!loading && !error} />
        <div className="app-content">
          {loading ? (
            <Loading label="Loading patients..." />
          ) : error && patients.length === 0 ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              <div className="summary-row">
                <div className="summary-card">
                  <Users size={18} />
                  <div>
                    <div className="summary-value">{patients.length}</div>
                    <div className="summary-label">Total patients</div>
                  </div>
                </div>
                <div className="summary-card">
                  <Radio size={18} />
                  <div>
                    <div className="summary-value">Connected</div>
                    <div className="summary-label">Live data stream</div>
                  </div>
                </div>
                <div className="summary-card">
                  <Activity size={18} />
                  <div>
                    <div className="summary-value">FHIR + Kafka</div>
                    <div className="summary-label">System</div>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <h2>All patients</h2>
                  <span className="live-tag">
                    <span className="dot live" />
                    Live
                  </span>
                </div>
                <p className="panel-subtext">Click a patient to open their full Patient 360 dashboard.</p>
                <PatientList patients={patients} onSelect={(id) => navigate(`/doctor/patients/${id}`)} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
