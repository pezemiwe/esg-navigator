import { Hono } from 'hono'
import { cors } from 'hono/cors'
import srroRouter from './routes/srro.js'
import projectsRouter from './routes/projects.js'
import valueChainRouter from './routes/valueChain.js'
import reportRouter from './routes/report.js'

const app = new Hono()

app.use('*', cors())

app.get('/api/health', (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString() })
})

app.route('/', srroRouter)
app.route('/', valueChainRouter)
app.route('/', projectsRouter)
app.route('/', reportRouter)

export default app
