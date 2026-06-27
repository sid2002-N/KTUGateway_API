import * as admin from 'firebase-admin'
import { env } from '../config/env'
import { logger } from './logger'

let initialized = false

const getServiceAccount = (): admin.ServiceAccount | null => {
  // Prefer env var (JSON string) over file — better for Docker/CI
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as admin.ServiceAccount
    } catch {
      logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON')
      return null
    }
  }
  // Fallback to file
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../config/firebase.json') as admin.ServiceAccount
  } catch {
    logger.warn('config/firebase.json not found and FIREBASE_SERVICE_ACCOUNT not set — Firebase disabled')
    return null
  }
}

const initFirebase = (): void => {
  if (initialized) return
  const serviceAccount = getServiceAccount()
  if (!serviceAccount || !env.FIREBASE_DB_URL) {
    logger.warn('Firebase not configured — push notifications disabled')
    return
  }
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: env.FIREBASE_DB_URL,
  })
  initialized = true
  logger.info('Firebase Admin initialized')
}

initFirebase()

export const sendNotification = async (message: admin.messaging.Message): Promise<void> => {
  if (!initialized) {
    logger.warn('Firebase not initialized — skipping notification')
    return
  }
  try {
    const response = await admin.messaging().send(message)
    logger.info({ response }, 'Firebase notification sent')
  } catch (err) {
    logger.error({ err }, 'Failed to send Firebase notification')
  }
}
