import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radio, Users, Activity, UserPlus } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import PatientList from '../components/PatientList'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import AlertPanel from '../components/AlertPanel'
import AddPatientModal from '../components/AddPatientModal'
import { getDoctorDashboard, getErrorMessage } from '../services/api'

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)
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
                    <div className="summary-value">HL7 FHIR R4</div>
                    <div className="summary-label">Integrated EHR</div>
                  </div>
                </div>
              </div>

              {/* Real-Time Telemetry & Cardiologist Alert Engine */}
              <AlertPanel />

              <div className="panel">
                <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2>Patient Registry Overview</h2>
                    <span className="live-tag">
                      <span className="dot live" />
                      Live Stream
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setIsAddPatientOpen(true)}
                      style={{
                        background: 'var(--blue)',
                        border: 'none',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <UserPlus size={14} />
                      Add Patient
                    </button>
                    <button
                      onClick={() => navigate('/doctor/patients')}
                      style={{
                        background: 'var(--blue-dim)',
                        border: '1px solid var(--border)',
                        color: 'var(--blue)',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Open Full Directory ({patients.length}) →
                    </button>
                  </div>
                </div>
                <p className="panel-subtext">Click any patient to open their comprehensive 360° clinical profile and real-time telemetry.</p>
                <PatientList patients={patients} onSelect={(id) => navigate(`/doctor/patients/${id}`)} />
              </div>
            </>
          )}
        </div>
      </div>
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={() => loadList()}
      />
    </div>
  )
}
