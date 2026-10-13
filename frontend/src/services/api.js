import axios from 'axios'

export const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken = null
let refreshRequest = null

export function setAccessToken(token) {
  accessToken = token
}

export function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    })
      .then(async (response) => {
        if (response.status === 204) return null

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          const error = new Error(
            typeof data.message === 'string' ? data.message : 'Your session has expired.',
          )
          error.response = { status: response.status, data }
          throw error
        }
        setAccessToken(data.accessToken)
        return data
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config
    const excluded = ['/auth/login', '/auth/setup', '/auth/refresh']
    const isAuthRequest = excluded.some((path) =>
      request?.url?.includes(path),
    )

    if (error.response?.status !== 401 || !request || isAuthRequest || request._retried) {
      return Promise.reject(error)
    }

    request._retried = true
    try {
      const session = await refreshAccessToken()
      if (!session) throw new Error('Your session has expired.')
      return api(request)
    } catch (refreshError) {
      setAccessToken(null)
      window.dispatchEvent(new Event('auth:expired'))
      return Promise.reject(refreshError)
    }
  },
)

export function getErrorMessage(error) {
  const message = error.response?.data?.message
  if (Array.isArray(message)) return message.join(' ')
  if (typeof message === 'string') return message
  if (!error.response) {
    return 'Could not reach the server. Check that the API is running and try again.'
  }
  return 'Something went wrong. Please try again.'
}
