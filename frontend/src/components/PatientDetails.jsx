import React from 'react'
import { HeartPulse, Wind, Thermometer } from 'lucide-react'

function display(value) {
  if (value === null || value === undefined || value === '') return 'Not available'
  return value
}

export default function PatientDetails({ patient, loading, error }) {
  if (loading) {
    return (
      <div className="panel">
        <p>Loading patient...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="panel">
        <p className="error-text">{error}</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="panel empty-panel">
        <p>Select a patient to view their Patient 360 profile.</p>
      </div>
    )
  }

  const vitals = patient.latestVitals

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Patient 360</h2>
      </div>

      <div className="patient-360-header">
        <div className="patient-360-name">{display(patient.name)}</div>
        <div className="patient-360-id mono">{display(patient.patientId)}</div>
      </div>

      <dl className="info-grid">
        <div>
          <dt>Age</dt>
          <dd>{display(patient.age)}</dd>
        </div>
        <div>
          <dt>Gender</dt>
          <dd>{display(patient.gender)}</dd>
        </div>
        <div>
          <dt>Blood group</dt>
          <dd>{display(patient.bloodGroup)}</dd>
        </div>
      </dl>

      <div className="divider" />
      <h3 className="section-label">Latest vitals</h3>

      {vitals ? (
        <div className="vitals-mini-grid">
          <div className="vitals-mini">
            <HeartPulse size={16} />
            <span>Heart rate</span>
            <strong>
              {display(vitals.heartRate)} <em>BPM</em>
            </strong>
          </div>
          <div className="vitals-mini">
            <Wind size={16} />
            <span>SpO₂</span>
            <strong>
              {display(vitals.spo2)} <em>%</em>
            </strong>
          </div>
          <div className="vitals-mini">
            <Thermometer size={16} />
            <span>Temperature</span>
            <strong>
              {display(vitals.temperature)} <em>°C</em>
            </strong>
          </div>
        </div>
      ) : (
        <p className="empty-inline">No vital data available</p>
      )}

      <div className="divider" />
      <p className="panel-footnote">Consent details — managed through the patient portal.</p>
    </div>
  )
}
