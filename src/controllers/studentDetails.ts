import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'
import { Request, Response } from 'express'
import { parseData } from '../utils/parseData'
import { setUserRedis, getUserRedis } from '../utils/redis'
import { env } from '../config/env'
import { logger } from '../core/logger'
import type { User, StudentData } from '../types'

const getStudentDetails = async (req: Request, res: Response): Promise<void> => {
  const user: User = {
    id: req.body.userid as string,
    password: req.body.password as string,
  }

  try {
    const cached = await getUserRedis(user)
    if (cached !== null) {
      logger.info({ userid: user.id }, 'Serving student data from Redis cache')
      res.json(cached)
      return
    }

    const data = await getDetailsFromWebsite(user)
    res.json(data)
  } catch (err) {
    logger.error({ err, userid: user.id }, 'Failed to get student details')
    res.status(403).json({ status: 'error', message: 'Could not fetch student data' })
  }
}

const getDetailsFromWebsite = async (user: User): Promise<StudentData> => {
  let browser = null
  try {
    logger.info({ userid: user.id }, 'Launching browser for KTU login')

    browser = await puppeteer.launch({
      headless: true,
      executablePath: env.PUPPETEER_EXECUTABLE_PATH ?? undefined,
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    })

    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )

    // Navigate to login
    await page.goto('https://app.ktu.edu.in/login.jsp', { waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForSelector('#login-username', { timeout: 10000 })

    // Fill credentials
    await page.type('#login-username', user.id, { delay: 50 })
    await page.type('#login-password', user.password, { delay: 50 })

    // Submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('#btn-login'),
    ])

    const postLoginUrl = page.url()
    logger.info({ url: postLoginUrl }, 'Post-login URL')

    if (postLoginUrl.includes('login.jsp') || postLoginUrl.includes('login.htm')) {
      throw new Error('Login failed — invalid credentials or portal blocked automation')
    }

    // Navigate to student details page
    await page.goto('https://app.ktu.edu.in/eu/stu/studentDetailsView.htm', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    })

    if (page.url().includes('login')) {
      throw new Error('Session expired — redirected to login on student details page')
    }

    const html = await page.content()
    const $ = cheerio.load(html)
    const data = parseData($)

    // Cache result for 24 hours
    await setUserRedis(user, data)
    logger.info({ userid: user.id }, 'Student data fetched and cached')

    return data
  } finally {
    if (browser) {
      await browser.close()
      logger.debug('Browser closed')
    }
  }
}

export default getStudentDetails
