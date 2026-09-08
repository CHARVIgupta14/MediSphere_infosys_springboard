import './StatCard.css'

export default function StatCard({ label, value, accent = 'navy' }) {
  const display = value === null || value === undefined ? '—' : value

  return (
    <div className={`card stat-card stat-card-${accent}`}>
      <div className="stat-card-value">{display}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}
