/**
 * Currency formatting utilities for Vietnamese Dong (VND)
 */

export const CURRENCY = {
  VND: 'VND',
  SYMBOL: '₫',
  LOCALE: 'vi-VN'
} as const

/**
 * Format a number as Vietnamese Dong currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatVND(
  amount: number, 
  options: {
    showSymbol?: boolean
    showCurrency?: boolean
    compact?: boolean
  } = {}
): string {
  const { showSymbol = true, showCurrency = false, compact = false } = options

  if (compact && amount >= 1000000) {
    // Format millions as "1.5M ₫"
    const millions = amount / 1000000
    const formatted = millions % 1 === 0 ? millions.toString() : millions.toFixed(1)
    return `${formatted}M${showSymbol ? ' ₫' : ''}`
  }

  if (compact && amount >= 1000) {
    // Format thousands as "1.5K ₫"
    const thousands = amount / 1000
    const formatted = thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1)
    return `${formatted}K${showSymbol ? ' ₫' : ''}`
  }

  // Standard formatting with Vietnamese locale
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  if (showSymbol) {
    return `${formatted} ₫`
  }

  if (showCurrency) {
    return `${formatted} VND`
  }

  return formatted
}

/**
 * Format price for display in components
 * @param amount - The amount to format
 * @returns Formatted price string
 */
export function formatPrice(amount: number): string {
  return formatVND(amount, { showSymbol: true })
}

/**
 * Format price for compact display
 * @param amount - The amount to format
 * @returns Formatted price string
 */
export function formatPriceCompact(amount: number): string {
  return formatVND(amount, { showSymbol: true, compact: true })
}
