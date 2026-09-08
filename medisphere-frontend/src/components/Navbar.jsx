import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">MediSphere</div>
      <nav className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/fhir"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          FHIR Patients
        </NavLink>
        <NavLink
          to="/consent"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          Consent
        </NavLink>
      </nav>
    </header>
  )
}
