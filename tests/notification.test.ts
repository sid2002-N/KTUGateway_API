import { describe, it, expect } from 'vitest'
import { cleanNotificationForFirebase } from '../src/utils/notifications'

describe('cleanNotificationForFirebase', () => {
  it('formats a raw notification string into a valid Firebase message payload', () => {
    const raw = JSON.stringify({
      date: 'Sat Aug 31 00:00:00 IST 2019',
      heading: 'Result of B.Tech S6 Exam published',
      key: 'result-of-btech-s6-exam-published',
      data: 'The result of B.Tech S6 Examination is published herewith.',
    })

    const result = cleanNotificationForFirebase(raw)

    expect(result.topic).toBe('ktu_notification')
    expect(result.notification?.title).toBe('Result of B.Tech S6 Exam published')
    expect(result.data?.click_action).toBe('FLUTTER_NOTIFICATION_CLICK')
    expect(result.data?.heading).toBe('Result of B.Tech S6 Exam published')
  })
})
