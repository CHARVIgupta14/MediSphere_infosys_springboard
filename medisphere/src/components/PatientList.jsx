import React from 'react'

export default function PatientList({ patients, selectedId, onSelect }) {
  if (!patients || patients.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No patients found.</p>
        <p>PatientTwin records imported from FHIR will appear here.</p>
      </div>
    )
  }

  return (
    <div className="patient-list">
      <table>
        <thead>
          <tr>
            <th>Patient name</th>
            <th>Patient ID</th>
            <th>HR</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr
              key={p.patientId}
              className={p.patientId === selectedId ? 'is-selected' : ''}
              onClick={() => onSelect(p.patientId)}
            >
              <td>{p.name || 'Not available'}</td>
              <td className="mono">{p.patientId}</td>
              <td className="mono">{p.latestVitals?.heartRate ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
