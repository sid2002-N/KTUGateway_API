import { env } from './config/env'
import app from './core/app'
import { connectRedis } from './core/redis'
import { logger } from './core/logger'
import startJobs from './jobs'

// Disable TLS rejection for KTU's self-signed cert chain
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const PORT = Number(env.PORT)

const startApp = async (): Promise<void> => {
  try {
    // Connect to Redis before starting server
    await connectRedis()

    // Start cron jobs
    startJobs()

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info({ port: PORT, env: env.NODE_ENV }, 'Server running')
    })
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server')
    process.exit(1)
  }
}

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info({ signal }, 'Shutting down gracefully...')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception')
  process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection')
  process.exit(1)
})

startApp()
