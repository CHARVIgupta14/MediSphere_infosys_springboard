import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Filter, ArrowRight, Heart, Activity, AlertTriangle, ShieldCheck, ChevronRight, HeartPulse, Wind, Thermometer } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { getDoctorDashboard, getActiveAlerts, getErrorMessage } from '../services/api'

export default function DoctorPatientsPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRisk, setFilterRisk] = useState('ALL') // 'ALL', 'CRITICAL', 'ELEVATED', 'STABLE'
  const firstLoad = useRef(true)

  const loadData = useCallback(async () => {
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        getDoctorDashboard(),
        getActiveAlerts().catch(() => [])
      ])
      setPatients(patientsRes || [])
      setActiveAlerts(alertsRes || [])
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
    loadData()
    const interval = setInterval(loadData, 4000)
    return () => clearInterval(interval)
  }, [loadData])

  // Helper to categorize each patient
  const getPatientCategory = (patient) => {
    const hasActiveAlert = activeAlerts.some((a) => a.patientId === patient.patientId)
    const hr = patient.latestVitals?.heartRate
    const spo2 = patient.latestVitals?.spo2
    const hasTachycardia = hr && hr > 120
    const hasHypoxemia = spo2 && spo2 < 90

    if (hasActiveAlert || hasTachycardia || hasHypoxemia) {
      return 'CRITICAL'
    }

    const hasHypertension = (patient.conditions || []).some((c) =>
      c.toLowerCase().includes('hypertension')
    )
    const isElevatedVitals = hr && hr >= 95

    if (hasHypertension || isElevatedVitals) {
      return 'ELEVATED'
    }

    return 'STABLE'
  }

  const criticalPatients = patients.filter((p) => getPatientCategory(p) === 'CRITICAL')
  const elevatedPatients = patients.filter((p) => getPatientCategory(p) === 'ELEVATED')
  const stablePatients = patients.filter((p) => getPatientCategory(p) === 'STABLE')

  const filteredPatients = patients.filter((p) => {
    const nameMatch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const idMatch = (p.patientId || '').toLowerCase().includes(searchQuery.toLowerCase())
    const conditionMatch = (p.conditions || []).some((c) =>
      c.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const matchesSearch = nameMatch || idMatch || conditionMatch

    const category = getPatientCategory(p)
    if (filterRisk === 'CRITICAL') return matchesSearch && category === 'CRITICAL'
    if (filterRisk === 'ELEVATED') return matchesSearch && category === 'ELEVATED'
    if (filterRisk === 'STABLE') return matchesSearch && category === 'STABLE'

    return matchesSearch
  })

  return (
    <div className="app-shell">
      <Sidebar role="doctor" />
      <div className="app-main">
        <Topbar
          eyebrow="Clinical Registry & Patient Triage"
          title="Patient Directory"
          syncing={!loading && !error}
        />
        <div className="app-content">
          {loading ? (
            <Loading label="Loading patient registry and live telemetry..." />
          ) : error && patients.length === 0 ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              {/* Summary Cards */}
              <div className="summary-row" style={{ marginBottom: '20px' }}>
                <div className="summary-card">
                  <Users size={18} color="var(--blue)" />
                  <div>
                    <div className="summary-value">{patients.length}</div>
                    <div className="summary-label">Total Registered</div>
                  </div>
                </div>
                <div className="summary-card" style={{ borderColor: criticalPatients.length > 0 ? '#fca5a5' : undefined }}>
                  <Heart size={18} color="#dc2626" />
                  <div>
                    <div className="summary-value" style={{ color: criticalPatients.length > 0 ? '#dc2626' : undefined }}>
                      {criticalPatients.length} Active Crisis
                    </div>
                    <div className="summary-label">Tachycardia / Critical</div>
                  </div>
                </div>
                <div className="summary-card">
                  <Activity size={18} color="#d97706" />
                  <div>
                    <div className="summary-value" style={{ color: '#d97706' }}>
                      {elevatedPatients.length}
                    </div>
                    <div className="summary-label">Chronic / Elevated</div>
                  </div>
                </div>
                <div className="summary-card">
                  <ShieldCheck size={18} color="#16a34a" />
                  <div>
                    <div className="summary-value" style={{ color: '#16a34a' }}>
                      {stablePatients.length}
                    </div>
                    <div className="summary-label">Stable Resting</div>
                  </div>
                </div>
              </div>

              {/* Search and Category Filters */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    minWidth: '280px',
                    flex: '1'
                  }}
                >
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search by name, ID (e.g. P001, sindhu), or diagnosis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--navy)',
                      fontSize: '14px',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                    <Filter size={14} /> Stratification:
                  </span>
                  <button
                    onClick={() => setFilterRisk('ALL')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--border)',
                      background: filterRisk === 'ALL' ? 'var(--blue)' : '#f8fafc',
                      color: filterRisk === 'ALL' ? '#ffffff' : 'var(--navy)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All ({patients.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('CRITICAL')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: filterRisk === 'CRITICAL' ? '1px solid #dc2626' : '1px solid #fca5a5',
                      background: filterRisk === 'CRITICAL' ? '#dc2626' : '#fee2e2',
                      color: filterRisk === 'CRITICAL' ? '#ffffff' : '#b91c1c',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Critical ({criticalPatients.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('ELEVATED')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: filterRisk === 'ELEVATED' ? '1px solid #d97706' : '1px solid #fde68a',
                      background: filterRisk === 'ELEVATED' ? '#d97706' : '#fef3c7',
                      color: filterRisk === 'ELEVATED' ? '#ffffff' : '#92400e',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Elevated ({elevatedPatients.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('STABLE')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: filterRisk === 'STABLE' ? '1px solid #16a34a' : '1px solid #86efac',
                      background: filterRisk === 'STABLE' ? '#16a34a' : '#dcfce7',
                      color: filterRisk === 'STABLE' ? '#ffffff' : '#166534',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Stable ({stablePatients.length})
                  </button>
                </div>
              </div>

              {/* Patient Cards / Directory */}
              <div style={{ display: 'grid', gap: '12px' }}>
                {filteredPatients.length === 0 ? (
                  <div
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '12px',
                      color: '#94a3b8'
                    }}
                  >
                    <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0' }}>
                      No patients matching selected filter
                    </p>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      Try selecting "All" or adjusting your search query.
                    </p>
                  </div>
                ) : (
                  filteredPatients.map((patient) => {
                    const category = getPatientCategory(patient)
                    const isCritical = category === 'CRITICAL'
                    const isElevated = category === 'ELEVATED'

                    const hr = patient.latestVitals?.heartRate
                    const spo2 = patient.latestVitals?.spo2
                    const temp = patient.latestVitals?.temperature

                    const activeAlert = activeAlerts.find((a) => a.patientId === patient.patientId)

                    return (
                      <div
                        key={patient.patientId}
                        style={{
                          background: '#ffffff',
                          border: isCritical
                            ? '1px solid #fca5a5'
                            : isElevated
                            ? '1px solid #fde68a'
                            : '1px solid var(--border)',
                          borderLeft: `4px solid ${
                            isCritical ? '#dc2626' : isElevated ? '#d97706' : '#16a34a'
                          }`,
                          borderRadius: '10px',
                          padding: '16px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '16px',
                          boxShadow: 'var(--shadow-card)',
                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => navigate(`/doctor/patients/${patient.patientId}`)}
                      >
                        {/* Patient info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1', minWidth: '280px' }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '50%',
                              background: isCritical
                                ? '#fee2e2'
                                : isElevated
                                ? '#fef3c7'
                                : '#dcfce7',
                              color: isCritical ? '#dc2626' : isElevated ? '#d97706' : '#16a34a',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '16px',
                              flexShrink: 0
                            }}
                          >
                            {(patient.name || patient.patientId || 'P').charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--navy)' }}>
                                {patient.name || 'Anonymous Patient'}
                              </h3>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--navy)',
                                  background: '#f1f5f9',
                                  border: '1px solid var(--border)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontWeight: 600
                                }}
                              >
                                {patient.patientId}
                              </span>

                              {/* Status Tag */}
                              {isCritical && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    background: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fca5a5',
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {activeAlert ? activeAlert.thresholdViolated : 'Critical Tachycardia'}
                                </span>
                              )}
                              {isElevated && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    border: '1px solid #fde68a',
                                    padding: '3px 8px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Chronic Hypertension
                                </span>
                              )}
                              {!isCritical && !isElevated && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    background: '#dcfce7',
                                    color: '#166534',
                                    border: '1px solid #86efac',
                                    padding: '3px 8px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  Normal Telemetry
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                fontSize: '13px',
                                color: 'var(--text-muted)',
                                marginTop: '4px',
                                flexWrap: 'wrap'
                              }}
                            >
                              <span>
                                {patient.age ? `${patient.age} yrs` : 'Age N/A'} &bull; {patient.gender || 'Gender N/A'}
                              </span>
                              {patient.conditions && patient.conditions.length > 0 && (
                                <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                                  Diagnosis: {patient.conditions.join(', ')}
                                </span>
                              )}
                              {patient.medications && patient.medications.length > 0 && (
                                <span style={{ color: 'var(--text-muted)' }}>
                                  Rx: {patient.medications.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Live Vitals Preview */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          {/* Heart Rate */}
                          <div
                            style={{
                              background: '#f8fafc',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              minWidth: '100px'
                            }}
                          >
                            <Heart size={16} color={isCritical ? '#dc2626' : isElevated ? '#d97706' : '#16a34a'} />
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                HR (BPM)
                              </div>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: isCritical ? '#dc2626' : isElevated ? '#d97706' : 'var(--navy)'
                                }}
                              >
                                {hr ? `${hr} BPM` : '72 BPM'}
                              </div>
                            </div>
                          </div>

                          {/* SpO2 */}
                          <div
                            style={{
                              background: '#f8fafc',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              minWidth: '85px'
                            }}
                          >
                            <Wind size={16} color={spo2 && spo2 < 90 ? '#dc2626' : 'var(--blue)'} />
                            <div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                                SpO2
                              </div>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: spo2 && spo2 < 90 ? '#dc2626' : 'var(--navy)'
                                }}
                              >
                                {spo2 ? `${spo2}%` : '98%'}
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/doctor/risk-prediction?patientId=${patient.patientId}`)
                              }}
                              style={{
                                background: 'var(--blue-dim)',
                                border: '1px solid #c7d7f7',
                                color: 'var(--blue)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s ease'
                              }}
                              title="Inspect 10-year CVD risk assessment"
                            >
                              <HeartPulse size={14} />
                              Risk Stratification
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/doctor/patients/${patient.patientId}`)
                              }}
                              style={{
                                background: 'var(--blue)',
                                border: 'none',
                                color: '#ffffff',
                                padding: '8px 14px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Patient 360
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
