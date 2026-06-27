import client from '../core/redis'
import crypto from 'crypto'
import { sendNewNotifications } from './notifications'
import type { User, StudentData, KTUNotification } from '../types'
import { logger } from '../core/logger'

const EXPIRY_SECONDS = 60 * 60 * 24 // 24 hours

const generateUserKey = (user: User): string =>
  `user/${crypto.createHash('md5').update(`${user.id}${user.password}`).digest('hex')}`

export const setUserRedis = async (user: User, data: StudentData): Promise<void> => {
  try {
    await client.set(generateUserKey(user), JSON.stringify(data), { EX: EXPIRY_SECONDS })
  } catch (err) {
    logger.error({ err }, 'Failed to set user data in Redis')
  }
}

export const getUserRedis = async (user: User): Promise<StudentData | null> => {
  try {
    const raw = await client.get(generateUserKey(user))
    return raw ? (JSON.parse(raw) as StudentData) : null
  } catch (err) {
    logger.error({ err }, 'Failed to get user data from Redis')
    return null
  }
}

export const saveNotifications = async (notifications: KTUNotification[]): Promise<void> => {
  try {
    const existing = await getNotifications()
    const existingKeys = new Set(existing.map((n) => n.key))
    const newOnes = notifications.filter((n) => !existingKeys.has(n.key))

    if (newOnes.length > 0) {
      const serialized = newOnes.map((n) => JSON.stringify(n))
      await client.rPush('notifications', serialized)
      sendNewNotifications(newOnes)
      logger.info({ count: newOnes.length }, 'New notifications saved')
    }
  } catch (err) {
    logger.error({ err }, 'Failed to save notifications')
  }
}

export const getNotifications = async (): Promise<KTUNotification[]> => {
  try {
    const raw = await client.lRange('notifications', 0, -1)
    return raw.map((n) => JSON.parse(n) as KTUNotification)
  } catch (err) {
    logger.error({ err }, 'Failed to get notifications from Redis')
    return []
  }
}
