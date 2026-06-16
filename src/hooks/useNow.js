// src/hooks/useNow.js
// A ticking clock. Returns the current time in ms and re-renders the consumer
// every `intervalMs` so time-based UI (e.g. the kickoff lock) updates without
// a page refresh. Defaults to 20s — fine-grained enough that an open tab locks
// within seconds of kickoff, cheap enough to leave running.
import { useEffect, useState } from 'react'

export function useNow(intervalMs = 20000) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    // Re-sync when the tab regains focus, so a backgrounded tab (where timers
    // are throttled) catches up the instant the user returns to it.
    const onVisible = () => {
      if (document.visibilityState === 'visible') setNow(Date.now())
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])

  return now
}
