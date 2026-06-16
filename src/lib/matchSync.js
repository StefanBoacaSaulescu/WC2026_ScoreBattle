// src/lib/matchSync.js
// Mirrors each fixture's kickoff time into Firestore (`matches/{matchId}`) so
// the security rules can reject prediction writes after kickoff. Only an admin
// (a user whose Firestore doc has `admin: true`) is allowed to write these docs
// — see firestore.rules. Regular users only ever read them.
//
// We deliberately avoid the Firebase Admin SDK / a service account / a cron:
// the admin just signs in and the app keeps the `matches` docs fresh, both via
// an explicit "Sync fixtures" button and a throttled auto-sync on app load.
import { doc, writeBatch, Timestamp } from 'firebase/firestore'
import { db } from './firebase'
import { getMatches } from './footballApi'

const AUTO_SYNC_KEY = 'wc:lastFixtureSync'
const AUTO_SYNC_INTERVAL_MS = 30 * 60 * 1000 // 30 min
const BATCH_LIMIT = 450 // Firestore caps a batch at 500 writes

// Pull the full fixture list and upsert kickoff times. Returns the count synced.
// Throws if the caller isn't an admin (the rules reject the write).
export async function syncMatchesToFirestore() {
  const matches = await getMatches()
  if (!matches.length) return 0

  let synced = 0
  for (let i = 0; i < matches.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    for (const m of matches.slice(i, i + BATCH_LIMIT)) {
      if (!m.id || !m.utcDate) continue
      const kickoff = new Date(m.utcDate)
      if (Number.isNaN(kickoff.getTime())) continue
      batch.set(
        doc(db, 'matches', String(m.id)),
        {
          matchId: m.id,
          kickoff: Timestamp.fromDate(kickoff),
          utcDate: m.utcDate,
          status: m.status || null,
          homeTeam: m.homeTeam?.name || null,
          awayTeam: m.awayTeam?.name || null,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      )
      synced++
    }
    await batch.commit()
  }
  return synced
}

// Best-effort background sync for admins: runs at most once per interval and
// never throws into the caller (a failed/denied sync must not break the app).
export async function maybeAutoSyncFixtures() {
  try {
    const last = Number(localStorage.getItem(AUTO_SYNC_KEY) || 0)
    if (Date.now() - last < AUTO_SYNC_INTERVAL_MS) return
    // Stamp first so concurrent tabs/renders don't double-fire.
    localStorage.setItem(AUTO_SYNC_KEY, String(Date.now()))
    await syncMatchesToFirestore()
  } catch (err) {
    console.warn('Fixture auto-sync skipped:', err)
  }
}
