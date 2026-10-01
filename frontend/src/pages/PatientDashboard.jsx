import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HeartPulse, Wind, Thermometer, Pill, Activity, CheckCircle, 
  Clock, ChevronRight, ClipboardList, TrendingDown, ArrowRight 
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import VitalCard from '../components/VitalCard'
import PatientInfoCard from '../components/PatientInfoCard'
import ConsentCard from '../components/ConsentCard'
import ConfirmModal from '../components/ConfirmModal'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { 
  getPatientDashboard, 
  grantConsent, 
  revokeConsent, 
  getErrorMessage,
  getCarePlan,
  logAdherence
} from '../services/api'
import { getSession } from '../services/session'

export default function PatientDashboard() {
  const session = getSession()
  const patientId = session?.patientId || 'sindhu-syn-000006'
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [carePlan, setCarePlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const firstLoad = useRef(true)

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  const load = useCallback(async () => {
    if (!patientId) return
    try {
      const [dashResult, planResult] = await Promise.all([
        getPatientDashboard(patientId).catch(() => null),
        getCarePlan(patientId).catch(() => null)
      ])
      if (dashResult) setData(dashResult)
      if (planResult) setCarePlan(planResult)
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
      showToast('Consent granted for clinical team access.')
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
      showToast('Consent access revoked.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleToggleMedication = async (medName, currentTaken) => {
    if (!carePlan) return
    const newStatus = !currentTaken
    try {
      const updated = await logAdherence(carePlan.carePlanId, {
        activityType: 'MEDICATION',
        itemName: medName,
        completed: newStatus,
        notes: newStatus ? `Dose administered at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Dose marked as missed'
      })
      setCarePlan(updated)
      showToast(newStatus ? `✓ Logged: ${medName} taken!` : `Marked ${medName} as pending.`)
    } catch (e) {
      showToast('Failed to record adherence.')
    }
  }

  const handleToggleActivity = async (title, currentStatus) => {
    if (!carePlan) return
    const newStatus = !currentStatus
    try {
      const updated = await logAdherence(carePlan.carePlanId, {
        activityType: 'EXERCISE',
        itemName: title,
        completed: newStatus,
        notes: newStatus ? `Completed daily session` : 'Session pending'
      })
      setCarePlan(updated)
      showToast(newStatus ? `✓ Exercise session logged!` : 'Session updated.')
    } catch (e) {
      showToast('Failed to record activity.')
    }
  }

  const patient = data?.patient || null
  const vitals = patient?.latestVitals || null
  const medications = carePlan?.medications || []
  const activities = carePlan?.lifestyleActivities || []
  const takenCount = medications.filter(m => m.takenToday).length

  return (
    <div className="app-shell">
      <Sidebar role="patient" />
      <div className="app-main">
        <Topbar eyebrow="Patient portal" title="My health dashboard" syncing={!loading && !error} />
        
        {toastMsg && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#047857',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '0.88rem'
          }}>
            <CheckCircle size={18} />
            {toastMsg}
          </div>
        )}

        <div className="app-content">
          {loading ? (
            <Loading label="Loading your personalized dashboard..." />
          ) : error && !data ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              {/* Header Greeting */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>
                    Hello, {patient?.name || 'Patient'}
                  </h1>
                  <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    Patient ID: <strong style={{ color: 'var(--navy)' }}>{patientId}</strong> &bull; Telemetry Connected
                  </span>
                </div>
                {carePlan && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    boxShadow: 'var(--shadow-card)'
                  }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Treatment Adherence:</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--green)' }}>
                      {carePlan.adherenceScore || 78.5}%
                    </span>
                  </div>
                )}
              </div>

              {/* Vitals Telemetry Row */}
              <div className="vitals-row" style={{ marginBottom: '24px' }}>
                <VitalCard icon={HeartPulse} label="Heart rate" value={vitals?.heartRate} unit="BPM" />
                <VitalCard icon={Wind} label="Oxygen saturation" value={vitals?.spo2} unit="%" />
                <VitalCard icon={Thermometer} label="Temperature" value={vitals?.temperature} unit="°C" />
              </div>

              {/* Main 2-Column Command Center Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                
                {/* Column 1: Today's Action Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Today's Prescriptions Check-off */}
                  <div className="panel" style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                          <Pill size={18} />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>Today's Medications</h2>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {takenCount} of {medications.length} doses logged today
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/patient/medicine')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--blue)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Full Schedule <ChevronRight size={14} />
                      </button>
                    </div>

                    {medications.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0', textAlign: 'center' }}>
                        No prescriptions scheduled for today.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {medications.map((med, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: med.takenToday ? 'var(--green-dim)' : '#f8fafc',
                              border: med.takenToday ? '1px solid #cdeadb' : '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy)' }}>
                                {med.medicationName} <span style={{ color: 'var(--blue)', fontSize: '0.82rem', fontWeight: 500 }}>{med.dosage}</span>
                              </div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {med.frequency} &bull; {med.route}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleMedication(med.medicationName, med.takenToday)}
                              style={{
                                background: med.takenToday ? 'var(--green)' : '#ffffff',
                                color: med.takenToday ? '#ffffff' : 'var(--navy)',
                                border: med.takenToday ? '1px solid var(--green)' : '1px solid var(--border)',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: med.takenToday ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            >
                              {med.takenToday ? (
                                <>
                                  <CheckCircle size={14} /> Taken
                                </>
                              ) : (
                                <>
                                  <Clock size={14} /> Mark Taken
                                </>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Today's Activity Check-off */}
                  <div className="panel" style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)' }}>
                          <Activity size={18} />
                        </div>
                        <div>
                          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>Daily Activity & Lifestyle</h2>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Conditioning & preventive targets
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/patient/exercise')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--green)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Exercise Log <ChevronRight size={14} />
                      </button>
                    </div>

                    {activities.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '16px 0', textAlign: 'center' }}>
                        No activity targets assigned.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activities.slice(0, 2).map((act, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '12px 16px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div style={{ maxWidth: '65%' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy)' }}>
                                {act.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {act.targetFrequency}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleActivity(act.title, act.completedToday)}
                              style={{
                                background: act.completedToday ? 'var(--green)' : '#ffffff',
                                color: act.completedToday ? '#ffffff' : 'var(--navy)',
                                border: act.completedToday ? '1px solid var(--green)' : '1px solid var(--border)',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {act.completedToday ? <><CheckCircle size={14} /> Completed</> : '+ Log Done'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Care Plan Progress Snapshot & Health Profile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Care Plan Progress Card */}
                  {carePlan && (
                    <div className="panel" style={{ borderTop: '3px solid var(--blue)', padding: '22px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ClipboardList size={18} color="var(--blue)" />
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Comprehensive Care Plan
                          </span>
                        </div>
                        <span style={{
                          background: 'var(--green-dim)',
                          color: 'var(--green)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700
                        }}>
                          {carePlan.status || 'ACTIVE'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', margin: '0 0 6px' }}>
                        {carePlan.title}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                        Attending Physician: <strong style={{ color: 'var(--navy)' }}>{carePlan.attendingPhysician || 'Dr. Robert Hayes, MD'}</strong>
                      </p>

                      {/* CVD Risk Drop Target Indicator */}
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Current CVD Risk</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#cf4444' }}>
                            {carePlan.baselineRiskPercentage || 24.3}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--green)' }}>
                          <TrendingDown size={20} />
                          <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            -{((carePlan.baselineRiskPercentage || 24.3) - (carePlan.targetRiskPercentage || 12.6)).toFixed(1)}%
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Target Post-Treatment</span>
                          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--green)' }}>
                            {carePlan.targetRiskPercentage || 12.6}%
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/patient/careplan')}
                        className="btn btn-primary btn-block"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        View Full Care Plan & Directives <ArrowRight size={15} />
                      </button>
                    </div>
                  )}

                  {/* Patient Clinical Info Card */}
                  <PatientInfoCard patient={patient} />

                  {/* Consent Card */}
                  <ConsentCard
                    consent={data?.consent}
                    busy={busy}
                    onGrant={handleGrant}
                    onRevokeClick={() => setConfirmOpen(true)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Revoke consent?"
        message="Are you sure you want to revoke access to your health data? This may affect your physician's ability to review your telemetry."
        confirmLabel="Revoke consent"
        busy={busy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  )
}
