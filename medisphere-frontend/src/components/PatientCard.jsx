import { useNavigate } from 'react-router-dom'
import './PatientCard.css'

export default function PatientCard({ patient }) {
  const navigate = useNavigate()

  const id = patient?.id ?? patient?.patientId ?? 'Not available'
  const name = patient?.name ?? 'Not available'
  const age = patient?.age ?? 'Not available'
  const gender = patient?.gender ?? 'Not available'

  const handleClick = () => {
    if (patient?.id ?? patient?.patientId) {
      navigate(`/patients/${patient.id ?? patient.patientId}`)
    }
  }

  return (
    <div className="patient-card" onClick={handleClick}>
      <div className="patient-card-avatar">
        {typeof name === 'string' && name !== 'Not available'
          ? name.charAt(0).toUpperCase()
          : '?'}
      </div>
      <div className="patient-card-info">
        <h3 className="patient-card-name">{name}</h3>
        <p className="patient-card-detail">ID: {id}</p>
        <p className="patient-card-detail">Age: {age}</p>
        <p className="patient-card-detail">Gender: {gender}</p>
      </div>
    </div>
  )
}
