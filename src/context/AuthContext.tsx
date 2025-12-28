import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'
import { registerAuthHandlers } from '../utils/apiClient'
import type { AuthState, Role } from '../types/auth'

type AuthContextValue = {
  isAuthenticated: boolean
  role: Role | null
  token: string | null
  authError: string | null
  login: (username: string, password: string) => Promise<Role | null>
  logout: () => void
  clearAuthError: () => void
  setAuthError: (message: string) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>(AuthService.getAuthState())
  const [authError, setAuthError] = useState<string | null>(null)

  const isAuthenticated = Boolean(authState.token)

  useEffect(() => {
    registerAuthHandlers({
      onUnauthorized: (message) => {
        setAuthState({ token: null, role: null })
        setAuthError(message)
        navigate('/login', { replace: true })
      },
      onForbidden: (message) => {
        setAuthError(message)
      }
    })
  }, [navigate])

  const login = async (username: string, password: string) => {
    const { token } = await AuthService.login(username, password)
    const role = AuthService.getRoleFromToken(token)
    if (!role) {
      setAuthError('Rôle utilisateur invalide')
      return null
    }
    AuthService.setToken(token)
    setAuthState({ token, role })
    return role
  }

  const logout = () => {
    AuthService.logout()
    setAuthState({ token: null, role: null })
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      role: authState.role,
      token: authState.token,
      authError,
      login,
      logout,
      clearAuthError: () => setAuthError(null),
      setAuthError
    }),
    [authError, authState.role, authState.token, isAuthenticated]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
