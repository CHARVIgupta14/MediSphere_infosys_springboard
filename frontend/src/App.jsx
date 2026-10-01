import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorPatientsPage from './pages/DoctorPatientsPage'
import DoctorPatient360 from './pages/DoctorPatient360'
import RiskPredictionDashboard from './pages/RiskPredictionDashboard'
import LiveAlertsPage from './pages/LiveAlertsPage'
import CarePlanDashboardPage from './pages/CarePlanDashboardPage'
import PatientMedicinePage from './pages/PatientMedicinePage'
import PatientExercisePage from './pages/PatientExercisePage'
import PatientCarePlanPage from './pages/PatientCarePlanPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/patient"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/medicine"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientMedicinePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/exercise"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientExercisePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/careplan"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientCarePlanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorPatientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/alerts"
        element={
          <ProtectedRoute requiredRole="doctor">
            <LiveAlertsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/careplans"
        element={
          <ProtectedRoute requiredRole="doctor">
            <CarePlanDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:patientId"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorPatient360 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/risk-prediction"
        element={
          <ProtectedRoute requiredRole="doctor">
            <RiskPredictionDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/risk-prediction"
        element={<RiskPredictionDashboard />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
