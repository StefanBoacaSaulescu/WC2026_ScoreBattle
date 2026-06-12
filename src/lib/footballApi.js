// src/lib/footballApi.js
// Uses football-data.org free tier API
// Sign up at https://www.football-data.org/client/register
// Free tier: 10 req/min, includes FIFA World Cup 2026 (competition code: WC)

const BASE_URL = 'https://api.football-data.org/v4'
const API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY

const headers = {
  'X-Auth-Token': API_KEY,
}

// FIFA World Cup 2026 competition code
const WC_CODE = 'WC'

export async function getMatches() {
  try {
    const res = await fetch(`${BASE_URL}/competitions/${WC_CODE}/matches`, { headers })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return data.matches || []
  } catch (err) {
    console.error('Failed to fetch matches:', err)
    return []
  }
}

export async function getStandings() {
  try {
    const res = await fetch(`${BASE_URL}/competitions/${WC_CODE}/standings`, { headers })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    const data = await res.json()
    return data.standings || []
  } catch (err) {
    console.error('Failed to fetch standings:', err)
    return []
  }
}

export async function getMatchById(matchId) {
  try {
    const res = await fetch(`${BASE_URL}/matches/${matchId}`, { headers })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('Failed to fetch match:', err)
    return null
  }
}

// Status helpers
export function isMatchFinished(match) {
  return match.status === 'FINISHED'
}

export function isMatchScheduled(match) {
  return match.status === 'SCHEDULED' || match.status === 'TIMED'
}

export function isMatchLive(match) {
  return match.status === 'IN_PLAY' || match.status === 'PAUSED'
}

// Score calculation for a single prediction vs actual result
// 3 pts = exact score, 1 pt = correct outcome, 0 = wrong
export function calculatePoints(prediction, match) {
  if (!isMatchFinished(match) || !prediction) return null

  const actual = match.score.fullTime
  const { homeScore, awayScore } = prediction

  if (homeScore === null || awayScore === null) return 0

  // Exact score
  if (homeScore === actual.home && awayScore === actual.away) return 3

  // Correct outcome (win/draw/loss)
  const predictedOutcome =
    homeScore > awayScore ? 'HOME' : homeScore < awayScore ? 'AWAY' : 'DRAW'
  const actualOutcome =
    actual.home > actual.away ? 'HOME' : actual.home < actual.away ? 'AWAY' : 'DRAW'

  if (predictedOutcome === actualOutcome) return 1

  return 0
}
