import cron from 'node-cron'
import fetchNotifications from './notification'
import { logger } from '../core/logger'

const startJobs = (): void => {
  // Runs at 3am, 6am, 9am, 12pm every day
  cron.schedule('0 3,6,9,12 * * *', async () => {
    logger.info('Cron: running notification fetch job')
    await fetchNotifications()
  })
  logger.info('Cron jobs scheduled')
}

export default startJobs
