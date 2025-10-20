/**
 * Shared helpers for consistent date/time formatting across the storefront.
 */

import { formatInTimeZone, parseISO } from 'date-fns-tz'
import { vi } from 'date-fns/locale'

const FALLBACK_LABEL = 'Chưa có'

type DateInput = string | number | Date | null | undefined

const coerceToDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Format a datetime for booking UIs using dd/MM/yyyy HH:MM:SS format.
 * Accepts strings or Date objects and gracefully handles invalid inputs.
 */
export const formatBookingDateTime = (
  value: DateInput,
  options: { locale?: string; timeZone?: string } = {},
): string => {
  const date = coerceToDate(value)
  if (!date) {
    return typeof value === 'string' && value.trim() ? value : FALLBACK_LABEL
  }

  const { timeZone } = options
  const locale = options.locale?.startsWith('vi') || options.locale === 'vn' ? vi : vi

  try {
    return formatInTimeZone(date, timeZone || 'Asia/Saigon', 'dd/MM/yyyy HH:mm:ss', { locale })
  } catch {
    return typeof value === 'string' ? value : FALLBACK_LABEL
  }
}

export const resolveDateTime = (rawDateTime?: string | null, date?: string, time?: string) => {
  if (rawDateTime) {
    const parsed = new Date(rawDateTime)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  if (date && time) {
    const trimmed = time.trim()
    const hasMeridiem = /\b(AM|PM)\b/i.test(trimmed)

    const normalized = (() => {
      if (hasMeridiem) {
        return trimmed
      }

      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(trimmed)) {
        return trimmed.length === 5 ? `${trimmed}:00` : trimmed
      }

      return trimmed
    })()

    const composed = `${date} ${normalized}`
    const parsed = new Date(composed)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  if (time) {
    const parsed = new Date(`1970-01-01 ${time.trim()}`)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }

  return undefined
}
