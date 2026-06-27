import * as cheerio from 'cheerio'
import slugify from './slugify'
import { sendNotification } from '../core/firebase'
import { sendMessage } from '../core/slack'
import type { KTUNotification } from '../types'
import type { Message } from 'firebase-admin/messaging'

export const parseNotifications = ($: cheerio.CheerioAPI): KTUNotification[] => {
  const results: KTUNotification[] = []

  $('td').slice(0, 20).each((_i, td) => {
    const children = $(td).children().toArray()
    if (children.length < 2) return

    const dateEl = children[0]
    const contentEl = children[1]
    if (!dateEl || !contentEl) return

    const date = $(dateEl)
      .text()
      .replace(/\t/g, '')
      .replace(/\n/g, '')
      .replace(/ {2,}/g, ' ')
      .trim()

    const dataElem = $(contentEl).children().first()
    const heading = $(dataElem).children().first().text().trim()
    const key = slugify(heading)

    const body = $(dataElem)
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .replace(/\t/g, '')
      .replace(/\n/g, '')
      .replace('Results', '')
      .replace('Notification', '')
      .replace(heading, '')
      .replace(/ {2,}/g, ' ')
      .trim()

    if (heading && key) {
      results.push({ date, heading, key, data: body })
    }
  })

  return results
}

export const sendNewNotifications = (notifications: KTUNotification[]): void => {
  notifications.forEach((n) => {
    sendMessage(`📢 ${n.heading}`)
    sendNotification(buildFirebaseMessage(n))
  })
}

const buildFirebaseMessage = (n: KTUNotification): Message => ({
  data: {
    date: n.date,
    heading: n.heading,
    key: n.key,
    data: n.data,
    click_action: 'FLUTTER_NOTIFICATION_CLICK',
  },
  notification: {
    title: n.heading,
    body: n.data.substring(0, 100).concat('...'),
  },
  topic: 'ktu_notification',
})
