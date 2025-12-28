import apiClient from '../utils/apiClient'
import type { AuthState, LoginResponse, Role } from '../types/auth'

const TOKEN_KEY = 'token'

const getToken = () => localStorage.getItem(TOKEN_KEY)

const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

const decodeTokenPayload = (token: string) => {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null
    const decoded = atob(payloadPart.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as Record<string, unknown>
  } catch {
    return null
  }
}

const normalizeRole = (value: string) => {
  const cleaned = value.startsWith('ROLE_') ? value.slice(5) : value
  if (cleaned === 'AGENT_GUICHET' || cleaned === 'CLIENT') {
    return cleaned as Role
  }
  return null
}

const extractRole = (payload: Record<string, unknown> | null): Role | null => {
  if (!payload) return null

  const direct = payload.role ?? payload.roles ?? payload.authorities ?? payload.authority
  if (Array.isArray(direct)) {
    const first = direct.find((entry) => typeof entry === 'string') as string | undefined
    return first ? normalizeRole(first) : null
  }

  if (typeof direct === 'string') {
    return normalizeRole(direct)
  }

  return null
}

const getRoleFromToken = (token: string): Role | null => {
  const payload = decodeTokenPayload(token)
  return extractRole(payload)
}

const getUsernameFromToken = (token: string | null) => {
  if (!token) {
    return null
  }

  const payload = decodeTokenPayload(token)
  if (!payload) {
    return null
  }

  const subject = payload.sub
  if (typeof subject === 'string' && subject) {
    return subject
  }

  const username = payload.username
  if (typeof username === 'string' && username) {
    return username
  }

  return null
}

const login = async (username: string, password: string) => {
  const response = await apiClient.post<LoginResponse>('/auth/login', { username, password })
  return response.data
}

const changePassword = async (currentPassword: string, newPassword: string) => {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword })
}

const getAuthState = (): AuthState => {
  const token = getToken()
  if (!token) {
    return { token: null, role: null }
  }

  const role = getRoleFromToken(token)
  if (!role) {
    setToken(null)
    return { token: null, role: null }
  }

  return { token, role }
}

const logout = () => {
  setToken(null)
}

const AuthService = {
  TOKEN_KEY,
  getToken,
  setToken,
  getRoleFromToken,
  getUsernameFromToken,
  getAuthState,
  login,
  changePassword,
  logout
}

export default AuthService
