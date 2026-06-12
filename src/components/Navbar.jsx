// src/components/Navbar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="nav-logo">⚽ WC 2026</span>

        {user && (
          <div className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Matches
            </NavLink>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              Leaderboard
            </NavLink>
          </div>
        )}

        {user && (
          <div className="nav-user">
            <div className="nav-avatar">
              {user.photoURL
                ? <img src={user.photoURL} alt={user.displayName} referrerPolicy="no-referrer" />
                : initials
              }
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.displayName || user.email}
            </span>
            <button className="btn-ghost btn" onClick={logout} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
              Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
