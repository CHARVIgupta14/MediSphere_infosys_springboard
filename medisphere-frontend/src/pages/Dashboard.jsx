import { useEffect, useMemo, useState } from "react";
import PatientCard from "../components/PatientCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getPatients } from "../services/patientService";

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);
        setError("");
        const data = await getPatients();
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return patients;

    return patients.filter(
      (patient) =>
        patient.name?.toLowerCase().includes(query) ||
        patient.patientId?.toLowerCase().includes(query)
    );
  }, [patients, search]);

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">PATIENT MANAGEMENT</p>
          <h1>Patient Dashboard</h1>
          <p className="subtitle">
            Select a patient to view their complete digital twin.
          </p>
        </div>

        <div className="patient-count">
          <strong>{patients.length}</strong>
          <span>Patients</span>
        </div>
      </div>

      <div className="search-bar">
        <span>⌕</span>
        <input
          type="search"
          placeholder="Search by patient name or ID..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading && <LoadingSpinner text="Loading patients..." />}

      {!loading && error && (
        <div className="state-card error-card">
          <h3>Unable to connect to MediSphere backend</h3>
          <p>{error}</p>
          <p>Please make sure the Spring Boot server is running on port 8080.</p>
        </div>
      )}

      {!loading && !error && filteredPatients.length === 0 && (
        <div className="state-card">
          <h3>No patients found</h3>
          <p>
            {search
              ? "Try a different patient name or ID."
              : "No patient records are available."}
          </p>
        </div>
      )}

      {!loading && !error && filteredPatients.length > 0 && (
        <div className="patient-list">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.patientId} patient={patient} />
          ))}
        </div>
      )}
    </section>
  );
}

export default Dashboard;
