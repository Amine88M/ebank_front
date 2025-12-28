import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import AgentLayout from './layouts/AgentLayout'
import ClientLayout from './layouts/ClientLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import AgentHomePage from './pages/agent/AgentHomePage'
import CreateCustomerPage from './pages/agent/CreateCustomerPage'
import CreateAccountPage from './pages/agent/CreateAccountPage'
import AgentListsPage from './pages/agent/AgentListsPage'
import ClientDashboardPage from './pages/client/ClientDashboardPage'
import ClientTransferPage from './pages/client/ClientTransferPage'

const HomeRedirect = () => {
  const { role, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role === 'AGENT_GUICHET') {
    return <Navigate to="/agent" replace />
  }

  if (role === 'CLIENT') {
    return <Navigate to="/client" replace />
  }

  return <Navigate to="/login" replace />
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent"
        element={
          <ProtectedRoute requiredRole="AGENT_GUICHET">
            <AgentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AgentHomePage />} />
        <Route path="create-customer" element={<CreateCustomerPage />} />
        <Route path="create-account" element={<CreateAccountPage />} />
        <Route path="lists" element={<AgentListsPage />} />
      </Route>
      <Route
        path="/client"
        element={
          <ProtectedRoute requiredRole="CLIENT">
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboardPage />} />
        <Route path="transfer" element={<ClientTransferPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
