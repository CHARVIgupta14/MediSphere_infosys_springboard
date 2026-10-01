import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import PatientMedicineLog from '../components/PatientMedicineLog'
import { getSession } from '../services/session'

export default function PatientMedicinePage() {
  const session = getSession()
  const patientId = session?.patientId || 'sindhu-syn-000006'

  return (
    <div className="app-shell">
      <Sidebar role="patient" />
      <div className="app-main">
        <Topbar
          eyebrow="Patient Health Portal"
          title="Daily Medicine Log & Prescriptions"
          syncing={true}
        />
        <div className="app-content">
          <PatientMedicineLog patientId={patientId} />
        </div>
      </div>
    </div>
  )
}
