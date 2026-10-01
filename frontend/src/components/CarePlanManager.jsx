import React, { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList,
  HeartPulse,
  Sliders,
  Pill,
  Activity,
  Heart,
  TrendingDown,
  CheckCircle,
  Clock,
  ShieldCheck,
  FileCode,
  RefreshCw,
  Send,
  AlertTriangle,
  Flame,
  Award,
  ChevronRight,
  Database,
  Save,
  Plus,
  Trash2,
  X
} from 'lucide-react'
import {
  getCarePlan,
  simulateWhatIf,
  logAdherence,
  syncCarePlanToFhir,
  generateCarePlan,
  getCarePlanFhirJson,
  updateCarePlan,
  addCarePlanMedication,
  removeCarePlanMedication
} from '../services/api'

export default function CarePlanManager({ patientId, isDoctor = true }) {
  const [carePlan, setCarePlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncingFhir, setSyncingFhir] = useState(false)
  const [showFhirModal, setShowFhirModal] = useState(false)
  const [fhirJson, setFhirJson] = useState('')
  const [loadingFhirJson, setLoadingFhirJson] = useState(false)
  const [doctorNotes, setDoctorNotes] = useState('')
  const [recomputing, setRecomputing] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [actionToast, setActionToast] = useState('')

  // Prescribing modal state (doctor only)
  const [showAddMedModal, setShowAddMedModal] = useState(false)
  const [newMedName, setNewMedName] = useState('')
  const [newMedDosage, setNewMedDosage] = useState('')
  const [newMedFrequency, setNewMedFrequency] = useState('Once daily at bedtime (PO QHS)')
  const [newMedRoute, setNewMedRoute] = useState('Oral')
  const [newMedIndication, setNewMedIndication] = useState('')
  const [submittingMed, setSubmittingMed] = useState(false)

  const showNotification = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(''), 4500)
  }
  const [simBp, setSimBp] = useState(15) // delta -15 mmHg
  const [simSmoking, setSimSmoking] = useState(true) // quit smoking
  const [simLdl, setSimLdl] = useState(40) // delta -40 mg/dL
  const [simHba1c, setSimHba1c] = useState(1.0) // delta -1.0%
  const [simExercise, setSimExercise] = useState(150) // 150 min/wk
  const [simResult, setSimResult] = useState(null)
  const [simulating, setSimulating] = useState(false)

  const loadCarePlanData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getCarePlan(patientId)
      setCarePlan(data)
      if (data?.attendingDoctorNotes) {
        setDoctorNotes(data.attendingDoctorNotes)
      }
      setError('')
    } catch (err) {
      setError('Failed to load care plan for patient.')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    loadCarePlanData()
  }, [loadCarePlanData])

  // Run What-If simulation when parameters change (doctor only)
  const runSimulation = useCallback(async () => {
    if (!isDoctor) return
    setSimulating(true)
    try {
      const res = await simulateWhatIf({
        patientId,
        deltaSystolicBp: simBp,
        stopSmoking: simSmoking,
        deltaLdl: simLdl,
        deltaHba1c: simHba1c,
        weeklyExerciseMinutes: simExercise
      })
      setSimResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setSimulating(false)
    }
  }, [patientId, simBp, simSmoking, simLdl, simHba1c, simExercise, isDoctor])

  useEffect(() => {
    if (isDoctor) {
      runSimulation()
    }
  }, [runSimulation, isDoctor])

  const handleToggleMedicationAdherence = async (medName, currentStatus) => {
    if (!carePlan) return
    const newStatus = !currentStatus
    try {
      const updated = await logAdherence(carePlan.carePlanId, {
        activityType: 'MEDICATION',
        itemName: medName,
        completed: newStatus,
        notes: newStatus ? `Dose administered on schedule` : 'Dose missed / withheld'
      })
      setCarePlan(updated)
      showNotification(`Medication logged: ${medName} marked as ${newStatus ? 'TAKEN' : 'MISSED'}.`)
    } catch (e) {
      showNotification('Failed to update medication adherence.')
    }
  }

  const handleToggleActivityAdherence = async (activityTitle, currentStatus) => {
    if (!carePlan) return
    const newStatus = !currentStatus
    try {
      const updated = await logAdherence(carePlan.carePlanId, {
        activityType: 'EXERCISE',
        itemName: activityTitle,
        completed: newStatus,
        notes: newStatus ? `Completed daily session` : 'Session not completed'
      })
      setCarePlan(updated)
      showNotification(`Activity updated: ${activityTitle} adherence logged.`)
    } catch (e) {
      showNotification('Failed to update activity adherence.')
    }
  }

  const handleSyncFhir = async () => {
    if (!carePlan) return
    setSyncingFhir(true)
    try {
      const synced = await syncCarePlanToFhir(carePlan.carePlanId)
      setCarePlan(synced)
      showNotification('CarePlan successfully written back and synced to FHIR R4 EHR server.')
    } catch (e) {
      showNotification('Error syncing to FHIR server.')
    } finally {
      setSyncingFhir(false)
    }
  }

  const handleOpenFhirJson = async () => {
    if (!carePlan) return
    setShowFhirModal(true)
    setLoadingFhirJson(true)
    try {
      const json = await getCarePlanFhirJson(carePlan.carePlanId)
      setFhirJson(json)
    } catch (e) {
      setFhirJson(JSON.stringify({ error: 'Failed to retrieve FHIR JSON' }, null, 2))
    } finally {
      setLoadingFhirJson(false)
    }
  }

  const handleRegenerateCarePlan = async () => {
    setRecomputing(true)
    try {
      const fresh = await generateCarePlan(patientId, {
        doctorNotes,
        attendingPhysician: carePlan?.attendingPhysician || 'Dr. Robert Hayes, MD (Cardiology)'
      })
      setCarePlan(fresh)
      showNotification('Personalized Clinical Care Plan formulated successfully!')
    } catch (e) {
      showNotification('Failed to regenerate care plan.')
    } finally {
      setRecomputing(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!carePlan) return
    setSavingNotes(true)
    try {
      const updated = await updateCarePlan(carePlan.carePlanId, {
        attendingDoctorNotes: doctorNotes
      })
      setCarePlan(updated)
      showNotification('Clinical directives & prescribing orders saved.')
    } catch (e) {
      showNotification('Failed to save directives.')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleAddMedicationSubmit = async (e) => {
    e.preventDefault()
    if (!carePlan || !newMedName.trim() || !newMedDosage.trim()) return
    setSubmittingMed(true)
    try {
      const updated = await addCarePlanMedication(carePlan.carePlanId, {
        medicationName: newMedName.trim(),
        dosage: newMedDosage.trim(),
        frequency: newMedFrequency.trim(),
        route: newMedRoute,
        indication: newMedIndication.trim() || 'Guideline-directed medical therapy',
        status: 'ACTIVE'
      })
      setCarePlan(updated)
      showNotification(`Prescription added: ${newMedName} (${newMedDosage}) prescribed and saved to Care Plan.`)
      setShowAddMedModal(false)
      setNewMedName('')
      setNewMedDosage('')
      setNewMedIndication('')
    } catch (err) {
      showNotification('Failed to add prescription.')
    } finally {
      setSubmittingMed(false)
    }
  }

  const handleRemoveMedication = async (medName) => {
    if (!carePlan) return
    const ok = window.confirm(`Discontinue and remove ${medName} from this patient's care plan regimen?`)
    if (!ok) return
    try {
      const updated = await removeCarePlanMedication(carePlan.carePlanId, medName)
      setCarePlan(updated)
      showNotification(`Prescription discontinued: ${medName} removed from regimen.`)
    } catch (err) {
      showNotification('Failed to discontinue prescription.')
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
        <RefreshCw size={24} className="spin" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
        <div>Formulating Clinical Care Plan & loading guidelines...</div>
      </div>
    )
  }

  if (error || !carePlan) {
    return (
      <div className="empty-state">
        <p className="empty-title">Care Plan unavailable.</p>
        <p>{error || 'Could not load clinical care plan for this patient.'}</p>
        <button onClick={loadCarePlanData} className="btn btn-primary" style={{ marginTop: '12px' }}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {actionToast && (
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
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <CheckCircle size={18} />
          {actionToast}
        </div>
      )}

      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '999px', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 600, marginBottom: '10px' }}>
              <HeartPulse size={14} />
              Personalized Care Plan & Clinical Directives
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
              {carePlan.title}
            </h2>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span>Patient: <strong style={{ color: 'var(--text)' }}>{carePlan.patientName}</strong> ({carePlan.patientId})</span>
              <span>&bull;</span>
              <span>Physician: <strong style={{ color: 'var(--text)' }}>{carePlan.attendingPhysician}</strong></span>
              <span>&bull;</span>
              <span>Timeline: <strong style={{ color: 'var(--text)' }}>{carePlan.durationWeeks} Weeks</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isDoctor && (
              <button
                type="button"
                onClick={handleSyncFhir}
                disabled={syncingFhir}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: carePlan.fhirSyncStatus === 'SYNCED' ? '#f0fdf4' : '#eff6ff',
                  color: carePlan.fhirSyncStatus === 'SYNCED' ? '#15803d' : '#1d4ed8',
                  border: carePlan.fhirSyncStatus === 'SYNCED' ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} className={syncingFhir ? 'spin' : ''} />
                {syncingFhir ? 'Syncing...' : (carePlan.fhirSyncStatus === 'SYNCED' ? 'FHIR R4 Synced' : 'Sync to FHIR EHR')}
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenFhirJson}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <FileCode size={14} />
              FHIR Resource JSON
            </button>
          </div>
        </div>

        {/* 4 Clinical KPI Banner Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '22px' }}>
          {/* Adherence Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'conic-gradient(#10b981 ' + (carePlan.adherenceScore || 78.5) + '%, #e2e8f0 0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <div style={{ width: '40px', height: '40px', background: '#ffffff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>
                {(carePlan.adherenceScore || 78.5).toFixed(0)}%
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Adherence Score</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)' }}>Target: 78%+</div>
              <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>Active telemetry tracking</span>
            </div>
          </div>

          {/* Baseline CVD Risk */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', borderRadius: '10px', padding: '16px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Baseline 10-Yr CVD Risk</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
              {(carePlan.baselineRiskPercentage || 24.3).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700 }}>
              {carePlan.riskCategory || 'High Risk'}
            </span>
          </div>

          {/* Target Risk Post-Care Plan */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', borderRadius: '10px', padding: '16px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Target Post-Treatment</span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
              {(carePlan.targetRiskPercentage || 11.8).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700 }}>
              -{(carePlan.baselineRiskPercentage - carePlan.targetRiskPercentage).toFixed(1)}% absolute drop
            </span>
          </div>

          {/* Status & Plan Protocol */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb', borderRadius: '10px', padding: '16px' }}>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Plan Protocol</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1d4ed8', marginTop: '4px' }}>
              ACC/AHA & ADA
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Multi-factorial prevention
            </span>
          </div>
        </div>

        {/* Clinical Rationale Accordion */}
        <div style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
            <ShieldCheck size={16} color="#2563eb" />
            Clinical Evidence & Guidelines Basis:
          </div>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
            {carePlan.clinicalRationale}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: COUNTERFACTUAL "WHAT-IF" SIMULATOR (DOCTOR ONLY)*/}
      {/* ========================================================= */}
      {isDoctor && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: '999px', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
              <Sliders size={13} />
              Clinical Simulation Engine
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--navy)' }}>
              Cardiovascular Risk Simulation & Intervention Planning
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '4px 0 0' }}>
              Evaluate target response: <em>"What happens to 10-year CVD risk if the patient drops Systolic BP by 15 mmHg and achieves smoking cessation?"</em>
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px' }}>
            {/* Slider 1: Systolic BP */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--navy)', fontWeight: 700 }}>Systolic BP Target Reduction:</span>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>-{simBp} mmHg</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={simBp}
                onChange={(e) => setSimBp(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                <span>0 mmHg (Baseline)</span>
                <span>-15 mmHg (Guideline)</span>
                <span>-30 mmHg (Intensive)</span>
              </div>
            </div>

            {/* Toggle 2: Smoking Cessation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ color: 'var(--navy)', fontSize: '0.85rem', fontWeight: 700 }}>Smoking Cessation:</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Guideline cessation protocol + counseling</div>
              </div>
              <button
                type="button"
                onClick={() => setSimSmoking(!simSmoking)}
                style={{
                  background: simSmoking ? '#15803d' : '#e2e8f0',
                  color: simSmoking ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {simSmoking ? 'Cessation (Active)' : 'Non-Compliant'}
              </button>
            </div>

            {/* Slider 3: LDL Cholesterol Statin */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--navy)', fontWeight: 700 }}>Statin Therapy LDL Reduction:</span>
                <span style={{ color: '#7c3aed', fontWeight: 800 }}>-{simLdl} mg/dL</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="10"
                value={simLdl}
                onChange={(e) => setSimLdl(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                <span>0 mg/dL</span>
                <span>-40 mg/dL (Atorvastatin 20mg)</span>
                <span>-60 mg/dL (High-intensity)</span>
              </div>
            </div>

            {/* Slider 4: Aerobic Exercise */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--navy)', fontWeight: 700 }}>Weekly Aerobic Exercise:</span>
                <span style={{ color: '#15803d', fontWeight: 800 }}>{simExercise} min/week</span>
              </div>
              <input
                type="range"
                min="0"
                max="240"
                step="30"
                value={simExercise}
                onChange={(e) => setSimExercise(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#15803d', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                <span>Sedentary (0)</span>
                <span>150 min (AHA Guideline)</span>
                <span>240 min (Conditioned)</span>
              </div>
            </div>
          </div>

          {/* Results Projection Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                Simulated Clinical Outcome
              </span>

              {/* Baseline vs Simulated Visual Bar */}
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Baseline */}
                <div style={{ textAlign: 'center', minWidth: '90px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baseline</span>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#dc2626' }}>
                    {(simResult?.baselineRiskPercentage || 24.3).toFixed(1)}%
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b' }}>
                    {simResult?.baselineCategory || 'High Risk'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748b' }}>
                  <TrendingDown size={28} color="#15803d" />
                  <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 800 }}>
                    -{simResult?.relativeRiskReductionPercentage || 52}%
                  </span>
                </div>

                {/* Simulated */}
                <div style={{ textAlign: 'center', minWidth: '90px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated</span>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803d' }}>
                    {(simResult?.simulatedRiskPercentage || 11.6).toFixed(1)}%
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: (simResult?.simulatedRiskPercentage || 11.6) < 7.5 ? '#dcfce7' : '#fef3c7',
                    color: (simResult?.simulatedRiskPercentage || 11.6) < 7.5 ? '#166534' : '#92400e'
                  }}>
                    {simResult?.simulatedCategory || 'Moderate Risk'}
                  </span>
                </div>
              </div>

              {/* Absolute Risk Drop Highlight */}
              <div style={{
                marginTop: '18px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 800 }}>
                  Absolute Risk Reduction: -{(simResult?.absoluteRiskReduction || 12.7).toFixed(1)}%
                </div>
                <div style={{ color: '#334155', fontSize: '0.8rem', marginTop: '4px', lineHeight: '1.4' }}>
                  {simResult?.clinicalSummary || 'Intervention effectively transitions patient out of High-Risk category into controlled risk.'}
                </div>
              </div>

              {/* Breakdown of Key Drivers */}
              <div style={{ marginTop: '16px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--navy)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                  Intervention Impact Breakdown:
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(simResult?.interventionDrivers || [
                    'Systolic BP reduction (-15 mmHg): -4.8% absolute CVD risk',
                    'Complete Smoking Cessation: -4.2% absolute CVD risk',
                    'Statin LDL Reduction (-40 mg/dL): -2.9% absolute CVD risk',
                    'Aerobic Exercise (150 min/wk): -1.8% absolute CVD risk'
                  ]).map((driver, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#475569' }}>
                      <CheckCircle size={14} color="#15803d" />
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setDoctorNotes(`Adopting Target: SBP -${simBp} mmHg, LDL -${simLdl} mg/dL, Smoking Cessation, and ${simExercise} min/wk exercise.`)
                  showNotification('Simulation targets imported into Physician Clinical Directives!')
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '7px 14px' }}
              >
                Apply Targets to Care Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* ========================================================= */}
      {/* SECTION 2: PHARMACOTHERAPY & MEDICATION REGIMEN           */}
      {/* ========================================================= */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Pill size={20} color="#2563eb" />
              Prescription & Pharmacotherapy Regimen
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '4px 0 0' }}>
              {isDoctor 
                ? 'Clinical medical orders with direct prescribing and patient adherence tracking.'
                : 'Guideline-directed medical therapy with daily adherence tracking.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {carePlan.medications?.length || 0} Active Prescriptions
            </span>
            {isDoctor && (
              <button
                type="button"
                onClick={() => setShowAddMedModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(37,99,235,0.3)'
                }}
              >
                <Plus size={16} />
                Prescribe Medication
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {(carePlan.medications || []).map((med, idx) => (
            <div
              key={idx}
              style={{
                background: '#f8fafc',
                border: med.takenToday ? '1px solid #86efac' : '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '16px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>
                    {med.medicationName} <span style={{ color: '#2563eb', fontSize: '0.88rem', fontWeight: 700 }}>{med.dosage}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '3px' }}>
                    {med.frequency} &bull; {med.route}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                    Indication: {med.indication}
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe'
                }}>
                  {med.status}
                </span>
              </div>

              {/* Doctor vs Patient Actions */}
              <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isDoctor ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {med.takenToday ? (
                        <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Taken by patient today
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} /> Dose pending today
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(med.medicationName)}
                      style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Discontinue medication"
                    >
                      <Trash2 size={13} />
                      Discontinue
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.75rem', color: med.takenToday ? '#15803d' : 'var(--text-muted)', fontWeight: 700 }}>
                      {med.takenToday ? '✓ Taken Today' : 'Pending Dose'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleMedicationAdherence(med.medicationName, med.takenToday)}
                      style={{
                        background: med.takenToday ? '#dcfce7' : '#ffffff',
                        color: med.takenToday ? '#166534' : '#1e293b',
                        border: med.takenToday ? '1px solid #86efac' : '1px solid #cbd5e1',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {med.takenToday ? 'Mark Undone' : 'Log Taken'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: LIFESTYLE, DIET & EXERCISE PROTOCOL            */}
      {/* ========================================================= */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={20} color="#10b981" />
              Lifestyle, Nutrition & Exercise Directives
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '4px 0 0' }}>
              Evidence-based non-pharmacological interventions with weekly progress tracking.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {(carePlan.lifestyleActivities || []).map((act, idx) => {
            const pct = Math.min(100, Math.round(((act.currentWeeklyCompletions || 0) / (act.targetWeeklyCompletions || 1)) * 100))
            return (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: act.category === 'EXERCISE' ? '#dcfce7' : '#ffedd5',
                      color: act.category === 'EXERCISE' ? '#166534' : '#c2410c',
                      border: act.category === 'EXERCISE' ? '1px solid #bbf7d0' : '1px solid #fed7aa'
                    }}>
                      {act.category}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {act.currentWeeklyCompletions || 0} / {act.targetWeeklyCompletions} this week
                    </span>
                  </div>

                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--navy)' }}>
                    {act.title}
                  </div>
                  <p style={{ color: '#475569', fontSize: '0.8rem', margin: '6px 0 10px', lineHeight: '1.4' }}>
                    {act.description}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#10b981' : '#2563eb', borderRadius: '3px' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {act.targetFrequency}
                    </span>
                    {!isDoctor ? (
                      <button
                        type="button"
                        onClick={() => handleToggleActivityAdherence(act.title, act.completedToday)}
                        style={{
                          background: act.completedToday ? '#dcfce7' : '#ffffff',
                          color: act.completedToday ? '#166534' : '#1e293b',
                          border: act.completedToday ? '1px solid #86efac' : '1px solid #cbd5e1',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {act.completedToday ? '✓ Done Today' : '+ Log Done'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: act.completedToday ? '#15803d' : 'var(--text-muted)', fontWeight: 700 }}>
                        {act.completedToday ? '✓ Completed' : 'Pending session'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>


      {/* ========================================================= */}
      {/* SECTION 4: CLINICIAN ORDERS & CDS CUSTOMIZATION           */}
      {/* ========================================================= */}
      {isDoctor && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 12px', color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ClipboardList size={20} color="#2563eb" />
            Clinical Decision Support (CDS) & Prescribing Directives
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.84rem', color: 'var(--navy)', fontWeight: 700 }}>
              Attending Physician Directives & Titration Notes:
            </label>
            <textarea
              rows="3"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Enter customized clinical directives, target lab thresholds, or referral instructions..."
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text)',
                fontSize: '0.88rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Save size={14} color="#2563eb" />
                {savingNotes ? 'Saving directives...' : 'Save Directives'}
              </button>
              <button
                type="button"
                onClick={handleRegenerateCarePlan}
                disabled={recomputing}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <RefreshCw size={14} className={recomputing ? 'spin' : ''} />
                {recomputing ? 'Updating Care Plan...' : 'Recalculate Care Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FHIR JSON Modal */}
      {showFhirModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--navy)', fontWeight: 800 }}>
                <FileCode size={18} color="#2563eb" />
                HL7 FHIR R4 CarePlan Resource Export
              </div>
              <button
                type="button"
                onClick={() => setShowFhirModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
              {loadingFhirJson ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                  Loading FHIR R4 schema...
                </div>
              ) : (
                <pre style={{
                  background: '#0f172a',
                  padding: '16px',
                  borderRadius: '8px',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                  overflowX: 'auto',
                  margin: 0
                }}>
                  {fhirJson}
                </pre>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button
                type="button"
                onClick={() => setShowFhirModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prescribe Medication Modal for Doctor */}
      {showAddMedModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Pill size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--navy)', fontWeight: 800 }}>Prescribe Medication</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Add new Rx order to patient's active Care Plan</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMedModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, fontSize: '1.2rem', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddMedicationSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
                  Medication Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atorvastatin, Lisinopril, Metformin"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {['Atorvastatin', 'Lisinopril', 'Metformin', 'Empagliflozin', 'Amlodipine', 'Rosuvastatin'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewMedName(preset)}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
                    Dosage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20 mg, 10 mg, 500 mg"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
                    Route
                  </label>
                  <select
                    value={newMedRoute}
                    onChange={(e) => setNewMedRoute(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: 'var(--text)',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Oral">Oral (PO)</option>
                    <option value="Subcutaneous">Subcutaneous (SC)</option>
                    <option value="Inhaled">Inhaled</option>
                    <option value="Intravenous">Intravenous (IV)</option>
                    <option value="Transdermal">Transdermal</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
                  Frequency & Timing *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Once daily at bedtime (PO QHS)"
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 700, marginBottom: '6px' }}>
                  Clinical Indication *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lipid lowering & plaque stabilization"
                  value={newMedIndication}
                  onChange={(e) => setNewMedIndication(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMed}
                  style={{
                    background: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Pill size={16} />
                  {submittingMed ? 'Saving Order...' : 'Prescribe & Save to Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
