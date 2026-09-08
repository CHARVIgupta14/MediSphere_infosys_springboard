import api from './api'

export const getFhirPatients = () => api.get('/api/fhir/patients')

export const getFhirPatientTwin = (patientId) =>
  api.get(`/api/fhir/patients/${patientId}/twin`)

export const importFhirPatient = (patientId) =>
  api.post(`/api/fhir/patients/${patientId}/import`)
