import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function resolveErrorMessage(error) {
  if (!error) return 'Something went wrong.'

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. The backend may be slow or unavailable.'
  }

  if (error.message === 'Network Error' || !error.response) {
    return 'Cannot reach the backend. Make sure the Spring Boot server is running at http://localhost:8080.'
  }

  const status = error.response.status
  if (status === 404) return 'The requested resource was not found.'
  if (status === 400) return 'Invalid request.'
  if (status >= 500) return 'Server error occurred. Please try again later.'

  return `Request failed (status ${status}).`
}

export default api
