import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import './AgentLayout.css'

const AgentLayout = () => {
  const { logout, authError, clearAuthError } = useAuth()
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <div className="agent-page">

      {/* ===== FIXED NAVBAR ===== */}
      <header className="top-navbar">

        {/* LEFT : BRAND */}
        <div className="navbar-left">
          <span className="brand-text">IBanque</span>
        </div>

        {/* CENTER : NAV LINKS */}
        <nav className="navbar-center">
          <NavLink to="/agent" end className="nav-link">
            Accueil
          </NavLink>

          <NavLink to="/agent/create-customer" className="nav-link">
            Ajouter client
          </NavLink>

          <NavLink to="/agent/create-account" className="nav-link">
            Nouveau compte
          </NavLink>

          <NavLink to="/agent/lists" className="nav-link">
            Listes
          </NavLink>

          <NavLink to="/agent/card" className="nav-link">
            Carte
          </NavLink>
        </nav>

        {/* RIGHT : USER MENU */}
        <div className="navbar-right">
          <button
            className="user-button"
            onClick={() => setOpenMenu(!openMenu)}
          >
            Moi ▾
          </button>

          {openMenu && (
            <div className="user-menu">
              <NavLink
                to="/change-password"
                className="menu-item"
                onClick={() => {
                  setOpenMenu(false)
                  clearAuthError()
                }}
              >
                Changer mot de passe
              </NavLink>

              <button className="menu-item" onClick={logout}>
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="agent-content-wrapper">
        {authError && <div className="alert">{authError}</div>}
        <Outlet />
      </main>

    </div>
  )
}

export default AgentLayout
