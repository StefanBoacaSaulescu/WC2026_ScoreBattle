// src/pages/LeaderboardPage.jsx
import { useState, useEffect } from 'react'
import { getMatches, isMatchFinished, calculatePoints } from '../lib/footballApi'
import { getAllPredictions, getAllUsers } from '../hooks/usePredictions'
import { useAuth } from '../context/AuthContext'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchCount, setMatchCount] = useState(0)

  useEffect(() => {
    async function load() {
      const [matches, allPredictions, users] = await Promise.all([
        getMatches(),
        getAllPredictions(),
        getAllUsers(),
      ])

      const finishedMatches = matches.filter(isMatchFinished)
      setMatchCount(finishedMatches.length)

      // Calculate scores per user
      const leaderboard = Object.entries(users).map(([uid, userData]) => {
        const preds = allPredictions[uid] || {}
        let pts = 0
        let predicted = 0
        let exact = 0
        let correct = 0

        finishedMatches.forEach(match => {
          const pred = preds[match.id]
          if (!pred) return
          predicted++
          const p = calculatePoints(pred, match)
          pts += p
          if (p === 3) exact++
          if (p >= 1) correct++
        })

        return {
          uid,
          displayName: userData.displayName || 'Player',
          photoURL: userData.photoURL,
          pts,
          predicted,
          exact,
          correct,
        }
      })

      leaderboard.sort((a, b) => b.pts - a.pts || b.exact - a.exact || b.correct - a.correct)
      setRows(leaderboard)
      setLoading(false)
    }

    load()
  }, [])

  const myRow = rows.find(r => r.uid === user?.uid)
  const myRank = myRow ? rows.indexOf(myRow) + 1 : null

  return (
    <main className="page">
      <div className="page-header">
        <h1 className="page-title">LEADERBOARD</h1>
        <p className="page-subtitle">
          Based on {matchCount} finished match{matchCount !== 1 ? 'es' : ''} · Updates live
        </p>
      </div>

      {/* My stats */}
      {myRow && (
        <div className="stats-row" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">#{myRank}</div>
            <div className="stat-label">Your Rank</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{myRow.pts}</div>
            <div className="stat-label">Your Points</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{myRow.exact}</div>
            <div className="stat-label">Exact Scores</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : rows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏆</div>
          <div className="empty-state-title">No scores yet</div>
          <div className="empty-state-desc">The leaderboard fills up as matches finish.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th className="right">Points</th>
                <th className="right">🎯 Exact</th>
                <th className="right">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rank = i + 1
                const isMe = row.uid === user?.uid
                return (
                  <tr key={row.uid} style={isMe ? { background: 'rgba(240,180,41,0.04)' } : {}}>
                    <td>
                      <span className={`lb-rank ${rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : ''}`}>
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                      </span>
                    </td>
                    <td>
                      <div className="lb-player">
                        <div className="lb-avatar">
                          {row.photoURL
                            ? <img src={row.photoURL} alt={row.displayName} referrerPolicy="no-referrer" />
                            : row.displayName.slice(0, 2).toUpperCase()
                          }
                        </div>
                        <span className="lb-name">{row.displayName}</span>
                        {isMe && <span className="lb-you">YOU</span>}
                      </div>
                    </td>
                    <td className="right">
                      <span className="lb-pts">{row.pts}</span>
                    </td>
                    <td className="right">
                      <span className="lb-stat">{row.exact}</span>
                    </td>
                    <td className="right">
                      <span className="lb-stat">{row.predicted}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-dim)' }}>Scoring:</strong>{' '}
          🎯 Exact score = <strong style={{ color: 'var(--gold)' }}>3 pts</strong> &nbsp;·&nbsp;
          👍 Correct outcome (win/draw) = <strong style={{ color: '#93c5fd' }}>1 pt</strong> &nbsp;·&nbsp;
          ✕ Wrong = <strong>0 pts</strong>
          <br />Tiebreaker: most exact scores, then most correct outcomes.
        </p>
      </div>
    </main>
  )
}
