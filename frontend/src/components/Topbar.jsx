import React from 'react'

export default function Topbar({ eyebrow, title, syncing }) {
  return (
    <header className="topbar">
      <div>
        <p className="topbar-eyebrow">{eyebrow}</p>
        <h1 className="topbar-title">{title}</h1>
      </div>
      {syncing !== undefined && (
        <div className={`sync-pill ${syncing ? 'is-live' : 'is-idle'}`}>
          <span className="dot" />
          {syncing ? 'Data syncing' : 'Connecting...'}
        </div>
      )}
    </header>
  )
}
