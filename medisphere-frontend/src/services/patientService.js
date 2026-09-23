const API_BASE_URL = "http://localhost:8080";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep the default message when the response is not JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

export function getPatients() {
  return request("/api/patients");
}

export function getPatient360(patientId) {
  return request(`/api/patients/${encodeURIComponent(patientId)}/360`);
}

export function getAlerts() {
  return request("/api/alerts");
}

export function getActiveAlerts() {
  return request("/api/alerts/active");
}

export function acknowledgeAlert(alertId, doctorName = "Dr. Robert Hayes (Cardiologist)") {
  return request(`/api/alerts/${encodeURIComponent(alertId)}/acknowledge?doctorName=${encodeURIComponent(doctorName)}`, {
    method: "POST",
  });
}

export function simulateAnomaly(patientId = "john-doe-001", heartRate = 145) {
  return request(`/api/alerts/simulate?patientId=${encodeURIComponent(patientId)}&heartRate=${heartRate}`, {
    method: "POST",
  });
}

