import React, { useState, useEffect } from 'react'
import { AlertTriangle, Bell, CheckCircle2, Heart, Activity, Stethoscope, Zap, RefreshCw, RotateCcw } from 'lucide-react'
import { getAlerts, acknowledgeAlert, resolveAlert, reactivateAlert, simulateAnomaly } from '../services/api'

export default function AlertPanel({ patientId = null, compact = false }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [actionFeedback, setActionFeedback] = useState('')

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts()
      if (patientId) {
        setAlerts(data.filter((a) => a.patientId === patientId))
      } else {
        setAlerts(data)
      }
    } catch (err) {
      console.error('Error loading alerts:', err)
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 4000)
    return () => clearInterval(interval)
  }, [patientId])

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert(alertId, 'Dr. Robert Hayes (Cardiologist)')
      setActionFeedback(`Alert #${alertId.slice(-6)} acknowledged by Cardiologist.`)
      setTimeout(() => setActionFeedback(''), 4000)
      fetchAlerts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleReactivate = async (alertId) => {
    try {
      await reactivateAlert(alertId)
      setActionFeedback(`Alert #${alertId.slice(-6)} restored to ACTIVE crisis status!`)
      setTimeout(() => setActionFeedback(''), 5000)
      fetchAlerts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId, 'Dr. Robert Hayes (Cardiologist)', 'Telemetry stabilized. Sinus rhythm restored.')
      setActionFeedback(`Alert #${alertId.slice(-6)} resolved.`)
      setTimeout(() => setActionFeedback(''), 4000)
      fetchAlerts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSimulate145BpmSpike = async (targetPatient = 'john-doe-001') => {
    setSimulating(true)
    try {
      const result = await simulateAnomaly(targetPatient, 145, 96.8, 37.1)
      setActionFeedback(`🚨 Emergency Spike Injected: ${result.patientName} HR jumped to 145 BPM! Cardiologist paged.`)
      setTimeout(() => setActionFeedback(''), 6000)
      fetchAlerts()
    } catch (err) {
      console.error(err)
    } finally {
      setSimulating(false)
    }
  }

  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE')

  return (
    <div className={`alert-panel-card ${compact ? 'compact' : ''}`} style={{
      background: 'linear-gradient(145deg, #0d1527 0%, #151f38 100%)',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.12)',
      color: '#f1f5f9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: activeAlerts.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: activeAlerts.length > 0 ? '#ef4444' : '#10b981',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={22} className={activeAlerts.length > 0 ? 'pulse-icon' : ''} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#38bdf8' }}>
              Milestone 3 • Real-Time Telemetry & Alerting Engine
            </div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Clinical Monitoring & Alerts
              {activeAlerts.length > 0 ? (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '20px',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)'
                }}>
                  {activeAlerts.length} Active Critical
                </span>
              ) : (
                <span style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  All Vitals Normal
                </span>
              )}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={fetchAlerts}
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Refresh alerts"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '14px',
          fontSize: '13px',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Activity size={16} />
          {actionFeedback}
        </div>
      )}

      <div style={{ display: 'grid', gap: '12px' }}>
        {alerts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            No alerts generated. Real-time vital streams are within safe bounds.
          </div>
        ) : (
          alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL'
            const isActive = alert.status === 'ACTIVE'
            const isAcknowledged = alert.status === 'ACKNOWLEDGED'

            return (
              <div
                key={alert.id}
                style={{
                  background: isActive
                    ? 'rgba(239, 68, 68, 0.08)'
                    : 'rgba(30, 41, 59, 0.5)',
                  border: isActive
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `4px solid ${
                    isActive ? '#ef4444' : isAcknowledged ? '#f59e0b' : '#10b981'
                  }`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: isCritical ? '#ef4444' : '#f59e0b',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {alert.severity}
                    </span>
                    <strong style={{ fontSize: '15px', color: '#f8fafc' }}>
                      {alert.patientName || alert.patientId}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      ({alert.patientId})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      background: isActive
                        ? 'rgba(239, 68, 68, 0.2)'
                        : isAcknowledged
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(16, 185, 129, 0.2)',
                      color: isActive
                        ? '#fca5a5'
                        : isAcknowledged
                        ? '#fcd34d'
                        : '#6ee7b7'
                    }}>
                      {alert.status}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Heart size={15} color="#ef4444" />
                    <span style={{ color: '#cbd5e1' }}>Telemetry Reading:</span>
                    <strong style={{ color: '#ef4444', fontSize: '15px' }}>
                      {alert.vitalValue} {alert.vitalType === 'HEART_RATE' ? 'BPM' : alert.vitalType === 'SPO2' ? '%' : '°C'}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      ({alert.thresholdViolated})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Stethoscope size={15} color="#38bdf8" />
                    <span style={{ color: '#cbd5e1' }}>Notified Specialist:</span>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                      {alert.doctorNotified || alert.recipientRole}
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.4' }}>
                  {alert.message}
                </p>

                {alert.recommendedAction && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#93c5fd',
                    borderLeft: '3px solid #38bdf8'
                  }}>
                    <strong>Clinical Protocol:</strong> {alert.recommendedAction}
                  </div>
                )}

                {alert.acknowledgedBy && (
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                    ✓ Acknowledged by <strong>{alert.acknowledgedBy}</strong> at{' '}
                    {new Date(alert.acknowledgedAt || alert.timestamp).toLocaleTimeString()}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {isActive && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      style={{
                        background: '#f59e0b',
                        color: '#0f172a',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={13} />
                      Acknowledge Alert (Cardiologist)
                    </button>
                  )}
                  {isAcknowledged && (
                    <button
                      onClick={() => handleReactivate(alert.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Undo accidental acknowledgment and restore alert to ACTIVE status"
                    >
                      <RotateCcw size={13} />
                      Undo / Re-open as ACTIVE
                    </button>
                  )}
                  {(isActive || isAcknowledged) && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {alert.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleReactivate(alert.id)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <RotateCcw size={13} />
                      Re-open Alert
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
