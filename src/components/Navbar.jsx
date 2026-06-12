// src/components/Navbar.jsx
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, logout } = useAuth()

  const name = profile?.displayName || user?.displayName || user?.email
  const photoURL = profile?.photoURL || user?.photoURL
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="nav-logo">⚽ WC2026 Slanic Battle</span>

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
            <Link to="/profile" className="nav-profile-link" title="Edit profile">
              <div className="nav-avatar">
                {photoURL
                  ? <img src={photoURL} alt={name} referrerPolicy="no-referrer" />
                  : initials
                }
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
            </Link>
            <button className="btn-ghost btn" onClick={logout} style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }}>
              Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
