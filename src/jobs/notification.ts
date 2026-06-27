import axios from 'axios'
import * as cheerio from 'cheerio'
import { parseNotifications } from '../utils/notifications'
import { saveNotifications } from '../utils/redis'
import { sendMessage } from '../core/slack'
import { logger } from '../core/logger'

const fetchNotifications = async (): Promise<void> => {
  await sendMessage('🔔 Fetching KTU notifications...')

  try {
    const { data: html } = await axios.get<string>('https://ktu.edu.in/eu/core/announcements.htm', {
      httpsAgent: new (await import('https')).Agent({ rejectUnauthorized: false }),
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    })

    const $ = cheerio.load(html)
    const notifications = parseNotifications($)
    await saveNotifications(notifications)
    logger.info({ count: notifications.length }, 'Notifications fetched and saved')
  } catch (err) {
    logger.error({ err }, 'Failed to fetch KTU notifications')
  }
}

export default fetchNotifications
