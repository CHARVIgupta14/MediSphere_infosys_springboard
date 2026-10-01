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
                <td className="mono" style={{ color: 'var(--blue)', fontWeight: 600 }}>
                  {p.patientId}
                </td>
                <td style={{ color: 'var(--text)', fontSize: '13px', fontWeight: 500 }}>
                  {p.conditions && p.conditions.length > 0 ? p.conditions.join(', ') : '—'}
                </td>
                <td>
                  {isCrisis ? (
                    <span style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Critical Alert
                    </span>
                  ) : isElevated ? (
                    <span style={{
                      background: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      Elevated
                    </span>
                  ) : (
                    <span style={{
                      background: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #86efac',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      Stable
                    </span>
                  )}
                </td>
                <td className="mono" style={{
                  fontWeight: isCrisis ? 700 : 500,
                  color: isCrisis ? '#b91c1c' : isElevated ? '#b45309' : 'var(--navy)'
                }}>
                  {hr ? `${hr} BPM` : '—'}
                </td>
                <td className="mono" style={{
                  fontWeight: spo2 && spo2 < 90 ? 700 : 500,
                  color: spo2 && spo2 < 90 ? '#b91c1c' : 'var(--navy)'
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
