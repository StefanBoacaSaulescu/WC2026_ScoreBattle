// src/components/MatchTeams.jsx
// The home / score-or-VS / away header shared by MatchCard and the Predictions
// page so both render fixtures identically.
import { getFlag } from '../lib/display'
import { isMatchFinished } from '../lib/footballApi'

export default function MatchTeams({ match }) {
  const homeTeam = match.homeTeam?.name || 'TBD'
  const awayTeam = match.awayTeam?.name || 'TBD'
  const finished = isMatchFinished(match)

  return (
    <div className="match-teams">
      <div className="match-team">
        <span className="team-flag">{getFlag(homeTeam)}</span>
        <span className="team-name-short">{homeTeam.toUpperCase().slice(0, 3)}</span>
        <span className="match-group" style={{ fontSize: '0.75rem' }}>{homeTeam}</span>
      </div>

      {finished ? (
        <div className="match-score-actual">
          {match.score.fullTime.home} – {match.score.fullTime.away}
        </div>
      ) : (
        <div className="match-vs">VS</div>
      )}

      <div className="match-team away">
        <span className="team-flag">{getFlag(awayTeam)}</span>
        <span className="team-name-short">{awayTeam.toUpperCase().slice(0, 3)}</span>
        <span className="match-group" style={{ fontSize: '0.75rem' }}>{awayTeam}</span>
      </div>
    </div>
  )
}
