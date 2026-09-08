import './EmptyState.css'

export default function EmptyState({ message = 'No data available.' }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  )
}
