import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_HOST: z.string({ required_error: 'REDIS_HOST is required' }),
  REDIS_PORT: z.string({ required_error: 'REDIS_PORT is required' }),
  REDIS_PASSWORD: z.string().optional(),
  IMAGE_PATH: z.string().default('.'),
  IMAGE_URL: z.string().default('http://localhost:3000/images/'),
  API_KEY: z.string({ required_error: 'API_KEY is required' }).min(1),
  FIREBASE_DB_URL: z.string().optional(),
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),
  SLACK_TOKEN: z.string().optional(),
  SLACK_CHANNEL: z.string().optional(),
  PUPPETEER_EXECUTABLE_PATH: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error('❌ Invalid or missing environment variables:')
  const errors = result.error.flatten().fieldErrors
  Object.entries(errors).forEach(([field, messages]) => {
    console.error(`  ${field}: ${messages?.join(', ')}`)
  })
  process.exit(1)
}

export const env = result.data
