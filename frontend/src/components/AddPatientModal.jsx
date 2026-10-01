import React, { useState } from 'react'
import { X, UserPlus, Download, Check, AlertCircle, Database, Sparkles } from 'lucide-react'
import { createPatient, importFhirPatient, getErrorMessage } from '../services/api'

export default function AddPatientModal({ isOpen, onClose, onPatientAdded }) {
  const [mode, setMode] = useState('manual') // 'manual' or 'fhir'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Manual Form State
  const [form, setForm] = useState({
    patientId: '',
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    conditions: '',
    medications: ''
  })

  // FHIR Import State
  const [fhirId, setFhirId] = useState('')

  if (!isOpen) return null

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!form.patientId.trim() || !form.name.trim() || !form.age) {
      setError('Please fill in Patient ID, Name, and Age.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        patientId: form.patientId.trim(),
        name: form.name.trim(),
        age: parseInt(form.age, 10),
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        conditions: form.conditions
          ? form.conditions.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        medications: form.medications
          ? form.medications.split(',').map((m) => m.trim()).filter(Boolean)
          : []
      }

      const res = await createPatient(payload)
      setSuccessMsg(`Patient ${res.name || payload.name} (${payload.patientId}) created successfully!`)
      if (onPatientAdded) onPatientAdded(res)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      setError(getErrorMessage(err) || 'Failed to create patient. Verify ID is unique.')
    } finally {
      setLoading(false)
    }
  }

  const handleFhirImport = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!fhirId.trim()) {
      setError('Please enter a valid FHIR Patient ID.')
      return
    }

    setLoading(true)
    try {
      const res = await importFhirPatient(fhirId.trim())
      setSuccessMsg(`Imported from HAPI FHIR: ${res.name || fhirId} (${res.patientId})`)
      if (onPatientAdded) onPatientAdded(res)
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      setError(getErrorMessage(err) || 'Could not fetch patient from HAPI FHIR server. Verify ID exists.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--blue-dim)',
                color: 'var(--blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--navy)' }}>
                Add New Patient
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Register manually or pull live HL7 FHIR records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: '#ffffff'
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('manual')
              setError('')
              setSuccessMsg('')
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: mode === 'manual' ? '#ffffff' : '#f8fafc',
              border: 'none',
              borderBottom: mode === 'manual' ? '2px solid var(--blue)' : '2px solid transparent',
              color: mode === 'manual' ? 'var(--blue)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <UserPlus size={16} />
            Manual Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('fhir')
              setError('')
              setSuccessMsg('')
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              background: mode === 'fhir' ? '#ffffff' : '#f8fafc',
              border: 'none',
              borderBottom: mode === 'fhir' ? '2px solid var(--blue)' : '2px solid transparent',
              color: mode === 'fhir' ? 'var(--blue)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Import from FHIR Server
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '20px 24px', overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#dcfce7',
                border: '1px solid #86efac',
                color: '#166534',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'manual' ? (
            <form onSubmit={handleManualSubmit} style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                    Patient ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. P004 or rahul-004"
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                    Age *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    placeholder="45"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#fff'
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                    Blood Group
                  </label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      background: '#fff'
                    }}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  Conditions / Diagnoses (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Pre-Diabetes"
                  value={form.conditions}
                  onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  Medications (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amlodipine 5mg, Atorvastatin 10mg"
                  value={form.medications}
                  onChange={(e) => setForm({ ...form, medications: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: '#f8fafc',
                    color: 'var(--navy)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'var(--blue)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {loading ? 'Creating...' : 'Register Patient'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFhirImport} style={{ display: 'grid', gap: '14px' }}>
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12px',
                  color: '#166534',
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <Database size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Live HL7 FHIR Interoperability:</strong> MediSphere connects directly to the public{' '}
                  <code>https://hapi.fhir.org/baseR4</code> test server to fetch remote clinical Patient resources and convert them into digital twin entities.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                  FHIR Patient Resource ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sindhu-syn-000006 or 12345"
                  value={fhirId}
                  onChange={(e) => setFhirId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Quick Sample IDs on HAPI FHIR:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['sindhu-syn-000006', 'example', 'pat1'].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFhirId(id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)',
                        background: '#f8fafc',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: 'var(--navy)',
                        cursor: 'pointer'
                      }}
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: '#f8fafc',
                    color: 'var(--navy)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {loading ? 'Importing from FHIR...' : 'Import Patient'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
