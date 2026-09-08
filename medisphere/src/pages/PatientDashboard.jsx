import React, { useEffect, useState, useCallback, useRef } from 'react'
import { HeartPulse, Wind, Thermometer } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Tabs from '../components/Tabs'
import VitalCard from '../components/VitalCard'
import PatientInfoCard from '../components/PatientInfoCard'
import ConsentCard from '../components/ConsentCard'
import ConfirmModal from '../components/ConfirmModal'
import CarePlanList from '../components/CarePlanList'
import PrescriptionList from '../components/PrescriptionList'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { getPatientDashboard, grantConsent, revokeConsent, getErrorMessage } from '../services/api'
import { getSession } from '../services/session'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'careplan', label: 'Care plan' },
  { id: 'prescriptions', label: 'Prescriptions' },
]

export default function PatientDashboard() {
  const session = getSession()
  const patientId = session?.patientId

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState('overview')
  const firstLoad = useRef(true)

  const load = useCallback(async () => {
    if (!patientId) return
    try {
      const result = await getPatientDashboard(patientId)
      setData(result)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      if (firstLoad.current) {
        setLoading(false)
        firstLoad.current = false
      }
    }
  }, [patientId])

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  async function handleGrant() {
    setBusy(true)
    try {
      const consent = await grantConsent(patientId)
      setData((prev) => (prev ? { ...prev, consent } : prev))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleRevokeConfirm() {
    setBusy(true)
    try {
      const consent = await revokeConsent(patientId)
      setData((prev) => (prev ? { ...prev, consent } : prev))
      setConfirmOpen(false)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const patient = data?.patient || null
  const vitals = patient?.latestVitals || null

  return (
    <div className="app-shell">
      <Sidebar role="patient" />
      <div className="app-main">
        <Topbar eyebrow="Patient portal" title="My health dashboard" syncing={!loading && !error} />
        <div className="app-content">
          {loading ? (
            <Loading label="Loading dashboard..." />
          ) : error && !data ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              <p className="greeting">
                Hello, {patient?.name || 'Patient'}
                <span className="greeting-sub">Patient ID: {patientId}</span>
              </p>

              <Tabs tabs={TABS} active={tab} onChange={setTab} />

              {tab === 'overview' && (
                <>
                  <div className="vitals-row">
                    <VitalCard icon={HeartPulse} label="Heart rate" value={vitals?.heartRate} unit="BPM" />
                    <VitalCard icon={Wind} label="Oxygen saturation" value={vitals?.spo2} unit="%" />
                    <VitalCard icon={Thermometer} label="Temperature" value={vitals?.temperature} unit="°C" />
                  </div>

                  <div className="panel-grid">
                    <PatientInfoCard patient={patient} />
                    <ConsentCard
                      consent={data?.consent}
                      busy={busy}
                      onGrant={handleGrant}
                      onRevokeClick={() => setConfirmOpen(true)}
                    />
                  </div>
                </>
              )}

              {tab === 'careplan' && (
                <div className="panel">
                  <div className="panel-head">
                    <h2>Care plan</h2>
                  </div>
                  <CarePlanList conditions={patient?.conditions} />
                </div>
              )}

              {tab === 'prescriptions' && (
                <div className="panel">
                  <div className="panel-head">
                    <h2>Prescriptions</h2>
                  </div>
                  <PrescriptionList medications={patient?.medications} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Revoke consent?"
        message="Are you sure you want to revoke access to your health data? This may affect access to your protected health information."
        confirmLabel="Revoke consent"
        busy={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  )
}
