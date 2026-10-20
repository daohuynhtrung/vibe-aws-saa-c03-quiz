import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

function progressSyncPlugin(): Plugin {
  return {
    name: 'progress-sync-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/progress') {
          const repoDataDir = path.resolve(import.meta.dirname, '../data')
          const progressFile = path.join(repoDataDir, 'user_progress.json')

          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json')
            if (fs.existsSync(progressFile)) {
              try {
                const data = fs.readFileSync(progressFile, 'utf-8')
                return res.end(data)
              } catch (err) {
                return res.end(JSON.stringify({}))
              }
            } else {
              return res.end(JSON.stringify({}))
            }
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                fs.mkdirSync(repoDataDir, { recursive: true })
                // Write primary file
                fs.writeFileSync(progressFile, body, 'utf-8')

                // Write dated backup snapshot: data/aws-saa-progress-YYYY-MM-DD.json
                const dateStr = new Date().toISOString().split('T')[0]
                const datedFile = path.join(repoDataDir, `aws-saa-progress-${dateStr}.json`)
                fs.writeFileSync(datedFile, body, 'utf-8')

                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ success: true, savedAt: new Date().toISOString() }))
              } catch (err) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: String(err) }))
              }
            })
            return
          }
        }
        next()
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), progressSyncPlugin()],
  server: {
    port: 5173,
    host: true
  }
})
