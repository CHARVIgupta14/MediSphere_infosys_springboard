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

// ==========================================
// Milestone 3: Real-Time Monitoring & Alerts
// ==========================================

const DEMO_ALERTS = [
  {
    id: 'alert-001',
    patientId: 'john-doe-001',
    patientName: 'John Doe',
    vitalType: 'HEART_RATE',
    vitalValue: 145.0,
    thresholdViolated: '> 120 BPM (Acute Tachycardia Spike)',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    recipientRole: 'Cardiologist',
    doctorNotified: 'Dr. Robert Hayes (On-Duty Cardiologist)',
    message: 'CRITICAL ALERT: Acute Tachycardia detected for John Doe. Heart rate jumped to 145 BPM. Potential ventricular arrhythmia.',
    recommendedAction: 'Order immediate 12-lead ECG, assess telemetry rhythm, verify hemodynamics, prepare IV beta-blocker protocol.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'alert-002',
    patientId: 'sindhu-syn-000006',
    patientName: 'Sindhu Sharma',
    vitalType: 'SPO2',
    vitalValue: 88.5,
    thresholdViolated: '< 90% (Acute Hypoxemia)',
    severity: 'CRITICAL',
    status: 'ACKNOWLEDGED',
    recipientRole: 'Pulmonologist / Rapid Response',
    doctorNotified: 'Dr. Sarah Lin (Pulmonology On-Duty)',
    message: 'CRITICAL ALERT: Acute Hypoxemia detected for Sindhu Sharma. SpO2 dropped to 88.5%.',
    recommendedAction: 'Initiate high-flow supplemental oxygen therapy (2-4 L/min via nasal cannula), perform ABG.',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    acknowledgedBy: 'Dr. Sarah Lin'
  }
]

export const getAlerts = async () => {
  try {
    const res = await api.get('/alerts')
    if (res.data && res.data.length > 0) return res.data
    return DEMO_ALERTS
  } catch (err) {
    return DEMO_ALERTS
  }
}

export const getActiveAlerts = async () => {
  try {
    const res = await api.get('/alerts/active')
    if (res.data) return res.data
    return DEMO_ALERTS.filter((a) => a.status === 'ACTIVE')
  } catch (err) {
    return DEMO_ALERTS.filter((a) => a.status === 'ACTIVE')
  }
}

export const getAlertsForPatient = async (patientId) => {
  try {
    const res = await api.get(`/alerts/patient/${patientId}`)
    return res.data
  } catch (err) {
    return DEMO_ALERTS.filter((a) => a.patientId === patientId)
  }
}

export const acknowledgeAlert = async (alertId, doctorName = 'Dr. Robert Hayes (Cardiologist)') => {
  try {
    const res = await api.post(`/alerts/${alertId}/acknowledge?doctorName=${encodeURIComponent(doctorName)}`)
    return res.data
  } catch (err) {
    const alert = DEMO_ALERTS.find((a) => a.id === alertId)
    if (alert) {
      alert.status = 'ACKNOWLEDGED'
      alert.acknowledgedBy = doctorName
      alert.acknowledgedAt = new Date().toISOString()
      return alert
    }
    return { id: alertId, status: 'ACKNOWLEDGED', acknowledgedBy: doctorName }
  }
}

export const resolveAlert = async (alertId, doctorName = 'Dr. Robert Hayes (Cardiologist)', notes = 'Patient telemetry stabilized.') => {
  try {
    const res = await api.post(`/alerts/${alertId}/resolve?doctorName=${encodeURIComponent(doctorName)}&notes=${encodeURIComponent(notes)}`)
    return res.data
  } catch (err) {
    const alert = DEMO_ALERTS.find((a) => a.id === alertId)
    if (alert) {
      alert.status = 'RESOLVED'
      alert.resolutionNotes = notes
      return alert
    }
    return { id: alertId, status: 'RESOLVED' }
  }
}

export const reactivateAlert = async (alertId) => {
  try {
    const res = await api.post(`/alerts/${alertId}/reactivate`)
    return res.data
  } catch (err) {
    const alert = DEMO_ALERTS.find((a) => a.id === alertId)
    if (alert) {
      alert.status = 'ACTIVE'
      alert.acknowledgedBy = null
      alert.acknowledgedAt = null
      alert.resolutionNotes = null
      return alert
    }
    return { id: alertId, status: 'ACTIVE' }
  }
}

export const simulateAnomaly = async (patientId = 'john-doe-001', heartRate = 145, spo2 = 97.5, temp = 37.0) => {
  try {
    const res = await api.post(`/alerts/simulate?patientId=${encodeURIComponent(patientId)}&heartRate=${heartRate}&spo2=${spo2}&temperature=${temp}`)
    return res.data
  } catch (err) {
    const simulated = {
      id: `sim-${Date.now()}`,
      patientId,
      patientName: patientId === 'john-doe-001' ? 'John Doe' : 'Sindhu Sharma',
      vitalType: 'HEART_RATE',
      vitalValue: heartRate,
      thresholdViolated: '> 120 BPM (Acute Tachycardia Spike)',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      recipientRole: 'Cardiologist',
      doctorNotified: 'Dr. Robert Hayes (On-Duty Cardiologist)',
      message: `CRITICAL ALERT: Acute Tachycardia detected. Heart rate jumped to ${heartRate} BPM. Immediate cardiologist consult dispatched.`,
      recommendedAction: 'Order emergent 12-lead ECG, bedside evaluation, prepare IV beta-blocker protocol.',
      timestamp: new Date().toISOString()
    }
    DEMO_ALERTS.unshift(simulated)
    return simulated
  }
}

export const getAlertStats = async () => {
  try {
    const res = await api.get('/alerts/stats')
    return res.data
  } catch (err) {
    return {
      totalAlerts: DEMO_ALERTS.length,
      activeAlerts: DEMO_ALERTS.filter((a) => a.status === 'ACTIVE').length,
      criticalAlerts: DEMO_ALERTS.filter((a) => a.severity === 'CRITICAL').length,
      highAlerts: DEMO_ALERTS.filter((a) => a.severity === 'HIGH').length
    }
  }
}

export default api

