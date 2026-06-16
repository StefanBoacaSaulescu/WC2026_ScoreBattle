// src/pages/AdminPage.jsx
// Admin-only tool to backfill predictions players made before the platform
// existed. Pick a player, then enter their pick for any past match — the
// kickoff lock is bypassed here (and in the rules) for admins only.
import { useState, useEffect } from 'react'
import { getMatches, isMatchFinished, hasKickedOff, calculatePoints } from '../lib/footballApi'
import { getAllPredictions, getAllUsers, adminSavePrediction } from '../hooks/usePredictions'
import { formatDate } from '../lib/display'
import { useAuth } from '../context/AuthContext'
import MatchTeams from '../components/MatchTeams'
import { toast } from '../components/Toast'

function BackfillRow({ match, existing, onSave }) {
  const [home, setHome] = useState(existing?.homeScore ?? '')
  const [away, setAway] = useState(existing?.awayScore ?? '')
  const [saving, setSaving] = useState(false)

  const finished = isMatchFinished(match)
  const points = finished && existing ? calculatePoints(existing, match) : null

  async function handleSave() {
    if (home === '' || away === '') {
      toast('Enter both scores', 'error')
      return
    }
    setSaving(true)
    try {
      await onSave(match.id, Number(home), Number(away))
      toast('Backfilled ✓')
    } catch (err) {
      toast(err?.code === 'permission-denied' ? 'Admin access required' : 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="match-card">
      <div className="match-card-header">
        <span className="match-group">{match.group || match.stage || 'Group Stage'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {finished && <span className="badge badge-finished">FINAL</span>}
          {existing?.backfilledBy && <span className="badge badge-gold">BACKFILLED</span>}
          <span className="match-date">{formatDate(match.utcDate)}</span>
        </div>
      </div>

      <MatchTeams match={match} />

      <div className="prediction-row">
        <span className="prediction-label">PICK</span>
        <div className="prediction-inputs">
          <input type="number" min="0" max="20" className="score-input"
            value={home} onChange={e => setHome(e.target.value)} placeholder="0" />
          <span className="score-sep">–</span>
          <input type="number" min="0" max="20" className="score-input"
            value={away} onChange={e => setAway(e.target.value)} placeholder="0" />
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}
            style={{ marginLeft: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
            {saving ? '...' : existing ? 'Update' : 'Save'}
          </button>
          {points !== null && (
            <span className={`prediction-points pts-${points}`} style={{ marginLeft: 'auto' }}>
              {points === 3 ? '🎯' : points === 1 ? '👍' : '✕'} {points} pts
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [allPredictions, setAllPredictions] = useState({})
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedUid, setSelectedUid] = useState('')
  const [includeUpcoming, setIncludeUpcoming] = useState(false)

  useEffect(() => {
    Promise.all([getMatches(), getAllPredictions(), getAllUsers()]).then(
      ([m, preds, u]) => {
        setMatches(m)
        setAllPredictions(preds)
        setUsers(u)
        setLoading(false)
      }
    )
  }, [])

  // Backfill targets are matches that have already kicked off (can't be
  // predicted normally). Optionally include upcoming ones too. Oldest first,
  // so pre-platform fixtures sit at the top.
  const visibleMatches = matches
    .filter(m => includeUpcoming || hasKickedOff(m))
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))

  async function handleSave(matchId, h, a) {
    await adminSavePrediction(selectedUid, matchId, h, a, user.uid)
    setAllPredictions(prev => ({
      ...prev,
      [selectedUid]: {
        ...(prev[selectedUid] || {}),
        [matchId]: { homeScore: h, awayScore: a, backfilledBy: user.uid },
      },
    }))
  }

  const sortedUsers = Object.entries(users).sort((a, b) =>
    (a[1].displayName || '').localeCompare(b[1].displayName || '')
  )

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">ADMIN · BACKFILL</h1>
        <p className="page-subtitle">
          Enter picks players made before the platform existed. Bypasses the kickoff lock.
        </p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" htmlFor="player">Player</label>
        <select
          id="player"
          className="form-input"
          value={selectedUid}
          onChange={e => setSelectedUid(e.target.value)}
        >
          <option value="">— Choose a player —</option>
          {sortedUsers.map(([uid, u]) => (
            <option key={uid} value={uid}>
              {u.displayName || 'Player'}{u.email ? ` (${u.email})` : ''}
            </option>
          ))}
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          <input type="checkbox" checked={includeUpcoming} onChange={e => setIncludeUpcoming(e.target.checked)} />
          Include upcoming matches too
        </label>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : !selectedUid ? (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <div className="empty-state-title">Choose a player</div>
          <div className="empty-state-desc">Pick whose predictions you want to backfill.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {visibleMatches.map(match => (
            <BackfillRow
              key={`${selectedUid}_${match.id}`}
              match={match}
              existing={allPredictions[selectedUid]?.[match.id] || null}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </main>
  )
}
