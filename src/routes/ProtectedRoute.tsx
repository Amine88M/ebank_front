import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/auth'
import AccessDenied from '../components/AccessDenied'

type ProtectedRouteProps = {
  requiredRole?: Role
  children: React.ReactElement
}

const ProtectedRoute = ({ requiredRole, children }: ProtectedRouteProps) => {
  const { isAuthenticated, role, authError } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <AccessDenied message={authError} />
  }

  return children
}

export default ProtectedRoute
