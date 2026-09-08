import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import './MainLayout.css'

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  )
}
