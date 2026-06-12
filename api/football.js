// Vercel serverless proxy for football-data.org.
// The browser can't call football-data.org directly (no CORS) and we don't
// want to ship the API token to the client, so all /api/football/* requests
// are routed here (via the rewrite in vercel.json) with the token injected
// server-side.
//
// Set the token in Vercel → Project → Settings → Environment Variables:
//   FOOTBALL_API_KEY = <your football-data.org token>
export default async function handler(req, res) {
  const apiKey = process.env.FOOTBALL_API_KEY || process.env.VITE_FOOTBALL_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'Football API key not configured on the server' })
    return
  }

  // vercel.json rewrites /api/football/<path> -> /api/football?path=<path>.
  // Fall back to parsing req.url in case the rewrite param is missing.
  const raw = req.query.path
  let path = Array.isArray(raw) ? raw.join('/') : (raw || '')
  if (!path) {
    const m = req.url.match(/\/api\/football\/(.*)$/)
    if (m) path = m[1]
  }
  path = String(path).replace(/^\/+/, '')

  const target = `https://api.football-data.org/${path}`

  try {
    const apiRes = await fetch(target, {
      headers: { 'X-Auth-Token': apiKey },
    })
    const body = await apiRes.text()

    res.status(apiRes.status)
    res.setHeader('Content-Type', 'application/json')
    // Cache successful responses briefly to stay under the 10 req/min limit.
    if (apiRes.ok) {
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    } else {
      console.error('football-data.org returned', apiRes.status, 'for', target, '→', body.slice(0, 200))
    }
    res.send(body)
  } catch (err) {
    console.error('Football API proxy error:', err)
    res.status(502).json({ error: 'Upstream request failed' })
  }
}
