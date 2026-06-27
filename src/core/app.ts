import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import router from '../routes'
import { logger } from './logger'
import { env } from '../config/env'

const app = express()

// Security headers
app.use(helmet())

// Request logging
app.use(pinoHttp({ logger, useLevel: 'info' }))

// CORS
app.use(cors())

// Body parsing — built into Express 4.16+
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', router)

// Centralized error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error')
  const statusCode = env.NODE_ENV === 'production' ? 500 : 500
  res.status(statusCode).json({ status: 'error', message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message })
})

export default app
