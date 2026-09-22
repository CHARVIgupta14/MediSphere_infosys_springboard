import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Filter, ArrowRight, Heart, Activity, AlertTriangle, ShieldCheck, ChevronRight, Cpu, Wind, Thermometer } from 'lucide-react'
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
            <Loading label="Loading patient registry and live telemetry from MongoDB Atlas..." />
          ) : error && patients.length === 0 ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              {/* Summary Cards */}
              <div className="summary-row" style={{ marginBottom: '20px' }}>
                <div className="summary-card">
                  <Users size={18} color="#38bdf8" />
                  <div>
                    <div className="summary-value">{patients.length}</div>
                    <div className="summary-label">Total Registered</div>
                  </div>
                </div>
                <div className="summary-card" style={{ borderColor: criticalPatients.length > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
                  <Heart size={18} color="#ef4444" />
                  <div>
                    <div className="summary-value" style={{ color: criticalPatients.length > 0 ? '#ef4444' : undefined }}>
                      {criticalPatients.length} Active Crisis
                    </div>
                    <div className="summary-label">Tachycardia / Alert</div>
                  </div>
                </div>
                <div className="summary-card">
                  <Activity size={18} color="#f59e0b" />
                  <div>
                    <div className="summary-value" style={{ color: '#f59e0b' }}>
                      {elevatedPatients.length}
                    </div>
                    <div className="summary-label">Chronic / Elevated</div>
                  </div>
                </div>
                <div className="summary-card">
                  <ShieldCheck size={18} color="#10b981" />
                  <div>
                    <div className="summary-value" style={{ color: '#10b981' }}>
                      {stablePatients.length}
                    </div>
                    <div className="summary-label">Stable Resting</div>
                  </div>
                </div>
              </div>

              {/* Search and Category Filters */}
              <div
                style={{
                  background: 'var(--panel-bg, #111a2e)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    minWidth: '280px',
                    flex: '1'
                  }}
                >
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search by name, ID (e.g. P001, sindhu), or diagnosis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
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
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={14} /> Stratification:
                  </span>
                  <button
                    onClick={() => setFilterRisk('ALL')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: filterRisk === 'ALL' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                      color: filterRisk === 'ALL' ? '#0f172a' : '#94a3b8'
                    }}
                  >
                    All ({patients.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('CRITICAL')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: filterRisk === 'CRITICAL' ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                      color: filterRisk === 'CRITICAL' ? '#ffffff' : '#f87171'
                    }}
                  >
                    🔴 Critical Crisis ({criticalPatients.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('ELEVATED')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: filterRisk === 'ELEVATED' ? '#f59e0b' : 'rgba(245, 158, 11, 0.1)',
                      color: filterRisk === 'ELEVATED' ? '#0f172a' : '#fbbf24'
                    }}
                  >
                    🟡 Chronic / Elevated ({elevatedPatients.length})
                  </button>
                  <button
                    onClick={() => setFilterRisk('STABLE')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                      background: filterRisk === 'STABLE' ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                      color: filterRisk === 'STABLE' ? '#ffffff' : '#34d399'
                    }}
                  >
                    🟢 Stable ({stablePatients.length})
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
                          background: isCritical
                            ? 'linear-gradient(145deg, #1b1322 0%, #20121d 100%)'
                            : 'linear-gradient(145deg, #0d1527 0%, #131c33 100%)',
                          border: isCritical
                            ? '1px solid rgba(239, 68, 68, 0.45)'
                            : isElevated
                            ? '1px solid rgba(245, 158, 11, 0.3)'
                            : '1px solid rgba(255, 255, 255, 0.08)',
                          borderLeft: `4px solid ${
                            isCritical ? '#ef4444' : isElevated ? '#f59e0b' : '#10b981'
                          }`,
                          borderRadius: '12px',
                          padding: '16px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '16px',
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
                                ? 'rgba(239, 68, 68, 0.2)'
                                : isElevated
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(16, 185, 129, 0.2)',
                              color: isCritical ? '#ef4444' : isElevated ? '#f59e0b' : '#10b981',
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
                              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>
                                {patient.name || 'Anonymous Patient'}
                              </h3>
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#94a3b8',
                                  background: 'rgba(255,255,255,0.06)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {patient.patientId}
                              </span>

                              {/* Status Tag */}
                              {isCritical && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    background: '#ef4444',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    textTransform: 'uppercase',
                                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
                                  }}
                                >
                                  {activeAlert ? activeAlert.thresholdViolated : 'Critical Tachycardia'}
                                </span>
                              )}
                              {isElevated && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    color: '#fbbf24',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                    padding: '2px 8px',
                                    borderRadius: '10px'
                                  }}
                                >
                                  Chronic Hypertension
                                </span>
                              )}
                              {!isCritical && !isElevated && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    color: '#34d399',
                                    padding: '2px 8px',
                                    borderRadius: '10px'
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
                                fontSize: '12px',
                                color: '#94a3b8',
                                marginTop: '4px',
                                flexWrap: 'wrap'
                              }}
                            >
                              <span>
                                {patient.age ? `${patient.age} yrs` : 'Age N/A'} • {patient.gender || 'Gender N/A'}
                              </span>
                              {patient.conditions && patient.conditions.length > 0 && (
                                <span style={{ color: '#cbd5e1' }}>
                                  Diagnosis: {patient.conditions.join(', ')}
                                </span>
                              )}
                              {patient.medications && patient.medications.length > 0 && (
                                <span style={{ color: '#94a3b8' }}>
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
                              background: 'rgba(255,255,255,0.03)',
                              border: isCritical
                                ? '1px solid rgba(239, 68, 68, 0.4)'
                                : isElevated
                                ? '1px solid rgba(245, 158, 11, 0.3)'
                                : '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              minWidth: '100px'
                            }}
                          >
                            <Heart size={16} color={isCritical ? '#ef4444' : isElevated ? '#f59e0b' : '#10b981'} />
                            <div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>
                                HR (BPM)
                              </div>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: isCritical ? '#ef4444' : isElevated ? '#fbbf24' : '#f8fafc'
                                }}
                              >
                                {hr ? `${hr} BPM` : '72 BPM'}
                              </div>
                            </div>
                          </div>

                          {/* SpO2 */}
                          <div
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              minWidth: '85px'
                            }}
                          >
                            <Wind size={16} color={spo2 && spo2 < 90 ? '#ef4444' : '#38bdf8'} />
                            <div>
                              <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>
                                SpO2
                              </div>
                              <div
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 700,
                                  color: spo2 && spo2 < 90 ? '#ef4444' : '#f8fafc'
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
                                navigate(`/risk-prediction?patientId=${patient.patientId}`)
                              }}
                              style={{
                                background: 'rgba(56, 189, 248, 0.12)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              title="Inspect CVD risk model & SHAP analysis"
                            >
                              <Cpu size={14} />
                              AI Risk
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/doctor/patients/${patient.patientId}`)
                              }}
                              style={{
                                background: '#38bdf8',
                                border: 'none',
                                color: '#0f172a',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
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
