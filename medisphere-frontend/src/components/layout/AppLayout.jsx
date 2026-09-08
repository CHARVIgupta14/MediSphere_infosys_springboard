import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopHeader from './TopHeader.jsx'
import './AppLayout.css'

const pageMeta = {
  '/dashboard': {
    title: 'MediSphere',
    subtitle: 'Healthcare Digital Twin Platform'
  },
  '/fhir': {
    title: 'FHIR Integration',
    subtitle: 'Import standardized healthcare records into MediSphere.'
  },
  '/consent': {
    title: 'Consent & Access Control',
    subtitle: 'Security and access governance for patient data.'
  }
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const path = location.pathname
  const isPatient360 = path.startsWith('/patients/')
  const meta = pageMeta[path] || (isPatient360
    ? { title: 'Digital Twin', subtitle: '' }
    : { title: 'MediSphere', subtitle: '' })

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="app-layout-main">
        <TopHeader
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setMobileOpen(true)}
        />
        <div className="app-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
