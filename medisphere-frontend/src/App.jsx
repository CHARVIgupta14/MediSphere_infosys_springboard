import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PatientTwin from './pages/PatientTwin.jsx'
import FhirIntegration from './pages/FhirIntegration.jsx'
import Consent from './pages/Consent.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients/:patientId" element={<PatientTwin />} />
          <Route path="/fhir" element={<FhirIntegration />} />
          <Route path="/consent" element={<Consent />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
