import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'
import { useAuth } from '../context/AuthContext'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors du changement de mot de passe'
}

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const { logout, authError, setAuthError, clearAuthError } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    clearAuthError()
    try {
      await AuthService.changePassword(currentPassword, newPassword)
      logout()
      setAuthError('Mot de passe modifie, veuillez vous reconnecter')
      navigate('/login', { replace: true })
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
        <h1>Changer le mot de passe</h1>
        <label className="field">
          <span>Mot de passe actuel</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <label className="field">
          <span>Nouveau mot de passe</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </label>
        {authError && <div className="alert">{authError}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'En cours...' : 'Changer'}
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordPage
