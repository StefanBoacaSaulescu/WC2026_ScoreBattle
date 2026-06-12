import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // Proxy football-data.org calls in dev so the token stays off the client
      // and we sidestep the API's lack of CORS support.
      proxy: {
        '/api/football': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/football/, ''),
          headers: {
            'X-Auth-Token': env.VITE_FOOTBALL_API_KEY || '',
          },
        },
      },
    },
  }
})
