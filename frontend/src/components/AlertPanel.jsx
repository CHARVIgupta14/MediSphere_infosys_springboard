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
      background: '#ffffff',
      border: activeAlerts.length > 0 ? '1px solid #fca5a5' : '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px',
      boxShadow: 'var(--shadow-card)',
      color: 'var(--navy)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: activeAlerts.length > 0 ? '#fee2e2' : '#dcfce7',
            color: activeAlerts.length > 0 ? '#dc2626' : '#16a34a',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={20} className={activeAlerts.length > 0 ? 'pulse-icon' : ''} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--blue)' }}>
              Cardiac Telemetry & Clinical Alert Engine
            </div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy)' }}>
              Clinical Monitoring & Alerts
              {activeAlerts.length > 0 ? (
                <span style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fca5a5',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {activeAlerts.length} Active Critical
                </span>
              ) : (
                <span style={{
                  background: '#dcfce7',
                  color: '#166534',
                  border: '1px solid #86efac',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px'
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
              background: '#f8fafc',
              color: 'var(--navy)',
              border: '1px solid var(--border)',
              padding: '7px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 500
            }}
            title="Refresh alerts"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '8px 12px',
          marginBottom: '14px',
          fontSize: '13px',
          color: 'var(--blue)',
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
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
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
                  background: isActive ? '#fffbfa' : '#f8fafc',
                  border: isActive
                    ? '1px solid #fca5a5'
                    : isAcknowledged
                    ? '1px solid #fde68a'
                    : '1px solid var(--border)',
                  borderLeft: `4px solid ${
                    isActive ? '#dc2626' : isAcknowledged ? '#d97706' : '#16a34a'
                  }`,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  boxShadow: isActive ? '0 1px 3px rgba(220,38,38,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      background: isCritical ? '#dc2626' : '#d97706',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {alert.severity}
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--navy)' }}>
                      {alert.patientName || alert.patientId}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ({alert.patientId})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      background: isActive
                        ? '#fee2e2'
                        : isAcknowledged
                        ? '#fef3c7'
                        : '#dcfce7',
                      color: isActive
                        ? '#b91c1c'
                        : isAcknowledged
                        ? '#92400e'
                        : '#166534',
                      border: isActive
                        ? '1px solid #fca5a5'
                        : isAcknowledged
                        ? '1px solid #fde68a'
                        : '1px solid #86efac'
                    }}>
                      {alert.status}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Heart size={15} color="#dc2626" />
                    <span style={{ color: 'var(--text-muted)' }}>Telemetry Reading:</span>
                    <strong style={{ color: '#dc2626', fontSize: '15px' }}>
                      {alert.vitalValue} {alert.vitalType === 'HEART_RATE' ? 'BPM' : alert.vitalType === 'SPO2' ? '%' : '°C'}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ({alert.thresholdViolated})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Stethoscope size={15} color="var(--blue)" />
                    <span style={{ color: 'var(--text-muted)' }}>Notified Specialist:</span>
                    <span style={{ color: 'var(--blue)', fontWeight: 600 }}>
                      {alert.doctorNotified || alert.recipientRole}
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--text)', lineHeight: '1.4' }}>
                  {alert.message}
                </p>

                {alert.recommendedAction && (
                  <div style={{
                    background: '#eff6ff',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#1e40af',
                    borderLeft: '3px solid var(--blue)'
                  }}>
                    <strong>Clinical Protocol:</strong> {alert.recommendedAction}
                  </div>
                )}

                {alert.acknowledgedBy && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    ✓ Acknowledged by <strong>{alert.acknowledgedBy}</strong> at{' '}
                    {new Date(alert.acknowledgedAt || alert.timestamp).toLocaleTimeString()}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {isActive && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      style={{
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 1px 2px rgba(217,119,6,0.2)'
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
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
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
                        background: '#dcfce7',
                        color: '#166534',
                        border: '1px solid #86efac',
                        padding: '6px 14px',
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
                        background: 'var(--blue-dim)',
                        color: 'var(--blue)',
                        border: '1px solid #c7d7f7',
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
