import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import VitalCard from "../components/VitalCard";
import { getPatient360 } from "../services/patientService";

function Patient360() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        setError("");
        const data = await getPatient360(patientId);
        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPatient();
  }, [patientId]);

  if (loading) {
    return <LoadingSpinner text="Loading patient data..." />;
  }

  if (error || !patient) {
    return (
      <div className="state-card error-card">
        <h2>Patient not found</h2>
        <p>{error || "No patient data was returned by the backend."}</p>
        <Link to="/" className="primary-button">
          Back to Patients
        </Link>
      </div>
    );
  }

  const vitals = patient.latestVitals;
  const conditions = Array.isArray(patient.conditions) ? patient.conditions : [];
  const medications = Array.isArray(patient.medications)
    ? patient.medications
    : [];

  return (
    <section>
      <Link to="/" className="back-link">
        ← Back to Patients
      </Link>

      <div className="patient-hero">
        <div className="large-avatar">
          {(patient.name || "P").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="eyebrow">PATIENT 360</p>
          <h1>{patient.name || "Unnamed Patient"}</h1>
          <p className="patient-id">Patient ID: {patient.patientId}</p>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span>Age</span>
          <strong>{patient.age ?? "—"}</strong>
        </div>
        <div className="info-card">
          <span>Gender</span>
          <strong>{patient.gender || "—"}</strong>
        </div>
        <div className="info-card">
          <span>Blood Group</span>
          <strong>{patient.bloodGroup || "—"}</strong>
        </div>
        <div className="info-card">
          <span>Patient ID</span>
          <strong>{patient.patientId}</strong>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURRENT HEALTH DATA</p>
            <h2>Latest Vitals</h2>
          </div>
          {vitals?.timestamp && (
            <span className="timestamp">
              Recorded: {new Date(vitals.timestamp).toLocaleString()}
            </span>
          )}
        </div>

        {vitals ? (
          <div className="vitals-grid">
            <VitalCard label="Heart Rate" value={vitals.heartRate} unit="BPM" />
            <VitalCard label="SpO2" value={vitals.spo2} unit="%" />
            <VitalCard
              label="Temperature"
              value={vitals.temperature}
              unit="°C"
            />
          </div>
        ) : (
          <div className="empty-card">No vitals available</div>
        )}
      </section>

      <div className="medical-grid">
        <section className="medical-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MEDICAL HISTORY</p>
              <h2>Conditions</h2>
            </div>
          </div>

          {conditions.length > 0 ? (
            <ul className="tag-list">
              {conditions.map((condition, index) => (
                <li key={`${condition}-${index}`}>{condition}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No conditions recorded</p>
          )}
        </section>

        <section className="medical-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CURRENT TREATMENT</p>
              <h2>Medications</h2>
            </div>
          </div>

          {medications.length > 0 ? (
            <ul className="tag-list">
              {medications.map((medication, index) => (
                <li key={`${medication}-${index}`}>{medication}</li>
              ))}
            </ul>
          ) : (
            <p className="empty-text">No medications recorded</p>
          )}
        </section>
      </div>
    </section>
  );
}

export default Patient360;
