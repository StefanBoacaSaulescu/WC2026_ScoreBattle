// src/pages/MatchesPage.jsx
import { useState, useEffect } from 'react'
import { getMatches, isMatchFinished, isMatchLive, isMatchScheduled } from '../lib/footballApi'
import { usePredictions } from '../hooks/usePredictions'
import MatchCard from '../components/MatchCard'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live', label: '● Live' },
  { key: 'finished', label: 'Finished' },
]

export default function MatchesPage() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { predictions, savePrediction } = usePredictions()

  useEffect(() => {
    getMatches().then(data => {
      setMatches(data)
      setLoading(false)
    })
  }, [])

  const filtered = matches.filter(m => {
    if (filter === 'upcoming') return isMatchScheduled(m)
    if (filter === 'live') return isMatchLive(m)
    if (filter === 'finished') return isMatchFinished(m)
    return true
  })

  // Stats for the current user
  const finishedWithPrediction = matches.filter(
    m => isMatchFinished(m) && predictions[m.id]
  )
  const totalPts = finishedWithPrediction.reduce((sum, m) => {
    const p = predictions[m.id]
    if (!p) return sum
    const actual = m.score.fullTime
    if (p.homeScore === actual.home && p.awayScore === actual.away) return sum + 3
    const pOut = p.homeScore > p.awayScore ? 'H' : p.homeScore < p.awayScore ? 'A' : 'D'
    const aOut = actual.home > actual.away ? 'H' : actual.home < actual.away ? 'A' : 'D'
    return sum + (pOut === aOut ? 1 : 0)
  }, 0)

  const exactCount = finishedWithPrediction.filter(m => {
    const p = predictions[m.id]
    const actual = m.score.fullTime
    return p?.homeScore === actual.home && p?.awayScore === actual.away
  }).length

  const predictedCount = Object.keys(predictions).length

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">MATCH PREDICTIONS</h1>
        <p className="page-subtitle">FIFA World Cup 2026 · USA / Canada / Mexico</p>
      </div>

      {/* Quick stats */}
      <div className="stats-row" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-value">{totalPts}</div>
          <div className="stat-label">My Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{predictedCount}</div>
          <div className="stat-label">Predictions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{exactCount}</div>
          <div className="stat-label">Exact Scores</div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Scoring legend */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span className="badge badge-gold">🎯 Exact score = 3 pts</span>
        <span className="badge badge-scheduled">👍 Correct outcome = 1 pt</span>
      </div>

      {/* Match list */}
      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚽</div>
          <div className="empty-state-title">No matches here</div>
          <div className="empty-state-desc">
            {filter === 'live'
              ? 'No matches are live right now'
              : 'Check back when the tournament starts'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={predictions[match.id] || null}
              onSave={savePrediction}
            />
          ))}
        </div>
      )}
    </main>
  )
}
