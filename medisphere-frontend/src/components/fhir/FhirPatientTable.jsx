import './FhirPatientTable.css'

function field(value) {
  return value === null || value === undefined || value === '' ? 'Not recorded' : value
}

export default function FhirPatientTable({ patients, importState, onImport }) {
  return (
    <div className="card fhir-table-wrapper">
      <table className="fhir-table">
        <thead>
          <tr>
            <th>FHIR Patient ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Birth Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const id = p?.id ?? p?.patientId
            const state = importState[id]
            return (
              <tr key={id}>
                <td>{field(id)}</td>
                <td>{field(p?.name)}</td>
                <td>{field(p?.gender)}</td>
                <td>{field(p?.birthDate)}</td>
                <td>
                  {state === 'success' ? (
                    <span className="badge badge-success">Imported</span>
                  ) : (
                    <button
                      className="btn btn-teal fhir-import-btn"
                      disabled={state === 'importing' || !id}
                      onClick={() => onImport(id)}
                    >
                      {state === 'importing' ? 'Importing...' : 'Import to MediSphere'}
                    </button>
                  )}
                  {state === 'error' && (
                    <div className="fhir-import-error">Import failed</div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
