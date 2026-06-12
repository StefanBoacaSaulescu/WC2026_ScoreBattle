// src/pages/AuthPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect to the matches page once auth state confirms a logged-in user.
  // Driving this off `user` (rather than navigating right after the login call)
  // avoids racing the onAuthStateChanged listener and bouncing off PrivateRoute.
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  function setField(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      // Redirect handled by the user-state effect above.
    } catch (err) {
      console.error('Google sign-in failed:', err)
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await loginWithEmail(form.email, form.password)
      } else {
        if (!form.name.trim()) throw { code: 'no-name' }
        await registerWithEmail(form.email, form.password, form.name.trim())
      }
      // Redirect handled by the user-state effect above.
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">⚽ WC 2026</div>
        <p className="auth-tagline">Predict every match. Top the leaderboard.</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Register
          </button>
        </div>

        <button className="btn-google" onClick={handleGoogle} disabled={loading}>
          <span style={{ marginRight: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 18 18" style={{ verticalAlign: 'middle' }}>
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.258c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          </span>
          Continue with Google
        </button>

        <div className="divider">or</div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-field">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Your name"
                value={form.name}
                onChange={setField('name')}
                required
              />
            </div>
          )}
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={setField('email')}
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder={tab === 'register' ? 'Min. 6 characters' : '••••••••'}
              value={form.password}
              onChange={setField('password')}
              required
              minLength={6}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'Email already registered. Sign in instead.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked by the browser. Allow popups and retry.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.',
    'auth/invalid-api-key': 'Firebase API key is missing or invalid (check Vercel env vars).',
    'auth/operation-not-allowed': 'Google sign-in is not enabled in Firebase Authentication.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'no-name': 'Please enter a display name.',
  }
  // Fall back to showing the raw code so deployment issues are diagnosable.
  return map[code] || `Something went wrong${code ? ` (${code})` : ''}. Please try again.`
}
