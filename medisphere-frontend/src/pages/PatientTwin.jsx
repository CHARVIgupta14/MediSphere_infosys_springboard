import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatient360 } from '../services/patientService'
import { resolveErrorMessage } from '../services/api'
import LoadingState from '../components/common/LoadingState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import TwinIdentityHeader from '../components/twin/TwinIdentityHeader.jsx'
import IdentityGrid from '../components/twin/IdentityGrid.jsx'
import VitalsSection from '../components/twin/VitalsSection.jsx'
import HealthProfile from '../components/twin/HealthProfile.jsx'
import DataFlowDiagram from '../components/twin/DataFlowDiagram.jsx'
import './PatientTwin.css'

export default function PatientTwin() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchData = () => {
    setStatus('loading')
    getPatient360(patientId)
      .then((res) => {
        setData(res.data ?? null)
        setStatus('success')
      })
      .catch((err) => {
        setErrorMsg(resolveErrorMessage(err))
        setStatus('error')
      })
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  const patientInfo = data?.patient ?? data?.patientInfo ?? data ?? null
  const conditions = data?.conditions ?? patientInfo?.conditions ?? []
  const medications = data?.medications ?? patientInfo?.medications ?? []
  const vitals = data?.latestVitals ?? data?.vitals ?? null

  return (
    <div className="patient-twin-page">
      <button className="btn btn-outline back-link" onClick={() => navigate('/dashboard')}>
        ← Back to Patients
      </button>

      {status === 'loading' && <LoadingState text="Loading Digital Twin..." />}

      {status === 'error' && <ErrorState message={errorMsg} onRetry={fetchData} />}

      {status === 'success' && !data && (
        <div className="card">
          <EmptyState message="No digital twin data available for this patient." />
        </div>
      )}

      {status === 'success' && data && (
        <div className="patient-twin-content">
          <TwinIdentityHeader name={patientInfo?.name} patientId={patientInfo?.id ?? patientInfo?.patientId ?? patientId} />

          <IdentityGrid
            age={patientInfo?.age}
            gender={patientInfo?.gender}
            bloodGroup={patientInfo?.bloodGroup ?? patientInfo?.bloodType}
            twinStatus="Active"
          />

          <VitalsSection vitals={vitals} />

          <HealthProfile conditions={conditions} medications={medications} />

          <DataFlowDiagram />
        </div>
      )}
    </div>
  )
}
