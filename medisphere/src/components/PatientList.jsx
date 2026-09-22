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
            <th>Patient Name</th>
            <th>Patient ID</th>
            <th>Diagnosis / Conditions</th>
            <th>Status</th>
            <th>Heart Rate</th>
            <th>SpO2</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const hr = p.latestVitals?.heartRate
            const spo2 = p.latestVitals?.spo2
            const isCrisis = (hr && hr > 120) || (spo2 && spo2 < 90)
            const isHypertension = (p.conditions || []).some((c) =>
              c.toLowerCase().includes('hypertension')
            )
            const isElevated = !isCrisis && (isHypertension || (hr && hr >= 95))

            return (
              <tr
                key={p.patientId}
                className={p.patientId === selectedId ? 'is-selected' : ''}
                onClick={() => onSelect(p.patientId)}
                style={{ cursor: 'pointer' }}
              >
                <td>
                  <strong style={{ color: '#f8fafc' }}>{p.name || 'Not available'}</strong>
                  {p.age && <span style={{ color: '#94a3b8', fontSize: '12px', marginLeft: '6px' }}>({p.age}y)</span>}
                </td>
                <td className="mono" style={{ color: '#38bdf8' }}>{p.patientId}</td>
                <td style={{ color: '#cbd5e1', fontSize: '12px' }}>
                  {p.conditions && p.conditions.length > 0 ? p.conditions.join(', ') : '—'}
                </td>
                <td>
                  {isCrisis ? (
                    <span style={{
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>
                      🚨 Crisis Alert
                    </span>
                  ) : isElevated ? (
                    <span style={{
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: '#fbbf24',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      Elevated
                    </span>
                  ) : (
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      Stable
                    </span>
                  )}
                </td>
                <td className="mono" style={{
                  fontWeight: isCrisis ? 700 : 500,
                  color: isCrisis ? '#ef4444' : isElevated ? '#fbbf24' : '#cbd5e1'
                }}>
                  {hr ? `${hr} BPM` : '—'}
                </td>
                <td className="mono" style={{
                  color: spo2 && spo2 < 90 ? '#ef4444' : '#cbd5e1'
                }}>
                  {spo2 ? `${spo2}%` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
