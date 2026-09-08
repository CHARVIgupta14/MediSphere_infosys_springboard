import axiosClient from './axiosClient.js'

export const getAllPatients = () => axiosClient.get('/api/patients')

export const getPatientById = (patientId) =>
  axiosClient.get(`/api/patients/${patientId}`)

export const getPatient360 = (patientId) =>
  axiosClient.get(`/api/patients/${patientId}/360`)

export const getFhirPatients = () => axiosClient.get('/api/fhir/patients')

export const getFhirPatientTwin = (patientId) =>
  axiosClient.get(`/api/fhir/patients/${patientId}/twin`)

export const importFhirPatient = (patientId) =>
  axiosClient.post(`/api/fhir/patients/${patientId}/import`)
