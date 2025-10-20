import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { detectUserLocation, type LocationInfo } from '@/lib/location';

interface CurrencyFormatterOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Hook for formatting currency with user's preferences
 */
export function useCurrencyFormatter() {
  const { user } = useAuth();
  const [detectedCurrency, setDetectedCurrency] = useState<string>('VND');
  
  // Detect user's location-based currency on initial load if not set in preferences
  useEffect(() => {
    if (!user?.preferences?.currency) {
      const detectAndSetCurrency = async () => {
        try {
          const location = await detectUserLocation();
          setDetectedCurrency(location.currency);
        } catch (error) {
          console.warn('Failed to detect user location for currency, defaulting to VND', error);
          setDetectedCurrency('VND');
        }
      };
      
      void detectAndSetCurrency();
    } else {
      setDetectedCurrency(user.preferences.currency);
    }
  }, [user?.preferences?.currency]);

  const userCurrency = user?.preferences?.currency || detectedCurrency;

  /**
   * Format amount based on currency and user preferences
   */
  const formatCurrency = (
    amount: number | string, 
    currencyCode?: string,
    options?: CurrencyFormatterOptions
  ): string => {
    // Convert string amount to number if needed
    const numericAmount = typeof amount === 'string' 
      ? extractNumberFromString(amount) 
      : amount;

    if (typeof numericAmount !== 'number' || isNaN(numericAmount)) {
      return 'N/A';
    }

    const resolvedCurrency = currencyCode || userCurrency;
    const resolvedOptions = options || {};

    // Handle VND specifically: no decimal places
    if (resolvedCurrency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        ...resolvedOptions,
      }).format(numericAmount);
    }

    // For other currencies, use standard formatting
    return new Intl.NumberFormat(
      resolvedOptions.locale || 'en-US', 
      {
        style: 'currency',
        currency: resolvedCurrency,
        minimumFractionDigits: resolvedOptions.minimumFractionDigits ?? 2,
        maximumFractionDigits: resolvedOptions.maximumFractionDigits ?? 2,
        ...resolvedOptions,
      }
    ).format(numericAmount);
  };

  /**
   * Format price with user's default currency
   */
  const formatPrice = (amount: number | string): string => {
    return formatCurrency(amount, userCurrency);
  };

  /**
   * Format currency in compact form (e.g., 1.5M VND)
   */
  const formatCurrencyCompact = (
    amount: number | string, 
    currencyCode?: string,
    options?: CurrencyFormatterOptions
  ): string => {
    const numericAmount = typeof amount === 'string' 
      ? extractNumberFromString(amount) 
      : amount;

    if (typeof numericAmount !== 'number' || isNaN(numericAmount)) {
      return 'N/A';
    }

    const resolvedCurrency = currencyCode || userCurrency;

    // For VND compact format
    if (resolvedCurrency === 'VND' && numericAmount >= 1_000_000) {
      const millions = numericAmount / 1_000_000;
      return `${millions.toFixed(1)} triệu ${resolvedCurrency}`;
    }

    // For other currencies with compact format
    if (numericAmount >= 1_000_000) {
      const millions = numericAmount / 1_000_000;
      return `${millions.toFixed(1)}M ${resolvedCurrency}`;
    }

    if (numericAmount >= 1_000) {
      const thousands = numericAmount / 1_000;
      return `${thousands.toFixed(1)}K ${resolvedCurrency}`;
    }

    return formatCurrency(amount, resolvedCurrency, options);
  };

  return {
    formatCurrency,
    formatPrice,
    formatCurrencyCompact,
    currency: userCurrency,
  };
}

/**
 * Helper function to extract numeric value from string that may contain currency text
 * e.g., "Gia 2.444.500 vnd" -> 2444500
 */
function extractNumberFromString(input: string): number {
  if (!input) return NaN;

  // Remove common Vietnamese number separators and text, keep only digits and decimal points
  const cleaned = input
    .replace(/[^\d.,]/g, '') // Keep only digits, periods, commas
    .replace(/\./g, '') // Remove thousands separators (Vietnamese format uses dots)
    .replace(/,(\d{2})$/, '.$1'); // Handle the case where comma is used as decimal separator

  const number = parseFloat(cleaned);

  return isNaN(number) ? 0 : number;
}