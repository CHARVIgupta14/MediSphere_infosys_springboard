import './Consent.css'

const cards = [
  {
    title: 'Patient Consent',
    desc: 'Capture and manage patient authorization for data sharing across the platform.'
  },
  {
    title: 'Data Access',
    desc: 'Define which roles and systems can view or modify specific patient records.'
  },
  {
    title: 'Authorization',
    desc: 'Enforce identity and permission checks before any patient data is accessed.'
  }
]

export default function Consent() {
  return (
    <div className="consent-page">
      <div className="consent-grid">
        {cards.map((c) => (
          <div className="card consent-card" key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
            <span className="badge badge-muted">Coming in Security Phase</span>
          </div>
        ))}
      </div>
    </div>
  )
}
