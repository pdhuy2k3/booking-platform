/**
 * Currency formatting utilities for Vietnamese Dong (VND)
 */

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  // For Vietnamese Dong, we don't show decimal places
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  // For other currencies, show standard formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPrice(amount: number): string {
  return formatCurrency(amount, 'VND');
}

export function formatCurrencyCompact(amount: number, currency: string = 'VND'): string {
  // Compact formatting (e.g., 1.5 triệu instead of 1,500,000)
  if (currency === 'VND' && amount >= 1000000) {
    const millions = amount / 1000000;
    return `${millions.toFixed(1)} triệu ${currency}`;
  }
  
  return formatCurrency(amount, currency);
}

/**
 * Helper function to extract numeric value from string that may contain currency text
 * e.g., "Gia 2.444.500 vnd" -> 2444500
 */
export function extractNumberFromString(input: string): number {
  if (!input) return NaN;

  // Remove common Vietnamese number separators and text, keep only digits and decimal points
  const cleaned = input
    .replace(/[^\d.,]/g, '') // Keep only digits, periods, commas
    .replace(/\./g, '') // Remove thousands separators (Vietnamese format uses dots)
    .replace(/,(\d{2})$/, '.$1'); // Handle the case where comma is used as decimal separator

  const number = parseFloat(cleaned);

  return isNaN(number) ? 0 : number;
}