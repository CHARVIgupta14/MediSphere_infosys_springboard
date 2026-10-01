import React from 'react'

export default function ConsentCard({ consent, onGrant, onRevokeClick, busy }) {
  const status = consent?.status || 'NOT_GRANTED'
  const granted = status === 'GRANTED'

  const label =
    status === 'GRANTED'
      ? 'Consent granted'
      : status === 'REVOKED'
      ? 'Consent revoked'
      : 'Consent not granted'

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Data consent</h2>
      </div>
      <p className="panel-subtext">Control access to your health data.</p>

      <div className={`consent-status ${granted ? 'granted' : 'revoked'}`}>
        <span className="dot" />
        <div>
          <div className="consent-status-label">{label}</div>
          <div className="consent-purpose">{consent?.purpose || 'Patient health data access'}</div>
        </div>
      </div>

      {granted ? (
        <button className="btn btn-danger" onClick={onRevokeClick} disabled={busy}>
          Revoke consent
        </button>
      ) : (
        <button className="btn btn-primary" onClick={onGrant} disabled={busy}>
          Grant consent
        </button>
      )}
    </div>
  )
}
