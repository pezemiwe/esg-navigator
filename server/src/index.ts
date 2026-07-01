import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import { serve } from '@hono/node-server'
import app from './app.js'

serve({ fetch: app.fetch, port: 8787 }, () =>
  console.log('ESG API running on http://localhost:8787')
)
