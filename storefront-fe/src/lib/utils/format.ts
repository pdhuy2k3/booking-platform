import { format, parseISO, isValid } from "date-fns";

/**
 * Format currency with proper locale and currency code
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format date with various options
 */
export function formatDate(
  date: string | Date,
  formatString: string = "MMM dd, yyyy"
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return "Invalid date";
    }
    return format(dateObj, formatString);
  } catch (error) {
    return "Invalid date";
  }
}

/**
 * Format duration (e.g., flight duration)
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Format passenger count
 */
export function formatPassengerCount(
  adults: number,
  children: number = 0,
  infants: number = 0
): string {
  const parts: string[] = [];
  
  if (adults > 0) {
    parts.push(`${adults} adult${adults > 1 ? "s" : ""}`);
  }
  
  if (children > 0) {
    parts.push(`${children} child${children > 1 ? "ren" : ""}`);
  }
  
  if (infants > 0) {
    parts.push(`${infants} infant${infants > 1 ? "s" : ""}`);
  }
  
  return parts.join(", ");
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
}

