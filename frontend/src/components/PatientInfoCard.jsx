import React from 'react'

function display(value) {
  if (value === null || value === undefined || value === '') return 'Not available'
  return value
}

function capitalizeGender(value) {
  if (!value) return 'Not available'
  return String(value).charAt(0).toUpperCase() + String(value).slice(1)
}

export default function PatientInfoCard({ patient }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Patient information</h2>
        <span className="fhir-badge">FHIR R4</span>
      </div>
      <dl className="info-grid">
        <div>
          <dt>Full name</dt>
          <dd>{display(patient?.name)}</dd>
        </div>
        <div>
          <dt>Patient ID</dt>
          <dd>{display(patient?.patientId)}</dd>
        </div>
        <div>
          <dt>Age</dt>
          <dd>{display(patient?.age)}</dd>
        </div>
        <div>
          <dt>Gender</dt>
          <dd>{capitalizeGender(patient?.gender)}</dd>
        </div>
        <div>
          <dt>Blood group</dt>
          <dd>{display(patient?.bloodGroup)}</dd>
        </div>
      </dl>
      <p className="panel-footnote">Profile source: HAPI FHIR</p>
    </div>
  )
}
