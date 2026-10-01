import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import CarePlanManager from '../components/CarePlanManager'
import { getDoctorDashboard, getCarePlanSummary } from '../services/api'
import { ClipboardList, Users, ShieldCheck, TrendingUp, CheckCircle2, UserCheck, HeartPulse } from 'lucide-react'

export default function CarePlanDashboardPage() {
  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState('john-doe-001')
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [pts, sum] = await Promise.all([
          getDoctorDashboard(),
          getCarePlanSummary()
        ])
        if (pts && pts.length > 0) {
          setPatients(pts)
          // Default to john-doe-001 or first patient
          const found = pts.find(p => p.patientId === 'john-doe-001') || pts[0]
          setSelectedPatientId(found.patientId)
        }
        if (sum) setSummary(sum)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="app-shell">
      <Sidebar role="doctor" />
      <div className="app-main">
        <Topbar
          eyebrow="Clinical Decision Support & Care Management"
          title="Personalized Care Plans & Orders"
          syncing={!loading}
        />
        <div className="app-content">
          {/* Top Clinical KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '22px' }}>
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #10b981', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Care Plans</span>
                <ClipboardList size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>
                {summary?.totalActiveCarePlans ?? 2}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Active patient coverage</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #2563eb', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cohort Adherence</span>
                <TrendingUp size={18} color="#2563eb" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>
                {(summary?.populationAdherenceRate ?? 78.5).toFixed(1)}%
              </div>
              <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>Target &ge; 75% adherence</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #f59e0b', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>High-Risk Patients</span>
                <HeartPulse size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', marginTop: '4px' }}>
                {summary?.highRiskCoveredCount ?? 2}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Guideline statin & BP regimes</span>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderLeft: '4px solid #0284c7', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Interoperability</span>
                <ShieldCheck size={18} color="#0284c7" />
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy)', marginTop: '6px' }}>
                HL7 FHIR R4
              </div>
              <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>Bidirectional EHR writeback</span>
            </div>
          </div>

          {/* Patient Selector Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--navy)', fontSize: '0.88rem', fontWeight: 700 }}>
              <Users size={18} color="#2563eb" />
              <span>Select Active Patient:</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {patients.map((p) => {
                const isSelected = p.patientId === selectedPatientId
                return (
                  <button
                    key={p.patientId}
                    type="button"
                    onClick={() => setSelectedPatientId(p.patientId)}
                    style={{
                      background: isSelected ? '#1d4ed8' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#334155',
                      border: isSelected ? '1px solid #1d4ed8' : '1px solid #e2e8f0',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <UserCheck size={14} color={isSelected ? '#ffffff' : '#64748b'} />
                    {p.name} ({p.patientId})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main CarePlan Manager Component */}
          {selectedPatientId && (
            <CarePlanManager patientId={selectedPatientId} isDoctor={true} />
          )}
        </div>
      </div>
    </div>
  )
}
