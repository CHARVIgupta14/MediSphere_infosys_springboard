import EmptyState from '../common/EmptyState.jsx'
import './HealthProfile.css'

export default function MedicationList({ medications }) {
  const list = Array.isArray(medications) ? medications : []

  if (list.length === 0) {
    return <EmptyState compact message="No medications recorded" />
  }

  return (
    <ul className="health-list">
      {list.map((item, idx) => (
        <li key={idx} className="badge badge-teal health-list-item">
          {typeof item === 'string' ? item : item?.name ?? item?.medication ?? 'Not recorded'}
        </li>
      ))}
    </ul>
  )
}
