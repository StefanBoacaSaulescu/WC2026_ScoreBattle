// src/pages/PredictionsPage.jsx
// Everyone's predictions, grouped by match. A match's picks stay hidden from
// other players until that match kicks off (reveal-at-kickoff) so nobody can
// copy a pick beforehand. Your own pick is always visible to you.
import { useState, useEffect } from 'react'
import {
  getMatches,
  isMatchFinished,
  isMatchLive,
  isMatchScheduled,
  hasKickedOff,
  kickoffMs,
  calculatePoints,
} from '../lib/footballApi'
import { getAllPredictions, getAllUsers } from '../hooks/usePredictions'
import { formatDate } from '../lib/display'
import { useNow } from '../hooks/useNow'
import { useAuth } from '../context/AuthContext'
import MatchTeams from '../components/MatchTeams'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live', label: '● Live' },
  { key: 'finished', label: 'Finished' },
]

export default function PredictionsPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [allPredictions, setAllPredictions] = useState({})
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const now = useNow()

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

  const filtered = matches
    .filter(m => {
      if (filter === 'upcoming') return isMatchScheduled(m) && !hasKickedOff(m, now)
      if (filter === 'live') return isMatchLive(m) || (hasKickedOff(m, now) && !isMatchFinished(m))
      if (filter === 'finished') return isMatchFinished(m)
      return true
    })
    .sort((a, b) => kickoffMs(a) - kickoffMs(b))

  // Build the list of picks for a match, newest-relevant ordering.
  function picksFor(match) {
    const finished = isMatchFinished(match)
    const rows = []
    Object.entries(users).forEach(([uid, u]) => {
      const p = allPredictions[uid]?.[match.id]
      if (!p) return
      rows.push({
        uid,
        displayName: u.displayName || 'Player',
        photoURL: u.photoURL,
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        points: finished ? calculatePoints(p, match) : null,
      })
    })
    // Finished: best scorers first. Otherwise alphabetical, you pinned on top.
    rows.sort((a, b) => {
      if (finished) return (b.points ?? 0) - (a.points ?? 0)
      if (a.uid === user?.uid) return -1
      if (b.uid === user?.uid) return 1
      return a.displayName.localeCompare(b.displayName)
    })
    return rows
  }

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">PREDICTIONS</h1>
        <p className="page-subtitle">
          Everyone's picks, match by match · revealed at kickoff
        </p>
      </div>

      <div className="filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
          {filtered.length} match{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗳️</div>
          <div className="empty-state-title">Nothing here yet</div>
          <div className="empty-state-desc">Check back once matches are scheduled.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(match => {
            const finished = isMatchFinished(match)
            const live = isMatchLive(match)
            const scheduled = isMatchScheduled(match)
            const revealed = hasKickedOff(match, now)
            const picks = picksFor(match)
            const myPick = picks.find(p => p.uid === user?.uid)

            return (
              <div className="match-card" key={match.id}>
                <div className="match-card-header">
                  <span className="match-group">{match.group || match.stage || 'Group Stage'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {live && <span className="badge badge-live">● LIVE</span>}
                    {finished && <span className="badge badge-finished">FINAL</span>}
                    {scheduled && !revealed && <span className="badge badge-scheduled">UPCOMING</span>}
                    <span className="match-date">{formatDate(match.utcDate)}</span>
                  </div>
                </div>

                <MatchTeams match={match} />

                <div className="pred-section">
                  {revealed ? (
                    picks.length === 0 ? (
                      <span className="lock-hint" style={{ fontStyle: 'italic' }}>
                        No one predicted this match
                      </span>
                    ) : (
                      <div className="pred-list">
                        {picks.map(p => (
                          <div key={p.uid} className="pred-row">
                            <div className="lb-avatar pred-avatar">
                              {p.photoURL
                                ? <img src={p.photoURL} alt={p.displayName} referrerPolicy="no-referrer" />
                                : p.displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="pred-name">
                              {p.displayName}
                              {p.uid === user?.uid && <span className="lb-you">YOU</span>}
                            </span>
                            <span className="pred-score">{p.homeScore} – {p.awayScore}</span>
                            {p.points !== null && (
                              <span className={`prediction-points pts-${p.points}`}>
                                {p.points === 3 ? '🎯' : p.points === 1 ? '👍' : '✕'} {p.points}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="pred-hidden">
                      <span className="lock-hint">
                        🔒 {picks.length} pick{picks.length !== 1 ? 's' : ''} hidden until kickoff
                      </span>
                      {myPick && (
                        <span className="pred-mypick">
                          Your pick: <strong>{myPick.homeScore} – {myPick.awayScore}</strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
