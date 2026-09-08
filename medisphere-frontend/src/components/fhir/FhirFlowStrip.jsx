import './FhirFlowStrip.css'

const steps = ['FHIR', 'PatientTwin', 'MongoDB']

export default function FhirFlowStrip() {
  return (
    <div className="fhir-flow-strip">
      {steps.map((step, idx) => (
        <span key={step} className="fhir-flow-item">
          <span className="fhir-flow-node">{step}</span>
          {idx < steps.length - 1 && <span className="fhir-flow-arrow">→</span>}
        </span>
      ))}
    </div>
  )
}
