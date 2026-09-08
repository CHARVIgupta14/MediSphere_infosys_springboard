import VitalCard from './VitalCard.jsx'
import EmptyState from '../common/EmptyState.jsx'
import './VitalsSection.css'

export default function VitalsSection({ vitals }) {
  return (
    <section>
      <div className="vitals-section-header">
        <h2 className="section-title">Latest Vital Signs</h2>
        {vitals?.lastUpdated && (
          <span className="vitals-updated">Last Updated: {vitals.lastUpdated}</span>
        )}
      </div>

      {!vitals ? (
        <div className="card">
          <EmptyState message="No vitals available" />
        </div>
      ) : (
        <div className="vitals-grid">
          <VitalCard label="Heart Rate" value={vitals?.heartRate} unit="bpm" />
          <VitalCard label="SpO2" value={vitals?.spo2} unit="%" />
          <VitalCard label="Temperature" value={vitals?.temperature} unit="°F" />
        </div>
      )}
    </section>
  )
}
