import { WebClient } from '@slack/web-api'
import { env } from '../config/env'
import { logger } from './logger'

const client = env.SLACK_TOKEN ? new WebClient(env.SLACK_TOKEN) : null

export const sendMessage = async (text: string): Promise<void> => {
  if (!client || !env.SLACK_CHANNEL) {
    logger.debug('Slack not configured — skipping message')
    return
  }
  try {
    await client.chat.postMessage({ channel: env.SLACK_CHANNEL, text })
    logger.debug({ text }, 'Slack message sent')
  } catch (err) {
    logger.error({ err }, 'Failed to send Slack message')
  }
}
