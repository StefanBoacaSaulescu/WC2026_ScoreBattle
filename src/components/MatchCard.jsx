// src/components/MatchCard.jsx
import { useState } from 'react'
import { isMatchFinished, isMatchLive, isMatchScheduled, calculatePoints } from '../lib/footballApi'
import { toast } from './Toast'

const FLAG_MAP = {
  'United States': '🇺🇸', 'Canada': '🇨🇦', 'Mexico': '🇲🇽',
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'Uruguay': '🇺🇾', 'Colombia': '🇨🇴',
  'Germany': '🇩🇪', 'France': '🇫🇷', 'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Italy': '🇮🇹',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺',
  'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Nigeria': '🇳🇬',
  'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'Qatar': '🇶🇦',
  'Croatia': '🇭🇷', 'Serbia': '🇷🇸', 'Poland': '🇵🇱',
  'Switzerland': '🇨🇭', 'Denmark': '🇩🇰', 'Ecuador': '🇪🇨',
  'Cameroon': '🇨🇲', 'Ghana': '🇬🇭', 'Tunisia': '🇹🇳',
  'Costa Rica': '🇨🇷', 'Panama': '🇵🇦', 'Honduras': '🇭🇳',
  'Venezuela': '🇻🇪', 'Peru': '🇵🇪', 'Chile': '🇨🇱',
  'Austria': '🇦🇹', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺', 'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮', 'Albania': '🇦🇱', 'Romania': '🇷🇴',
  'Turkey': '🇹🇷', 'Ukraine': '🇺🇦', 'Greece': '🇬🇷',
  'Egypt': '🇪🇬', 'Algeria': '🇩🇿', 'Mali': '🇲🇱',
  'Ivory Coast': '🇨🇮', 'Zambia': '🇿🇲', 'South Africa': '🇿🇦',
  'Australia': '🇦🇺', 'New Zealand': '🇳🇿', 'Indonesia': '🇮🇩',
  'Iraq': '🇮🇶', 'Jordan': '🇯🇴', 'Uzbekistan': '🇺🇿',
  'China PR': '🇨🇳',
}

function getFlag(teamName) {
  return FLAG_MAP[teamName] || '🏳️'
}

function formatDate(utcDate) {
  const d = new Date(utcDate)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function MatchCard({ match, prediction, onSave }) {
  const [home, setHome] = useState(prediction?.homeScore ?? '')
  const [away, setAway] = useState(prediction?.awayScore ?? '')
  const [saving, setSaving] = useState(false)

  const finished = isMatchFinished(match)
  const live = isMatchLive(match)
  const scheduled = isMatchScheduled(match)
  const canPredict = !finished && !live

  const points = finished && prediction
    ? calculatePoints(prediction, match)
    : null

  async function handleSave() {
    if (home === '' || away === '') {
      toast('Enter both scores', 'error')
      return
    }
    setSaving(true)
    try {
      await onSave(match.id, Number(home), Number(away))
      toast('Prediction saved ✓')
    } catch {
      toast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const homeTeam = match.homeTeam?.name || 'TBD'
  const awayTeam = match.awayTeam?.name || 'TBD'

  return (
    <div className="match-card">
      <div className="match-card-header">
        <span className="match-group">{match.group || match.stage || 'Group Stage'}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {live && <span className="badge badge-live">● LIVE</span>}
          {finished && <span className="badge badge-finished">FINAL</span>}
          {scheduled && <span className="badge badge-scheduled">UPCOMING</span>}
          <span className="match-date">{formatDate(match.utcDate)}</span>
        </div>
      </div>

      <div className="match-teams">
        {/* Home */}
        <div className="match-team">
          <span className="team-flag">{getFlag(homeTeam)}</span>
          <span className="team-name-short">{homeTeam.toUpperCase().slice(0, 3)}</span>
          <span className="match-group" style={{ fontSize: '0.75rem' }}>{homeTeam}</span>
        </div>

        {/* Score or VS */}
        {finished ? (
          <div className="match-score-actual">
            {match.score.fullTime.home} – {match.score.fullTime.away}
          </div>
        ) : (
          <div className="match-vs">VS</div>
        )}

        {/* Away */}
        <div className="match-team away">
          <span className="team-flag">{getFlag(awayTeam)}</span>
          <span className="team-name-short">{awayTeam.toUpperCase().slice(0, 3)}</span>
          <span className="match-group" style={{ fontSize: '0.75rem' }}>{awayTeam}</span>
        </div>
      </div>

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
            {points !== null && (
              <span className={`prediction-points pts-${points}`} style={{ marginLeft: '0.75rem' }}>
                {points === 3 ? '🎯' : points === 1 ? '👍' : '✕'} {points} pts
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No prediction placed
          </span>
        )}
      </div>
    </div>
  )
}
