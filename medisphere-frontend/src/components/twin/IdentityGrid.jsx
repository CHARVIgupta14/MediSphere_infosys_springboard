import './IdentityGrid.css'

function field(value) {
  return value === null || value === undefined || value === '' ? 'Not recorded' : value
}

export default function IdentityGrid({ age, gender, bloodGroup, twinStatus }) {
  const items = [
    { label: 'Age', value: field(age) },
    { label: 'Gender', value: field(gender) },
    { label: 'Blood Group', value: field(bloodGroup) },
    { label: 'Twin Status', value: twinStatus || 'Active' }
  ]

  return (
    <section>
      <h2 className="section-title">Patient Identity</h2>
      <div className="identity-grid">
        {items.map((item) => (
          <div className="card identity-cell" key={item.label}>
            <span className="identity-label">{item.label}</span>
            <span className="identity-value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
