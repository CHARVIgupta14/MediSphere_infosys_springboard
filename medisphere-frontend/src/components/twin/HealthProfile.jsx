import ConditionList from './ConditionList.jsx'
import MedicationList from './MedicationList.jsx'
import './HealthProfile.css'

export default function HealthProfile({ conditions, medications }) {
  return (
    <section>
      <h2 className="section-title">Health Profile</h2>
      <div className="health-profile-grid">
        <div className="card health-profile-card">
          <h3 className="health-profile-heading">Conditions</h3>
          <ConditionList conditions={conditions} />
        </div>
        <div className="card health-profile-card">
          <h3 className="health-profile-heading">Medications</h3>
          <MedicationList medications={medications} />
        </div>
      </div>
    </section>
  )
}
