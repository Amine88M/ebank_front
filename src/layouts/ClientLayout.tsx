import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ClientLayout = () => {
  const { logout, authError, clearAuthError } = useAuth()

  return (
    <div className="page">
      <div className="panel wide">
        <header className="panel-header">
          <div>
            <h1>Espace Client</h1>
            <p>Acces reserve au role CLIENT.</p>
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
            to="/client"
            end
            onClick={clearAuthError}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Tableau de bord
          </NavLink>
          <NavLink
            to="/client/transfer"
            onClick={clearAuthError}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            Nouveau virement
          </NavLink>
        </nav>
        {authError && <div className="alert">{authError}</div>}
        <Outlet />
      </div>
    </div>
  )
}

export default ClientLayout
