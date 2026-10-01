import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import CarePlanManager from '../components/CarePlanManager'
import { getSession } from '../services/session'

export default function PatientCarePlanPage() {
  const session = getSession()
  const patientId = session?.patientId || 'sindhu-syn-000006'

  return (
    <div className="app-shell">
      <Sidebar role="patient" />
      <div className="app-main">
        <Topbar
          eyebrow="Personalized Health Management"
          title="My Clinical Care Plan"
          syncing={true}
        />
        <div className="app-content">
          <CarePlanManager patientId={patientId} isDoctor={false} />
        </div>
      </div>
    </div>
  )
}
