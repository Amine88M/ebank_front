import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur de connexion'
}

const LoginPage = () => {
  const navigate = useNavigate()
  const { login, authError, clearAuthError, setAuthError } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    return () => {
      clearAuthError()
    }
  }, [clearAuthError])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    clearAuthError()
    try {
      const role = await login(username, password)
      if (role === 'AGENT_GUICHET') {
        navigate('/agent', { replace: true })
        return
      }
      if (role === 'CLIENT') {
        navigate('/client', { replace: true })
        return
      }
      setAuthError('Rôle utilisateur invalide')
    } catch (error: any) {
      const message = getErrorMessage(error?.response?.data)
      setAuthError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page">
      <form className="panel" onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {authError && <div className="alert">{authError}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

export default LoginPage
