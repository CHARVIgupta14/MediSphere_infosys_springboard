import { useEffect, useState } from 'react'
import { getAllPatients } from '../services/patientService'
import { resolveErrorMessage } from '../services/api'
import StatCard from '../components/dashboard/StatCard.jsx'
import PatientCard from '../components/dashboard/PatientCard.jsx'
import LoadingState from '../components/common/LoadingState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import './Dashboard.css'

function computeStats(patients) {
  if (!Array.isArray(patients) || patients.length === 0) {
    return { total: null, fhirRecords: null, twins: null, vitalsAvailable: null }
  }

  const total = patients.length

  const twins = patients.filter((p) => p?.twinAvailable ?? p?.hasTwin ?? false).length
  const hasAnyTwinField = patients.some(
    (p) => p?.twinAvailable !== undefined || p?.hasTwin !== undefined
  )

  const vitalsAvailable = patients.filter((p) => p?.latestVitals ?? p?.vitals ?? false).length
  const hasAnyVitalsField = patients.some(
    (p) => p?.latestVitals !== undefined || p?.vitals !== undefined
  )

  return {
    total,
    fhirRecords: null,
    twins: hasAnyTwinField ? twins : null,
    vitalsAvailable: hasAnyVitalsField ? vitalsAvailable : null
  }
}

export default function Dashboard() {
  const [patients, setPatients] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchPatients = () => {
    setStatus('loading')
    getAllPatients()
      .then((res) => {
        setPatients(Array.isArray(res.data) ? res.data : [])
        setStatus('success')
      })
      .catch((err) => {
        setErrorMsg(resolveErrorMessage(err))
        setStatus('error')
      })
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const stats = computeStats(patients)

  return (
    <div className="dashboard-page">
      <section className="stat-grid">
        <StatCard label="Total Patients" value={stats.total} />
        <StatCard label="FHIR Records" value={stats.fhirRecords} accent="teal" />
        <StatCard label="Digital Twins" value={stats.twins} />
        <StatCard label="Vitals Available" value={stats.vitalsAvailable} accent="teal" />
      </section>

      <section className="patient-registry">
        <h2 className="section-title">Patient Registry</h2>

        {status === 'loading' && <LoadingState variant="cards" count={6} />}

        {status === 'error' && <ErrorState message={errorMsg} onRetry={fetchPatients} />}

        {status === 'success' && patients.length === 0 && (
          <EmptyState message="No patients found in the registry." />
        )}

        {status === 'success' && patients.length > 0 && (
          <div className="patient-grid">
            {patients.map((p) => (
              <PatientCard key={p.id ?? p.patientId} patient={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
