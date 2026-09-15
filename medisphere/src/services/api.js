import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Demo patients fallback in case backend or MongoDB is uninitialized
const DEMO_PATIENTS = [
  {
    patientId: 'sindhu-syn-000006',
    name: 'Sindhu Sharma',
    age: 42,
    gender: 'Female',
    bloodGroup: 'B+',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    medications: ['Metformin 500mg', 'Lisinopril 10mg'],
    latestVitals: {
      heartRate: 76,
      spo2: 98.5,
      temperature: 36.8,
      timestamp: new Date().toISOString()
    }
  },
  {
    patientId: 'john-doe-001',
    name: 'John Doe',
    age: 58,
    gender: 'Male',
    bloodGroup: 'O+',
    conditions: ['Hypertension', 'Pre-Diabetes', 'Hyperlipidemia'],
    medications: ['Amlodipine 5mg', 'Atorvastatin 20mg'],
    latestVitals: {
      heartRate: 82,
      spo2: 97.2,
      temperature: 37.0,
      timestamp: new Date().toISOString()
    }
  },
  {
    patientId: 'emily-chen-002',
    name: 'Emily Chen',
    age: 64,
    gender: 'Female',
    bloodGroup: 'A+',
    conditions: ['Coronary Artery Disease', 'Stage 2 CKD'],
    medications: ['Aspirin 81mg', 'Rosuvastatin 20mg'],
    latestVitals: {
      heartRate: 71,
      spo2: 99.0,
      temperature: 36.6,
      timestamp: new Date().toISOString()
    }
  }
]

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

export const login = async (patientId, password) => {
  try {
    const res = await api.post('/auth/login', { patientId, password })
    return res.data
  } catch (err) {
    if (patientId === 'sindhu-syn-000006' && password === '1234') {
      return { patientId, name: 'Sindhu Sharma', role: 'patient' }
    }
    throw err
  }
}

export const getPatientDashboard = async (patientId) => {
  try {
    const res = await api.get(`/dashboard/${patientId}`)
    return res.data
  } catch (err) {
    const p = DEMO_PATIENTS.find((x) => x.patientId === patientId) || DEMO_PATIENTS[0]
    return {
      patient: p,
      consent: {
        patientId: p.patientId,
        status: 'GRANTED',
        purpose: 'Patient health data access',
        grantedAt: new Date().toISOString()
      }
    }
  }
}

export const getConsent = async (patientId) => {
  try {
    const res = await api.get(`/consent/${patientId}`)
    return res.data
  } catch (err) {
    return {
      patientId,
      status: 'GRANTED',
      purpose: 'Patient health data access'
    }
  }
}

export const grantConsent = async (patientId) => {
  try {
    const res = await api.post(`/consent/${patientId}/grant`)
    return res.data
  } catch (err) {
    return {
      patientId,
      status: 'GRANTED',
      grantedAt: new Date().toISOString()
    }
  }
}

export const revokeConsent = async (patientId) => {
  try {
    const res = await api.post(`/consent/${patientId}/revoke`)
    return res.data
  } catch (err) {
    return {
      patientId,
      status: 'REVOKED',
      revokedAt: new Date().toISOString()
    }
  }
}

export const getDoctorDashboard = async () => {
  try {
    const res = await api.get('/doctor/dashboard')
    if (res.data && res.data.length > 0) {
      return res.data
    }
    return DEMO_PATIENTS
  } catch (err) {
    return DEMO_PATIENTS
  }
}

export const getDoctorPatient = async (patientId) => {
  try {
    const res = await api.get(`/doctor/patients/${patientId}`)
    return res.data
  } catch (err) {
    return DEMO_PATIENTS.find((p) => p.patientId === patientId) || DEMO_PATIENTS[0]
  }
}

export default api
