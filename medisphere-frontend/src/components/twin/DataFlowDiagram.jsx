import './DataFlowDiagram.css'

const stages = [
  { key: 'fhir', title: 'FHIR', desc: 'Standardized healthcare resource' },
  { key: 'mapper', title: 'Mapper', desc: 'Transforms FHIR data' },
  { key: 'twin', title: 'PatientTwin', desc: 'Normalized digital patient model' },
  { key: 'mongo', title: 'MongoDB', desc: 'Persistent twin storage' },
  { key: 'p360', title: 'Patient 360', desc: 'Unified patient view' }
]

export default function DataFlowDiagram() {
  return (
    <section>
      <h2 className="section-title">Digital Twin Data Flow</h2>
      <div className="card data-flow">
        {stages.map((stage, idx) => (
          <div className="data-flow-stage" key={stage.key}>
            <div className="data-flow-node">
              <span className="data-flow-title">{stage.title}</span>
              <span className="data-flow-desc">{stage.desc}</span>
            </div>
            {idx < stages.length - 1 && <span className="data-flow-arrow">→</span>}
          </div>
        ))}
      </div>
    </section>
  )
}
