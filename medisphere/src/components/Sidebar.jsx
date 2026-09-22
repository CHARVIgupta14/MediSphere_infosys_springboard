import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Activity, Users, LogOut, ShieldCheck, Cpu, Bell } from 'lucide-react'
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
        <NavLink to={role === 'doctor' ? '/doctor' : '/patient'} end className="sidebar-link">
          <Activity size={18} />
          <span>Dashboard</span>
        </NavLink>
        {role === 'doctor' && (
          <NavLink to="/doctor/patients" className="sidebar-link">
            <Users size={18} />
            <span>Patients</span>
          </NavLink>
        )}
        {role === 'doctor' && (
          <NavLink to="/doctor/alerts" className="sidebar-link">
            <Bell size={18} />
            <span>Telemetry & Alerts</span>
          </NavLink>
        )}
        <NavLink to="/risk-prediction" className="sidebar-link">
          <Cpu size={18} />
          <span>AI Risk Engine</span>
        </NavLink>
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
