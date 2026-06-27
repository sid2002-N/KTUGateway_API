import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import getStudentDetails from '../controllers/studentDetails'
import getNotifications from '../controllers/notifications'
import { validateRequest } from '../middleware'

const router = Router()

// Rate limiter for the scraping endpoint — max 10 requests per 15 min per IP
const scraperLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'too-many-requests', message: 'Too many requests, please try again later' },
})

router.get('/', (_req, res) => res.json({ status: 'working', version: '2.0.0' }))
router.post('/api/v1/data', scraperLimiter, validateRequest, getStudentDetails)
router.get('/api/v1/notifications', getNotifications)

export default router
