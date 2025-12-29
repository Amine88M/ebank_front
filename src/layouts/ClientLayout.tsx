import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import './ClientLayout.css'
import logo from '../assets/logo.png'


const ClientLayout = () => {
  const { logout, authError, clearAuthError } = useAuth()
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <div className="client-page">

      {/* ===== FIXED NAVBAR ===== */}
      <header className="top-navbar">

        {/* LEFT : LOGO */}
    <div className="navbar-left">
  <span className="brand-text">IBanque</span>
</div>



        {/* RIGHT : NAV LINKS */}
        <nav className="navbar-center">
          <NavLink to="/client" end className="nav-link">
          Accueil
          </NavLink>

          <NavLink to="/client/transfer" className="nav-link">
            Nouveau virement
          </NavLink>

          <NavLink to="/client/transactions" className="nav-link">
            Transactions
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

              <button
                className="menu-item"
                onClick={logout}
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="client-content-wrapper">
        {authError && <div className="alert">{authError}</div>}
        <Outlet />
      </main>

    </div>
  )
}

export default ClientLayout
