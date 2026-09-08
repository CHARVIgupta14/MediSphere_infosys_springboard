import { useEffect, useState } from 'react'
import { getFhirPatients, importFhirPatient } from '../services/fhirService'
import { resolveErrorMessage } from '../services/api'
import LoadingState from '../components/common/LoadingState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Toast from '../components/common/Toast.jsx'
import FhirFlowStrip from '../components/fhir/FhirFlowStrip.jsx'
import FhirPatientTable from '../components/fhir/FhirPatientTable.jsx'
import './FhirIntegration.css'

export default function FhirIntegration() {
  const [patients, setPatients] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [importState, setImportState] = useState({})
  const [toast, setToast] = useState(null)

  const fetchPatients = () => {
    setStatus('loading')
    getFhirPatients()
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

  const handleImport = (patientId) => {
    setImportState((prev) => ({ ...prev, [patientId]: 'importing' }))
    importFhirPatient(patientId)
      .then(() => {
        setImportState((prev) => ({ ...prev, [patientId]: 'success' }))
        setToast({ type: 'success', message: `Patient ${patientId} imported into MediSphere.` })
        fetchPatients()
      })
      .catch((err) => {
        setImportState((prev) => ({ ...prev, [patientId]: 'error' }))
        setToast({ type: 'error', message: resolveErrorMessage(err) })
      })
  }

  return (
    <div className="fhir-page">
      <FhirFlowStrip />

      {status === 'loading' && <LoadingState variant="cards" count={4} />}

      {status === 'error' && <ErrorState message={errorMsg} onRetry={fetchPatients} />}

      {status === 'success' && patients.length === 0 && (
        <div className="card">
          <EmptyState message="No FHIR patients found." />
        </div>
      )}

      {status === 'success' && patients.length > 0 && (
        <FhirPatientTable
          patients={patients}
          importState={importState}
          onImport={handleImport}
        />
      )}

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  )
}
