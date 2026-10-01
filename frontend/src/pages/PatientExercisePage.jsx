import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import PatientExerciseLog from '../components/PatientExerciseLog'
import { getSession } from '../services/session'

export default function PatientExercisePage() {
  const session = getSession()
  const patientId = session?.patientId || 'sindhu-syn-000006'

  return (
    <div className="app-shell">
      <Sidebar role="patient" />
      <div className="app-main">
        <Topbar
          eyebrow="Patient Health Portal"
          title="Daily Exercise & Workout Log"
          syncing={true}
        />
        <div className="app-content">
          <PatientExerciseLog patientId={patientId} />
        </div>
      </div>
    </div>
  )
}
