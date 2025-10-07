/**
 * Timezone utility for handling date/time conversions
 * Automatically detects user timezone and converts UTC to local time
 */

import { format, parseISO } from 'date-fns'
import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz'

// Default timezone for the application (Vietnam)
export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh'

// Supported timezones
export const SUPPORTED_TIMEZONES = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Kuala_Lumpur',
  'Asia/Jakarta',
  'Asia/Manila',
  'UTC',
] as const

export type SupportedTimezone = typeof SUPPORTED_TIMEZONES[number]

/**
 * Detect user's timezone using browser API
 */
export function detectUserTimezone(): string {
  try {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    // Check if detected timezone is in our supported list
    if (SUPPORTED_TIMEZONES.includes(detectedTimezone as SupportedTimezone)) {
      return detectedTimezone
    }

    // Map common timezones to our supported ones
    const timezoneMap: Record<string, string> = {
      'Asia/Saigon': 'Asia/Ho_Chi_Minh',
      'Asia/Phnom_Penh': 'Asia/Bangkok',
      'Asia/Vientiane': 'Asia/Bangkok',
      'Asia/Rangoon': 'Asia/Bangkok',
      'Asia/Yangon': 'Asia/Bangkok',
    }

    if (timezoneMap[detectedTimezone]) {
      return timezoneMap[detectedTimezone]
    }

    return detectedTimezone
  } catch (error) {
    console.error('Failed to detect timezone:', error)
    return DEFAULT_TIMEZONE
  }
}

/**
 * Get user's timezone offset in hours
 */
export function getTimezoneOffset(timezone?: string): number {
  const tz = timezone || detectUserTimezone()
  const date = new Date()
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }))
  return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60)
}

/**
 * Convert UTC date string to user's local timezone
 */
export function utcToLocal(
  utcDate: string | Date,
  timezone?: string
): Date {
  const tz = timezone || detectUserTimezone()
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate
  return toZonedTime(date, tz)
}

/**
 * Convert local date to UTC
 */
export function localToUtc(
  localDate: string | Date,
  timezone?: string
): Date {
  const tz = timezone || detectUserTimezone()
  const date = typeof localDate === 'string' ? parseISO(localDate) : localDate
  return fromZonedTime(date, tz)
}

/**
 * Format UTC date to local timezone with custom format
 */
export function formatUtcToLocal(
  utcDate: string | Date,
  formatStr: string = 'PPP p',
  timezone?: string
): string {
  const tz = timezone || detectUserTimezone()
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate
  return formatInTimeZone(date, tz, formatStr)
}

/**
 * Format date with timezone abbreviation
 */
export function formatWithTimezone(
  date: string | Date,
  formatStr: string = 'PPP p',
  timezone?: string
): string {
  const tz = timezone || detectUserTimezone()
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const formatted = formatInTimeZone(dateObj, tz, formatStr)
  const tzAbbr = formatInTimeZone(dateObj, tz, 'zzz')
  return `${formatted} (${tzAbbr})`
}

/**
 * Get current time in user's timezone
 */
export function getCurrentTimeInTimezone(timezone?: string): Date {
  const tz = timezone || detectUserTimezone()
  return toZonedTime(new Date(), tz)
}

/**
 * Check if a date is today in user's timezone
 */
export function isToday(date: string | Date, timezone?: string): boolean {
  const tz = timezone || detectUserTimezone()
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  const today = getCurrentTimeInTimezone(tz)

  return formatInTimeZone(dateObj, tz, 'yyyy-MM-dd') ===
         formatInTimeZone(today, tz, 'yyyy-MM-dd')
}

/**
 * Get timezone display name
 */
export function getTimezoneDisplayName(timezone: string): string {
  const names: Record<string, string> = {
    'Asia/Ho_Chi_Minh': 'Vietnam (GMT+7)',
    'Asia/Bangkok': 'Bangkok (GMT+7)',
    'Asia/Singapore': 'Singapore (GMT+8)',
    'Asia/Tokyo': 'Tokyo (GMT+9)',
    'Asia/Seoul': 'Seoul (GMT+9)',
    'Asia/Shanghai': 'Shanghai (GMT+8)',
    'Asia/Hong_Kong': 'Hong Kong (GMT+8)',
    'Asia/Kuala_Lumpur': 'Kuala Lumpur (GMT+8)',
    'Asia/Jakarta': 'Jakarta (GMT+7)',
    'Asia/Manila': 'Manila (GMT+8)',
    'UTC': 'UTC (GMT+0)',
  }

  return names[timezone] || timezone
}

/**
 * Common date format presets for different locales
 */
export const DATE_FORMATS = {
  // Vietnamese formats
  VN: {
    date: 'dd/MM/yyyy',
    dateTime: 'dd/MM/yyyy HH:mm',
    dateTimeFull: 'dd/MM/yyyy HH:mm:ss',
    time: 'HH:mm',
    timeFull: 'HH:mm:ss',
    dayMonth: 'dd/MM',
    monthYear: 'MM/yyyy',
    full: 'EEEE, dd/MM/yyyy',
  },
  // US formats
  US: {
    date: 'MM/dd/yyyy',
    dateTime: 'MM/dd/yyyy hh:mm a',
    dateTimeFull: 'MM/dd/yyyy hh:mm:ss a',
    time: 'hh:mm a',
    timeFull: 'hh:mm:ss a',
    dayMonth: 'MM/dd',
    monthYear: 'MM/yyyy',
    full: 'EEEE, MMMM dd, yyyy',
  },
  // ISO formats
  ISO: {
    date: 'yyyy-MM-dd',
    dateTime: "yyyy-MM-dd'T'HH:mm",
    dateTimeFull: "yyyy-MM-dd'T'HH:mm:ss",
    time: 'HH:mm',
    timeFull: 'HH:mm:ss',
    dayMonth: 'MM-dd',
    monthYear: 'yyyy-MM',
    full: 'EEEE, yyyy-MM-dd',
  },
} as const

/**
 * Get date format based on user's locale
 */
export function getDateFormat(locale: string = 'vn'): typeof DATE_FORMATS.VN {
  const localeUpper = locale.toUpperCase()
  if (localeUpper.startsWith('VI') || localeUpper === 'VN') {
    return DATE_FORMATS.VN
  }
  if (localeUpper.startsWith('EN-US') || localeUpper === 'US') {
    return DATE_FORMATS.US
  }
  return DATE_FORMATS.ISO
}

/**
 * Format date according to user's locale and timezone
 */
export function formatDate(
  date: string | Date,
  type: keyof typeof DATE_FORMATS.VN = 'dateTime',
  locale?: string,
  timezone?: string
): string {
  const formats = getDateFormat(locale)
  return formatUtcToLocal(date, formats[type], timezone)
}

