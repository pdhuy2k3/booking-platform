/**
 * Shared helpers for consistent date/time formatting across the storefront.
 */

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
 * Format a datetime for booking UIs, e.g. `13:15 11 thg 10, 2025`.
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

  const { locale = 'vi-VN', timeZone } = options

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  })

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone,
  })

  return `${timeFormatter.format(date)} ${dateFormatter.format(date)}`
}

