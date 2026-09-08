export function getErrorMessage(error) {
  if (!error) return 'Something went wrong.'

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. The backend may be slow or unavailable.'
  }

  if (error.message === 'Network Error' || !error.response) {
    return 'Cannot reach the backend server. Please make sure it is running at http://localhost:8080.'
  }

  const status = error.response.status
  if (status === 404) return 'Requested data was not found.'
  if (status >= 500) return 'Server error occurred. Please try again later.'
  if (status === 400) return 'Invalid request.'

  return `Request failed (status ${status}).`
}
