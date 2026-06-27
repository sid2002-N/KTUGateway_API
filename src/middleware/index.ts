import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'
import { logger } from '../core/logger'

const studentRequestSchema = z.object({
  userid: z.string().min(1, 'userid is required'),
  password: z.string().min(1, 'password is required'),
  key: z.string().min(1, 'key is required'),
})

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const result = studentRequestSchema.safeParse(req.body)

  if (!result.success) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid request body',
      errors: result.error.flatten().fieldErrors,
    })
    return
  }

  if (result.data.key !== env.API_KEY) {
    logger.warn({ ip: req.ip }, 'Unauthorized API access attempt')
    res.status(403).json({ status: 'unauthorized' })
    return
  }

  next()
}
