/**
 * Hook for formatting dates with user's timezone and locale preferences
 */

import { usePreferences } from '@/contexts/preferences-context'
import {
  formatUtcToLocal,
  formatWithTimezone,
  formatDate,
  utcToLocal,
  isToday,
  DATE_FORMATS
} from '@/lib/timezone'

export function useDateFormatter() {
  const { getTimezone, getLanguage, getDateFormat } = usePreferences()

  /**
   * Format UTC date to user's local time
   */
  const formatDateTime = (
    utcDate: string | Date,
    formatType: keyof typeof DATE_FORMATS.VN = 'dateTime'
  ): string => {
    const timezone = getTimezone()
    const locale = getLanguage()
    return formatDate(utcDate, formatType, locale, timezone)
  }

  /**
   * Format UTC date with timezone abbreviation
   */
  const formatDateTimeWithTz = (
    utcDate: string | Date,
    formatType: keyof typeof DATE_FORMATS.VN = 'dateTime'
  ): string => {
    const timezone = getTimezone()
    const locale = getLanguage()
    const formats = DATE_FORMATS[getDateFormat()]
    return formatWithTimezone(utcDate, formats[formatType], timezone)
  }

  /**
   * Format date only (no time)
   */
  const formatDateOnly = (utcDate: string | Date): string => {
    return formatDateTime(utcDate, 'date')
  }

  /**
   * Format time only (no date)
   */
  const formatTimeOnly = (utcDate: string | Date): string => {
    return formatDateTime(utcDate, 'time')
  }

  /**
   * Format full date and time
   */
  const formatFull = (utcDate: string | Date): string => {
    return formatDateTime(utcDate, 'full')
  }

  /**
   * Convert UTC to local Date object
   */
  const toLocal = (utcDate: string | Date): Date => {
    const timezone = getTimezone()
    return utcToLocal(utcDate, timezone)
  }

  /**
   * Check if date is today
   */
  const checkIsToday = (date: string | Date): boolean => {
    const timezone = getTimezone()
    return isToday(date, timezone)
  }

  /**
   * Get relative time (e.g., "2 hours ago", "in 3 days")
   */
  const formatRelative = (utcDate: string | Date): string => {
    const localDate = toLocal(utcDate)
    const now = new Date()
    const diffMs = localDate.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (Math.abs(diffMins) < 1) return 'Vừa xong'
    if (Math.abs(diffMins) < 60) {
      return diffMins > 0 ? `Sau ${diffMins} phút` : `${Math.abs(diffMins)} phút trước`
    }
    if (Math.abs(diffHours) < 24) {
      return diffHours > 0 ? `Sau ${diffHours} giờ` : `${Math.abs(diffHours)} giờ trước`
    }
    if (Math.abs(diffDays) < 7) {
      return diffDays > 0 ? `Sau ${diffDays} ngày` : `${Math.abs(diffDays)} ngày trước`
    }

    return formatDateTime(utcDate, 'date')
  }

  /**
   * Format flight time (departure/arrival)
   */
  const formatFlightTime = (utcDate: string | Date): {
    date: string
    time: string
    full: string
  } => {
    return {
      date: formatDateOnly(utcDate),
      time: formatTimeOnly(utcDate),
      full: formatDateTime(utcDate),
    }
  }

  return {
    formatDateTime,
    formatDateTimeWithTz,
    formatDateOnly,
    formatTimeOnly,
    formatFull,
    formatRelative,
    formatFlightTime,
    toLocal,
    checkIsToday,
    timezone: getTimezone(),
    language: getLanguage(),
    dateFormat: getDateFormat(),
  }
}

