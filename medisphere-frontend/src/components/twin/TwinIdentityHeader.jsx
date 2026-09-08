import './TwinIdentityHeader.css'

function field(value) {
  return value === null || value === undefined || value === '' ? 'Not recorded' : value
}

export default function TwinIdentityHeader({ name, patientId }) {
  return (
    <div className="twin-header card">
      <div className="twin-header-label">DIGITAL TWIN</div>
      <h2 className="twin-header-name">{field(name)}</h2>
      <div className="twin-header-id">Patient ID: {field(patientId)}</div>

      <div className="twin-header-visual">
        <div className="twin-visual-ring">
          <div className="twin-visual-core">
            {typeof name === 'string' ? name.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
        <div className="twin-visual-meta">
          <div className="twin-visual-row">
            <span className="badge badge-success">● ACTIVE</span>
          </div>
          <div className="twin-visual-source">PatientTwin · MongoDB Record</div>
        </div>
      </div>
    </div>
  )
}
