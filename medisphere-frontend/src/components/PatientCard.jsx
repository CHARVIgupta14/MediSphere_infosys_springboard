import { Link } from "react-router-dom";

function PatientCard({ patient }) {
  return (
    <article className="patient-card">
      <div className="patient-avatar">
        {(patient.name || "P").charAt(0).toUpperCase()}
      </div>

      <div className="patient-card-content">
        <h3>{patient.name || "Unnamed Patient"}</h3>
        <p className="patient-id">{patient.patientId}</p>

        <div className="patient-summary">
          <span>{patient.age ?? "—"} years</span>
          <span>{patient.gender || "—"}</span>
          <span>{patient.bloodGroup || "—"}</span>
        </div>
      </div>

      <Link className="primary-button" to={`/patients/${patient.patientId}`}>
        View Patient 360
      </Link>
    </article>
  );
}

export default PatientCard;
