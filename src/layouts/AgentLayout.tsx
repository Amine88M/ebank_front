import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AgentLayout = () => {
  const { logout, authError, clearAuthError } = useAuth()

  return (
    <div className="page">
      <div className="panel wide">
        <header className="panel-header">
          <div>
            <h1>Espace Agent</h1>
            <p>Acces reserve au role AGENT_GUICHET.</p>
          </div>
          <div className="panel-actions">
            <NavLink to="/change-password" className="link-button" onClick={clearAuthError}>
              Changer le mot de passe
            </NavLink>
            <button type="button" onClick={logout}>
              Se deconnecter
            </button>
          </div>
        </header>
        <nav className="subnav">
          <NavLink
            to="/agent"
            end
            onClick={clearAuthError}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Accueil
          </NavLink>
          <NavLink
            to="/agent/create-customer"
            onClick={clearAuthError}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Ajouter client
          </NavLink>
          <NavLink
            to="/agent/create-account"
            onClick={clearAuthError}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Nouveau compte
          </NavLink>
          <NavLink
            to="/agent/lists"
            onClick={clearAuthError}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Listes
          </NavLink>
          <NavLink
            to="/agent/card"
            onClick={clearAuthError}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Carte
          </NavLink>
        </nav>
        {authError && <div className="alert">{authError}</div>}
        <Outlet />
      </div>
    </div>
  )
}

export default AgentLayout
