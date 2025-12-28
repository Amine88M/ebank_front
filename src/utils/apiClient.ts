import axios from 'axios'
import AuthService from '../services/AuthService'

type AuthHandlers = {
  onUnauthorized?: (message: string) => void
  onForbidden?: (message: string) => void
}

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api'
})

let handlers: AuthHandlers = {}

export const registerAuthHandlers = (nextHandlers: AuthHandlers) => {
  handlers = nextHandlers
}

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Une erreur est survenue'
}

apiClient.interceptors.request.use((config) => {
  const token = AuthService.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const message = getErrorMessage(error?.response?.data)

    if (status === 401 && message.includes('Session invalide')) {
      AuthService.logout()
      handlers.onUnauthorized?.(message)
    }

    if (status === 403) {
      handlers.onForbidden?.(message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
