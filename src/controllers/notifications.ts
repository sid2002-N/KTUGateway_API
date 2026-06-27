import { Request, Response } from 'express'
import { getNotifications } from '../utils/redis'
import { logger } from '../core/logger'

const showNotifications = async (_req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await getNotifications()
    res.json({ notifications })
  } catch (err) {
    logger.error({ err }, 'Failed to fetch notifications')
    res.status(500).json({ status: 'error', message: 'Could not fetch notifications' })
  }
}

export default showNotifications
