import EmptyState from '../common/EmptyState.jsx'
import './HealthProfile.css'

export default function ConditionList({ conditions }) {
  const list = Array.isArray(conditions) ? conditions : []

  if (list.length === 0) {
    return <EmptyState compact message="No conditions recorded" />
  }

  return (
    <ul className="health-list">
      {list.map((item, idx) => (
        <li key={idx} className="badge badge-muted health-list-item">
          {typeof item === 'string' ? item : item?.name ?? item?.condition ?? 'Not recorded'}
        </li>
      ))}
    </ul>
  )
}
