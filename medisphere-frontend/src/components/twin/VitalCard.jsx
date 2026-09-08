import './VitalCard.css'

export default function VitalCard({ label, value, unit }) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <div className="card vital-card">
      <span className="vital-label">{label}</span>
      {hasValue ? (
        <span className="vital-value">
          {value}
          {unit && <span className="vital-unit">{unit}</span>}
        </span>
      ) : (
        <span className="vital-value vital-value-empty">Not recorded</span>
      )}
    </div>
  )
}
