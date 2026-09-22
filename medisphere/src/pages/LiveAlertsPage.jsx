import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import AlertPanel from '../components/AlertPanel'
import { Bell, Radio, Activity } from 'lucide-react'

export default function LiveAlertsPage() {
  return (
    <div className="app-shell">
      <Sidebar role="doctor" />
      <div className="app-main">
        <Topbar
          eyebrow="Milestone 3 • Real-Time Telemetry"
          title="Clinical Alerts & Monitoring Engine"
          syncing={true}
        />
        <div className="app-content">
          <div className="summary-row" style={{ marginBottom: '20px' }}>
            <div className="summary-card">
              <Radio size={18} color="#ef4444" />
              <div>
                <div className="summary-value" style={{ color: '#ef4444' }}>Live Streaming</div>
                <div className="summary-label">Kafka Telemetry Broker</div>
              </div>
            </div>
            <div className="summary-card">
              <Activity size={18} color="#38bdf8" />
              <div>
                <div className="summary-value">Complex Event Processing</div>
                <div className="summary-label">Anomaly Rules Active</div>
              </div>
            </div>
            <div className="summary-card">
              <Bell size={18} color="#f59e0b" />
              <div>
                <div className="summary-value">Specialist Escalation</div>
                <div className="summary-label">On-Call Cardiologist Paged</div>
              </div>
            </div>
          </div>

          <AlertPanel />
        </div>
      </div>
    </div>
  )
}
