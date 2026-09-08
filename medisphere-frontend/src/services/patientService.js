import api from './api'

export const getAllPatients = () => api.get('/api/patients')

export const getPatientById = (patientId) =>
  api.get(`/api/patients/${patientId}`)

export const getPatient360 = (patientId) =>
  api.get(`/api/patients/${patientId}/360`)
