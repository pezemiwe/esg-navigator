import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import { serve } from '@hono/node-server'
import app from './app.js'

const port = Number(process.env.PORT) || 8787

serve({ fetch: app.fetch, port }, () =>
  console.log(`ESG API running on port ${port}`)
)
