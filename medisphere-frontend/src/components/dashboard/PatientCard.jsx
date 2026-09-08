import { useNavigate } from 'react-router-dom'
import './PatientCard.css'

function field(value) {
  return value === null || value === undefined || value === '' ? 'Not recorded' : value
}

function listSummary(list) {
  if (!Array.isArray(list) || list.length === 0) return 'No records available'
  return list
    .slice(0, 2)
    .map((item) => (typeof item === 'string' ? item : item?.name ?? item?.condition ?? item?.medication))
    .filter(Boolean)
    .join(', ') + (list.length > 2 ? ` +${list.length - 2} more` : '')
}

export default function PatientCard({ patient }) {
  const navigate = useNavigate()

  const id = patient?.id ?? patient?.patientId
  const name = field(patient?.name)
  const age = field(patient?.age)
  const gender = field(patient?.gender)
  const bloodGroup = field(patient?.bloodGroup ?? patient?.bloodType)
  const hasTwin = patient?.twinAvailable ?? patient?.hasTwin ?? null

  return (
    <div className="card patient-card">
      <div className="patient-card-top">
        <div className="patient-card-avatar">
          {typeof patient?.name === 'string' ? patient.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div className="patient-card-heading">
          <h3>{name}</h3>
          <span className="patient-card-id">ID: {field(id)}</span>
        </div>
        {hasTwin !== null && (
          <span className={`badge ${hasTwin ? 'badge-teal' : 'badge-muted'}`}>
            {hasTwin ? 'Twin Available' : 'No Twin'}
          </span>
        )}
      </div>

      <div className="patient-card-grid">
        <div>
          <span className="patient-card-label">Age</span>
          <span className="patient-card-value">{age}</span>
        </div>
        <div>
          <span className="patient-card-label">Gender</span>
          <span className="patient-card-value">{gender}</span>
        </div>
        <div>
          <span className="patient-card-label">Blood Group</span>
          <span className="patient-card-value">{bloodGroup}</span>
        </div>
      </div>

      <div className="patient-card-summary">
        <div>
          <span className="patient-card-label">Conditions</span>
          <p>{listSummary(patient?.conditions)}</p>
        </div>
        <div>
          <span className="patient-card-label">Medications</span>
          <p>{listSummary(patient?.medications)}</p>
        </div>
      </div>

      <button
        className="btn btn-primary patient-card-action"
        disabled={!id}
        onClick={() => id && navigate(`/patients/${id}`)}
      >
        Open Digital Twin →
      </button>
    </div>
  )
}
