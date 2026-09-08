import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPatient360 } from '../api/patientApi.js'
import { getErrorMessage } from '../utils/errorUtils.js'
import Loader from '../components/Loader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EmptyState from '../components/EmptyState.jsx'
import './Patient360.css'

function field(value) {
  return value === null || value === undefined || value === '' ? 'Not available' : value
}

export default function Patient360() {
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
        setErrorMsg(getErrorMessage(err))
        setStatus('error')
      })
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  const patientInfo = data?.patient ?? data?.patientInfo ?? data ?? null
  const conditions = data?.conditions ?? []
  const medications = data?.medications ?? []
  const vitals = data?.latestVitals ?? data?.vitals ?? null

  return (
    <div className="patient360-page">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Back to Dashboard
      </button>

      <div className="page-header">
        <h1>Patient 360</h1>
        <p className="page-subtitle">Patient ID: {patientId}</p>
      </div>

      {status === 'loading' && <Loader text="Loading patient 360 view..." />}

      {status === 'error' && (
        <ErrorMessage message={errorMsg} onRetry={fetchData} />
      )}

      {status === 'success' && !data && <EmptyState message="No data available for this patient." />}

      {status === 'success' && data && (
        <div className="p360-grid">
          <section className="p360-card">
            <h2>Patient Information</h2>
            <div className="info-row">
              <span>Name</span>
              <span>{field(patientInfo?.name)}</span>
            </div>
            <div className="info-row">
              <span>Age</span>
              <span>{field(patientInfo?.age)}</span>
            </div>
            <div className="info-row">
              <span>Gender</span>
              <span>{field(patientInfo?.gender)}</span>
            </div>
            <div className="info-row">
              <span>ID</span>
              <span>{field(patientInfo?.id ?? patientInfo?.patientId ?? patientId)}</span>
            </div>
          </section>

          <section className="p360-card">
            <h2>Conditions</h2>
            {conditions.length === 0 ? (
              <EmptyState message="No conditions recorded." />
            ) : (
              <ul className="list-block">
                {conditions.map((c, idx) => (
                  <li key={idx}>{typeof c === 'string' ? c : field(c?.name ?? c?.condition)}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="p360-card">
            <h2>Medications</h2>
            {medications.length === 0 ? (
              <EmptyState message="No medications recorded." />
            ) : (
              <ul className="list-block">
                {medications.map((m, idx) => (
                  <li key={idx}>{typeof m === 'string' ? m : field(m?.name ?? m?.medication)}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="p360-card">
            <h2>Latest Vitals</h2>
            {!vitals ? (
              <EmptyState message="No vitals recorded." />
            ) : (
              <div className="vitals-grid">
                <div className="info-row">
                  <span>Blood Pressure</span>
                  <span>{field(vitals?.bloodPressure)}</span>
                </div>
                <div className="info-row">
                  <span>Heart Rate</span>
                  <span>{field(vitals?.heartRate)}</span>
                </div>
                <div className="info-row">
                  <span>Temperature</span>
                  <span>{field(vitals?.temperature)}</span>
                </div>
                <div className="info-row">
                  <span>SpO2</span>
                  <span>{field(vitals?.spo2)}</span>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
