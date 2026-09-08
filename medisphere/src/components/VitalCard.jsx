import React from 'react'

export default function VitalCard({ icon: Icon, label, value, unit }) {
  const hasValue = value !== null && value !== undefined && value !== '' && !Number.isNaN(Number(value))

  return (
    <div className="vital-card">
      <div className="vital-card-head">
        <Icon size={18} />
        <span>{label}</span>
      </div>
      <div className="vital-card-value">
        {hasValue ? (
          <>
            <span className="vital-number">{value}</span>
            <span className="vital-unit">{unit}</span>
          </>
        ) : (
          <span className="vital-empty">No vital data available</span>
        )}
      </div>
      {hasValue && (
        <div className="vital-status">
          <span className="dot live" />
          Live
        </div>
      )}
    </div>
  )
}
