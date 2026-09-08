import './EmptyState.css'

export default function EmptyState({ message = 'No records available.', compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'empty-state-compact' : ''}`}>
      <p>{message}</p>
    </div>
  )
}
