import { NavLink } from 'react-router-dom'
import { useBackendStatus } from '../../hooks/useBackendStatus'
import './Sidebar.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/dashboard', label: 'Patients' },
  { to: '/fhir', label: 'FHIR Integration' },
  { to: '/consent', label: 'Consent & Access' }
]

const statusLabel = {
  checking: 'Checking...',
  connected: 'Connected',
  disconnected: 'Disconnected'
}

export default function Sidebar({ mobileOpen, onClose }) {
  const backendStatus = useBackendStatus()

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">M</div>
          <div>
            <div className="sidebar-brand-name">MEDISPHERE</div>
            <div className="sidebar-brand-sub">Healthcare Digital Twin</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => (
            <NavLink
              key={item.label + idx}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'sidebar-link sidebar-link-active' : 'sidebar-link'
              }
              end={item.to === '/dashboard'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-status">
          <div className="sidebar-status-label">Backend Status</div>
          <div className={`sidebar-status-value status-${backendStatus}`}>
            <span className="status-dot" />
            {statusLabel[backendStatus]}
          </div>
        </div>
      </aside>
    </>
  )
}
