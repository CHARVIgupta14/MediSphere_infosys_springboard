import React from 'react'
import { Pill } from 'lucide-react'
import { itemLabel, itemDetail } from '../utils/clinicalItems'

export default function PrescriptionList({ medications }) {
  const list = Array.isArray(medications) ? medications.filter((m) => m !== null && m !== undefined) : []

  if (list.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No prescriptions on file.</p>
        <p>Medications recorded in the patient's FHIR profile will appear here.</p>
      </div>
    )
  }

  return (
    <div className="clinical-list">
      {list.map((item, idx) => (
        <div className="clinical-item" key={idx}>
          <Pill size={16} />
          <div>
            <div className="clinical-item-label">{itemLabel(item)}</div>
            {itemDetail(item) && <div className="clinical-item-detail">{itemDetail(item)}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
