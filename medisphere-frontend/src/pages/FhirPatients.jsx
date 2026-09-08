import { useEffect, useState } from 'react'
import { getFhirPatients, importFhirPatient } from '../api/patientApi.js'
import { getErrorMessage } from '../utils/errorUtils.js'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'
import './FhirPatients.css'

function field(value) {
  return value === null || value === undefined || value === '' ? 'Not available' : value
}

export default function FhirPatients() {
  const [patients, setPatients] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [importState, setImportState] = useState({}) // { [id]: 'importing' | 'success' | 'error' }
  const [importErrors, setImportErrors] = useState({})

  const fetchPatients = () => {
    setStatus('loading')
    getFhirPatients()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []
        setPatients(data)
        setStatus('success')
      })
      .catch((err) => {
        setErrorMsg(getErrorMessage(err))
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
      })
      .catch((err) => {
        setImportState((prev) => ({ ...prev, [patientId]: 'error' }))
        setImportErrors((prev) => ({ ...prev, [patientId]: getErrorMessage(err) }))
      })
  }

  return (
    <div className="fhir-page">
      <div className="page-header">
        <h1>FHIR Patients</h1>
        <p className="page-subtitle">Patients available from the FHIR source</p>
      </div>

      {status === 'loading' && <Loader text="Loading FHIR patients..." />}

      {status === 'error' && (
        <ErrorMessage message={errorMsg} onRetry={fetchPatients} />
      )}

      {status === 'success' && patients.length === 0 && (
        <EmptyState message="No FHIR patients found." />
      )}

      {status === 'success' && patients.length > 0 && (
        <div className="fhir-table-wrapper">
          <table className="fhir-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Birth Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const id = p?.id ?? p?.patientId
                const state = importState[id]
                return (
                  <tr key={id}>
                    <td>{field(id)}</td>
                    <td>{field(p?.name)}</td>
                    <td>{field(p?.gender)}</td>
                    <td>{field(p?.birthDate)}</td>
                    <td>
                      {state === 'success' ? (
                        <span className="import-success">Imported ✓</span>
                      ) : (
                        <button
                          className="import-btn"
                          disabled={state === 'importing' || !id}
                          onClick={() => handleImport(id)}
                        >
                          {state === 'importing' ? 'Importing...' : 'Import'}
                        </button>
                      )}
                      {state === 'error' && (
                        <div className="import-error">{importErrors[id]}</div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
