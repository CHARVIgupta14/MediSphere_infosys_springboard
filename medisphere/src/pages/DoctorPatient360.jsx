import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import Tabs from '../components/Tabs'
import PatientDetails from '../components/PatientDetails'
import CarePlanList from '../components/CarePlanList'
import PrescriptionList from '../components/PrescriptionList'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { getDoctorPatient, getErrorMessage } from '../services/api'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'careplan', label: 'Care plan' },
  { id: 'prescriptions', label: 'Prescriptions' },
]

export default function DoctorPatient360() {
  const { patientId } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const firstLoad = useRef(true)

  const load = useCallback(async () => {
    try {
      const result = await getDoctorPatient(patientId)
      setPatient(result)
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      if (firstLoad.current) {
        setLoading(false)
        firstLoad.current = false
      }
    }
  }, [patientId])

  useEffect(() => {
    setLoading(true)
    firstLoad.current = true
    setPatient(null)
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [load])

  return (
    <div className="app-shell">
      <Sidebar role="doctor" />
      <div className="app-main">
        <Topbar
          eyebrow="Clinical workspace"
          title={patient?.name ? patient.name : 'Patient 360'}
          syncing={!loading && !error}
        />
        <div className="app-content">
          <button className="back-link" type="button" onClick={() => navigate('/doctor')}>
            <ArrowLeft size={16} />
            Back to all patients
          </button>

          {loading ? (
            <Loading label="Loading patient..." />
          ) : error && !patient ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              <Tabs tabs={TABS} active={tab} onChange={setTab} />

              {tab === 'overview' && <PatientDetails patient={patient} loading={false} error="" />}

              {tab === 'careplan' && (
                <div className="panel">
                  <div className="panel-head">
                    <h2>Care plan</h2>
                  </div>
                  <CarePlanList conditions={patient?.conditions} />
                </div>
              )}

              {tab === 'prescriptions' && (
                <div className="panel">
                  <div className="panel-head">
                    <h2>Prescriptions</h2>
                  </div>
                  <PrescriptionList medications={patient?.medications} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
