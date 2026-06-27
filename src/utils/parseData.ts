import * as cheerio from 'cheerio'
import type { StudentData, GradeRow } from '../types'
import { env } from '../config/env'

export const parseData = ($: cheerio.CheerioAPI): StudentData => {
  // Profile name format: "JOHN DOE(ABC20CS001)Signature" — strip "Signature" suffix
  const rawName = $('.profile-title').text().replace('Signature', '').trim()
  const openParen = rawName.indexOf('(')
  const closeParen = rawName.indexOf(')')

  const username = openParen > -1 ? rawName.substring(0, openParen).trim() : rawName
  const userid = openParen > -1 && closeParen > -1 ? rawName.substring(openParen + 1, closeParen).trim() : ''

  const proimg = $('.card-bkimg').attr('src')
  const proImgUrl = proimg
    ? `http://app.ktu.edu.in${proimg}`
    : `${env.IMAGE_URL}${userid}.jpg`

  const data: StudentData = {
    username,
    userid,
    proimg: proImgUrl,
    S1: [], S1sgpa: '0',
    S2: [], S2sgpa: '0',
    S3: [], S3sgpa: '0',
    S4: [], S4sgpa: '0',
    S5: [], S5sgpa: '0',
    S6: [], S6sgpa: '0',
    S7: [], S7sgpa: '0',
    S8: [], S8sgpa: '0',
    activityPoints: {},
  }

  // Parse list-group-item key-value pairs (student profile fields)
  $('.list-group-item').each((_i, el) => {
    $(el).children().each((_j, child) => {
      try {
        const next = (child as cheerio.Element & { next: { data?: string } | null }).next
        if (next?.data) {
          const value = next.data.replace(/\t/g, '').replace(/\n/g, '').replace(/ {2,}/g, ' ').trim()
          const title = $(child).text().replace(/\s+/g, '').trim()
          if (title && value) {
            data[title] = value
          }
        }
      } catch {
        // Skip malformed elements
      }
    })
  })

  // Parse semester grades S1–S8
  for (let k = 1; k <= 8; k++) {
    const semester: GradeRow[] = []
    let sgpa = '0'

    $(`#collapseFiveS${k} .table tr`).each((_i, row) => {
      let col = 0
      const rowData: Partial<GradeRow> = {}

      $(row).children().each((_j, cell) => {
        const text = $(cell).text().trim()
        switch (col) {
          case 0: rowData.slot = cleanSlot(text); break
          case 1: rowData.course = text; break
          case 2: rowData.credit = text; break
          case 3: rowData.type = text; break
          case 4: rowData.completed = text.replace(/[\t\n\s]/g, ''); break
          case 6: rowData.grade = text; break
          case 7: rowData.earned = text; break
          case 8: sgpa = text; break
        }
        col++
      })

      // Skip header rows and empty rows
      if (rowData.slot && rowData.slot !== 'Slot' && rowData.course && rowData.course !== 'Course') {
        semester.push(rowData as GradeRow)
      }
    })

    data[`S${k}`] = semester
    data[`S${k}sgpa`] = sgpa
  }

  // Clean up DateofAdmission format
  if (typeof data.DateofAdmission === 'string') {
    const doa = data.DateofAdmission
    data.DateofAdmission = doa.replace(doa.substring(11, 24), '').replace(doa.substring(0, 4), '')
  }

  // Activity points
  const activityPoints: Record<string, string> = {}
  let tempKey = ''
  $('#collapseSix .col-sm-12 .table tr td').each((i, el) => {
    const text = $(el).text().replace(/[\t\n\s]/g, '')
    if (i % 2 === 0) {
      tempKey = text
    } else if (tempKey) {
      activityPoints[tempKey] = text
    }
  })
  data.activityPoints = activityPoints

  return data
}

/** Cleans slot names: removes excess whitespace, normalizes "(Elective)" */
const cleanSlot = (raw: string): string =>
  raw
    .replace(/[\t\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\uFFFD/g, '') // remove replacement chars
    .trim()
