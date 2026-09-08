import React from 'react'
import { ClipboardList } from 'lucide-react'
import { itemLabel, itemDetail } from '../utils/clinicalItems'

export default function CarePlanList({ conditions }) {
  const list = Array.isArray(conditions) ? conditions.filter((c) => c !== null && c !== undefined) : []

  if (list.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">No active care plan items.</p>
        <p>Conditions recorded in the patient's FHIR profile will appear here.</p>
      </div>
    )
  }

  return (
    <div className="clinical-list">
      {list.map((item, idx) => (
        <div className="clinical-item" key={idx}>
          <ClipboardList size={16} />
          <div>
            <div className="clinical-item-label">{itemLabel(item)}</div>
            {itemDetail(item) && <div className="clinical-item-detail">{itemDetail(item)}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}
