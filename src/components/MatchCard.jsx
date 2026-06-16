// src/components/MatchCard.jsx
import { useState, useEffect } from 'react'
import { isMatchFinished, isMatchLive, isMatchScheduled, isPredictionLocked, calculatePoints } from '../lib/footballApi'
import { formatDate } from '../lib/display'
import { useNow } from '../hooks/useNow'
import MatchTeams from './MatchTeams'
import { toast } from './Toast'

export default function MatchCard({ match, prediction, onSave }) {
  const [home, setHome] = useState(prediction?.homeScore ?? '')
  const [away, setAway] = useState(prediction?.awayScore ?? '')
  const [saving, setSaving] = useState(false)

  // Ticking clock so the lock flips the instant kickoff passes, even if the
  // page has been left open for hours without a refresh.
  const now = useNow()

  // Predictions load asynchronously, so the prop arrives after first render.
  // Re-sync the inputs whenever the saved prediction changes (load or update).
  useEffect(() => {
    setHome(prediction?.homeScore ?? '')
    setAway(prediction?.awayScore ?? '')
  }, [prediction])

  const finished = isMatchFinished(match)
  const live = isMatchLive(match)
  const scheduled = isMatchScheduled(match)
  // Locked once the match has finished, gone live, OR its kickoff time has
  // passed (the case a stale open tab used to miss). Mirrored by Firestore rules.
  const locked = isPredictionLocked(match, now)
  const canPredict = !locked

  const points = finished && prediction
    ? calculatePoints(prediction, match)
    : null

  async function handleSave() {
    if (home === '' || away === '') {
      toast('Enter both scores', 'error')
      return
    }
    // Final guard: re-check at the moment of save in case kickoff passed while
    // the form was sitting filled in. The server rule enforces this too.
    if (isPredictionLocked(match, Date.now())) {
      toast('Match has started — predictions are locked', 'error')
      return
    }
    setSaving(true)
    try {
      await onSave(match.id, Number(home), Number(away))
      toast('Prediction saved ✓')
    } catch (err) {
      // A rejected write past kickoff surfaces here too (server-side lock).
      const locked = err?.code === 'permission-denied'
      toast(locked ? 'Match has started — predictions are locked' : 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="match-card">
      <div className="match-card-header">
        <span className="match-group">{match.group || match.stage || 'Group Stage'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {live && <span className="badge badge-live">● LIVE</span>}
          {finished && <span className="badge badge-finished">FINAL</span>}
          {scheduled && !locked && <span className="badge badge-scheduled">UPCOMING</span>}
          {locked && !live && !finished && <span className="badge badge-gold">🔒 LOCKED</span>}
          <span className="match-date">{formatDate(match.utcDate)}</span>
        </div>
      </div>

      <MatchTeams match={match} />

      {/* Prediction row */}
      <div className="prediction-row">
        <span className="prediction-label">YOUR PICK</span>

        {canPredict ? (
          <div className="prediction-inputs">
            <input
              type="number"
              min="0"
              max="20"
              className="score-input"
              value={home}
              onChange={e => setHome(e.target.value)}
              placeholder="0"
            />
            <span className="score-sep">–</span>
            <input
              type="number"
              min="0"
              max="20"
              className="score-input"
              value={away}
              onChange={e => setAway(e.target.value)}
              placeholder="0"
            />
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
              style={{ marginLeft: '0.5rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
            >
              {saving ? '...' : prediction ? 'Update' : 'Save'}
            </button>
          </div>
        ) : prediction ? (
          <div className="prediction-inputs">
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dim)' }}>
              {prediction.homeScore} – {prediction.awayScore}
            </span>
            {points !== null ? (
              <span className={`prediction-points pts-${points}`} style={{ marginLeft: '0.75rem' }}>
                {points === 3 ? '🎯' : points === 1 ? '👍' : '✕'} {points} pts
              </span>
            ) : (
              <span className="lock-hint" style={{ marginLeft: 'auto' }}>🔒 Locked</span>
            )}
          </div>
        ) : (
          <span className="lock-hint" style={{ fontStyle: 'italic' }}>
            🔒 No pick — locked at kickoff
          </span>
        )}
      </div>
    </div>
  )
}
