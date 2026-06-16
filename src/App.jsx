// src/App.jsx
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { maybeAutoSyncFixtures } from './lib/matchSync'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import AuthPage from './pages/AuthPage'
import MatchesPage from './pages/MatchesPage'
import PredictionsPage from './pages/PredictionsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!user) return <Navigate to="/auth" replace />
  if (!profile?.admin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { profile } = useAuth()

  // Keep the kickoff times in Firestore fresh just by an admin using the app.
  // Throttled internally, denied silently for non-admins — no cron needed.
  useEffect(() => {
    if (profile?.admin) maybeAutoSyncFixtures()
  }, [profile?.admin])

  return (
    <div className="app-layout">
      <Navbar />
      <Toast />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<PrivateRoute><MatchesPage /></PrivateRoute>} />
        <Route path="/predictions" element={<PrivateRoute><PredictionsPage /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
