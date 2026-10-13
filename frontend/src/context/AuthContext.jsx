import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context'
import { api, getErrorMessage, refreshAccessToken, setAccessToken } from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let active = true

    refreshAccessToken()
      .then((session) => {
        if (active && session) {
          setUser(session.user)
          setSessionError('')
        }
      })
      .catch((error) => {
        if (active && error.response?.status !== 401) {
          setSessionError(getErrorMessage(error))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    const expireSession = () => {
      setUser(null)
      setAccessToken(null)
      setSessionError('Your session ended. Please sign in again.')
    }
    window.addEventListener('auth:expired', expireSession)

    return () => {
      active = false
      window.removeEventListener('auth:expired', expireSession)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    setSessionError('')
    const { data } = await api.post('/auth/login', credentials)
    setAccessToken(data.accessToken)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      setSessionError(
        `The server could not confirm sign out. ${getErrorMessage(error)}`,
      )
      throw error
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, sessionError }),
    [user, loading, login, logout, sessionError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
