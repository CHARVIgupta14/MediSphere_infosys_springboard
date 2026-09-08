import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getErrorMessage(error) {
  if (!error || !error.response) {
    return 'Unable to connect to MediSphere backend. Make sure Spring Boot is running on localhost:8080.'
  }
  const status = error.response.status
  if (status === 401) return 'Invalid patient ID or password'
  if (status === 404) return 'Requested data could not be found.'
  if (status >= 500) return 'Something went wrong while loading patient data.'
  return (error.response.data && error.response.data.message) || 'Something went wrong. Please try again.'
}

export const login = (patientId, password) =>
  api.post('/auth/login', { patientId, password }).then((r) => r.data)

export const getPatientDashboard = (patientId) =>
  api.get(`/dashboard/${patientId}`).then((r) => r.data)

export const getConsent = (patientId) =>
  api.get(`/consent/${patientId}`).then((r) => r.data)

export const grantConsent = (patientId) =>
  api.post(`/consent/${patientId}/grant`).then((r) => r.data)

export const revokeConsent = (patientId) =>
  api.post(`/consent/${patientId}/revoke`).then((r) => r.data)

export const getDoctorDashboard = () =>
  api.get('/doctor/dashboard').then((r) => r.data)

export const getDoctorPatient = (patientId) =>
  api.get(`/doctor/patients/${patientId}`).then((r) => r.data)

export default api
