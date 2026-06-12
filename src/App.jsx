// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import AuthPage from './pages/AuthPage'
import MatchesPage from './pages/MatchesPage'
import LeaderboardPage from './pages/LeaderboardPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <Toast />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
