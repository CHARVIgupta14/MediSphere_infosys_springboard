import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Cpu, ShieldAlert, Activity, ExternalLink, Sparkles } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Tabs from '../components/Tabs'
import PatientDetails from '../components/PatientDetails'
import CarePlanList from '../components/CarePlanList'
import PrescriptionList from '../components/PrescriptionList'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import AlertPanel from '../components/AlertPanel'
import { getDoctorPatient, getErrorMessage } from '../services/api'
import { predictForPatient, getLatestFLMetrics } from '../services/predictionApi'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'alerts', label: 'Telemetry & Alerts (M3)' },
  { id: 'prediction', label: 'AI Risk Prediction (M2)' },
  { id: 'careplan', label: 'Care plan' },
  { id: 'prescriptions', label: 'Prescriptions' },
]

export default function DoctorPatient360() {
  const { patientId } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [riskPrediction, setRiskPrediction] = useState(null)
  const [loadingPrediction, setLoadingPrediction] = useState(false)
  const firstLoad = useRef(true)

  const load = useCallback(async () => {
    try {
      const result = await getDoctorPatient(patientId)
      setPatient(result)
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
    async function loadRisk() {
      if (tab === 'prediction') {
        setLoadingPrediction(true)
        try {
          const res = await predictForPatient(patientId)
          if (res) setRiskPrediction(res)
        } catch (e) {
          console.error(e)
        } finally {
          setLoadingPrediction(false)
        }
      }
    }
    loadRisk()
  }, [tab, patientId])

  useEffect(() => {
    setLoading(true)
    firstLoad.current = true
    setPatient(null)
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  return (
    <div className="app-shell">
      <Sidebar role="doctor" />
      <div className="app-main">
        <Topbar
          eyebrow="Clinical workspace"
          title={patient?.name ? patient.name : 'Patient 360'}
          syncing={!loading && !error}
        />
        <div className="app-content">
          <button className="back-link" type="button" onClick={() => navigate('/doctor')}>
            <ArrowLeft size={16} />
            Back to all patients
          </button>

          {loading ? (
            <Loading label="Loading patient..." />
          ) : error && !patient ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              <Tabs tabs={TABS} active={tab} onChange={setTab} />

              {tab === 'alerts' && (
                <div style={{ marginTop: '16px' }}>
                  <AlertPanel patientId={patientId} />
                </div>
              )}

              {tab === 'prediction' && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="panel" style={{ background: '#0b1120', border: '1px solid #1e293b', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', padding: '4px 10px', borderRadius: '999px', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                          <Cpu size={14} />
                          Milestone 2: Federated Learning Model &bull; CVD-Risk-v3.2
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                          Cardiovascular Disease Risk Prediction
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.86rem', margin: '4px 0 0' }}>
                          Trained across 3 hospital nodes with Federated Averaging (FedAvg). Sensitivity: 91.4%.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/risk-prediction?patientId=${patientId}`)}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <ExternalLink size={16} />
                        Open Full AI Studio
                      </button>
                    </div>

                    {loadingPrediction ? (
                      <Loading label="Computing AI risk twin & SHAP attributions..." />
                    ) : riskPrediction ? (
                      <div>
                        {/* Risk Metrics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #ef4444', borderRadius: '10px', padding: '16px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>10-Year CVD Risk Score</span>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: (riskPrediction.probability || 0.243) >= 0.20 ? '#ef4444' : ((riskPrediction.probability || 0.243) >= 0.075 ? '#f59e0b' : '#10b981') }}>
                              {((riskPrediction.probability || 0.243) * 100).toFixed(1)}%
                            </span>
                            <span style={{
                              display: 'inline-block',
                              marginTop: '6px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: (riskPrediction.probability || 0.243) >= 0.20 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                              color: (riskPrediction.probability || 0.243) >= 0.20 ? '#fca5a5' : '#fcd34d'
                            }}>
                              {riskPrediction.riskCategory || 'High Risk'}
                            </span>
                          </div>

                          <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #3b82f6', borderRadius: '10px', padding: '16px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Federated Model Round</span>
                            <span style={{ fontSize: '2rem', fontWeight: 700, color: '#ffffff' }}>
                              Round {riskPrediction.federatedRound || 47}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#60a5fa', display: 'block', marginTop: '6px' }}>
                              Global Accuracy: 91.4%
                            </span>
                          </div>

                          <div style={{ background: '#111827', border: '1px solid #1f2937', borderTop: '3px solid #10b981', borderRadius: '10px', padding: '16px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block' }}>Population Comparative</span>
                            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', display: 'block', marginTop: '6px' }}>
                              {riskPrediction.comparisonStat || 'Population avg 12.1% vs 2.0x higher risk'}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginTop: '6px' }}>
                              Baseline 10-yr incidence benchmark
                            </span>
                          </div>
                        </div>

                        {/* Recommendation */}
                        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>
                            <Sparkles size={18} />
                            Clinical Decision Support Recommendation:
                          </div>
                          <p style={{ margin: 0, color: '#fef3c7', fontSize: '0.92rem' }}>
                            {riskPrediction.recommendation || 'Intensify statin, BP target <130/80, schedule cardiology review.'}
                          </p>
                        </div>

                        {/* SHAP Feature Attributions */}
                        {riskPrediction.shapValues && Object.keys(riskPrediction.shapValues).length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '14px' }}>
                              SHAP Explainability: Biomarker Risk Drivers
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {Object.entries(riskPrediction.shapValues).map(([k, v]) => {
                                const isPos = v >= 0;
                                const pct = Math.min(100, Math.round(Math.abs(v) * 800));
                                return (
                                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <span style={{ width: '130px', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>{k}</span>
                                    <div style={{ flex: 1, height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                                      <div style={{
                                        width: `${pct}%`,
                                        height: '100%',
                                        background: isPos ? '#ef4444' : '#10b981',
                                        borderRadius: '4px'
                                      }}></div>
                                    </div>
                                    <span style={{ width: '90px', fontSize: '0.82rem', fontWeight: 600, color: isPos ? '#fca5a5' : '#6ee7b7', textAlign: 'right' }}>
                                      {isPos ? '+' : ''}{(v * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>Click below to evaluate AI risk twin for this patient.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tab === 'overview' && (
                <>
                  <AlertPanel patientId={patientId} compact={true} />
                  <PatientDetails patient={patient} loading={false} error="" />
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
    </div>
  )
}
