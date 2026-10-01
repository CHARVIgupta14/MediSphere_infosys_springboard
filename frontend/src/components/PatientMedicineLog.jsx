import React, { useState, useEffect } from 'react'
import { Pill, CheckCircle, Clock, AlertCircle, Sparkles, Flame, ShieldAlert, History } from 'lucide-react'
import { getCarePlan, logAdherence } from '../services/api'

export default function PatientMedicineLog({ patientId }) {
  const [carePlan, setCarePlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [streak, setStreak] = useState(7)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  useEffect(() => {
    async function load() {
      if (!patientId) return
      try {
        setLoading(true)
        const plan = await getCarePlan(patientId)
        setCarePlan(plan)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [patientId])

  const handleToggleMed = async (medName, currentTaken) => {
    if (!carePlan) return
    const newStatus = !currentTaken
    try {
      const updated = await logAdherence(carePlan.carePlanId, {
        activityType: 'MEDICATION',
        itemName: medName,
        completed: newStatus,
        notes: newStatus ? `Administered at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Marked as unadministered'
      })
      setCarePlan(updated)
      showToast(newStatus ? `✓ Logged: ${medName} marked as TAKEN!` : `Updated: ${medName} marked as pending.`)
    } catch (err) {
      showToast('Failed to update medication log.')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <Clock size={24} className="spin" style={{ marginBottom: '10px' }} />
        <div>Loading your daily medication schedule...</div>
      </div>
    )
  }

  const meds = carePlan?.medications || []
  const takenCount = meds.filter(m => m.takenToday).length
  const totalCount = meds.length
  const adherencePct = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100

  // Filter recent medication adherence logs
  const medLogs = (carePlan?.adherenceLogs || []).filter(l => l.activityType === 'MEDICATION')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#047857',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} />
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '999px', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px' }}>
              <Pill size={14} />
              Personalized Prescription Schedule
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
              Daily Medication Tracker & Dose Schedule
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '4px 0 0' }}>
              Follow your prescribed pharmacotherapy regimen to achieve cardiovascular risk targets.
            </p>
          </div>

          {/* Streak Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 18px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={24} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>{streak} Days</div>
              <span style={{ fontSize: '0.74rem', color: '#b91c1c', fontWeight: 700 }}>Active Streak</span>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Today's Doses Taken</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', marginTop: '2px' }}>
              {takenCount} of {totalCount}
            </div>
            <span style={{ fontSize: '0.75rem', color: takenCount === totalCount ? '#15803d' : '#d97706', fontWeight: 700 }}>
              {takenCount === totalCount ? '✓ All doses logged for today' : 'Doses pending today'}
            </span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Medication Adherence</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563eb', marginTop: '2px' }}>
              {carePlan?.adherenceScore ? `${carePlan.adherenceScore.toFixed(0)}%` : `${adherencePct}%`}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Clinical target: &ge; 78%
            </span>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Primary Objective</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
              Plaque Stabilization & SBP Target
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ACC/AHA Guideline compliance
            </span>
          </div>
        </div>
      </div>

      {/* Medication Cards List */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={18} color="#2563eb" />
          Today's Prescribed Medicine Schedule
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {meds.map((med, idx) => (
            <div
              key={idx}
              style={{
                background: '#f8fafc',
                border: med.takenToday ? '1px solid #86efac' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '10px',
                  background: med.takenToday ? '#dcfce7' : '#eff6ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Pill size={22} color={med.takenToday ? '#15803d' : '#2563eb'} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy)' }}>
                      {med.medicationName}
                    </span>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {med.dosage}
                    </span>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.84rem', marginTop: '3px' }}>
                    <strong>Timing:</strong> {med.frequency} &bull; <strong>Route:</strong> {med.route}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '4px' }}>
                    <em>Clinical Indication: {med.indication}</em>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleToggleMed(med.medicationName, med.takenToday)}
                style={{
                  background: med.takenToday ? '#dcfce7' : '#2563eb',
                  color: med.takenToday ? '#166534' : '#ffffff',
                  border: med.takenToday ? '1px solid #86efac' : 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: med.takenToday ? 'none' : '0 2px 8px rgba(37,99,235,0.25)'
                }}
              >
                <CheckCircle size={16} />
                {med.takenToday ? '✓ Dose Taken (Undo)' : 'Mark as Taken'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Medication History */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={18} color="#2563eb" />
          Recent Dose Ingestion Log
        </h3>

        {medLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem', fontStyle: 'italic' }}>
            No recent medication log history recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {medLogs.slice(0, 5).map((log, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle size={14} color="#15803d" />
                  <span style={{ color: 'var(--navy)', fontWeight: 700 }}>{log.itemName}</span>
                  <span style={{ color: '#475569' }}>&bull; {log.notes}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
