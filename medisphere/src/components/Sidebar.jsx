import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, Users, LogOut, ShieldCheck } from 'lucide-react'
import { clearSession } from '../services/session'

export default function Sidebar({ role }) {
  const navigate = useNavigate()

  function handleSignOut() {
    clearSession()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">MS</span>
        <div>
          <div className="brand-name">MediSphere</div>
          <div className="brand-tagline">Connected Care</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to={role === 'doctor' ? '/doctor' : '/patient'} className="sidebar-link">
          <Activity size={18} />
          <span>Dashboard</span>
        </NavLink>
        {role === 'doctor' && (
          <NavLink to="/doctor" className="sidebar-link">
            <Users size={18} />
            <span>Patients</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="secure-note">
          <ShieldCheck size={16} />
          <span>Secure workspace</span>
        </div>
        <button className="signout-btn" onClick={handleSignOut}>
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
