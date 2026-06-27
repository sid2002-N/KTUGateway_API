import { createClient } from 'redis'
import { env } from '../config/env'
import { logger } from './logger'

const client = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: Number(env.REDIS_PORT),
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
  },
  password: env.REDIS_PASSWORD ?? undefined,
})

client.on('connect', () => logger.info('Connected to Redis'))
client.on('error', (err: Error) => logger.error({ err }, 'Redis client error'))
client.on('reconnecting', () => logger.warn('Redis reconnecting...'))

export const connectRedis = (): Promise<typeof client> => client.connect()

export default client
