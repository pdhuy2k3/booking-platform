/**
 * Location detection service for automatically determining user's country and region
 */

export interface LocationInfo {
  country: string
  countryCode: string
  region?: string
  city?: string
  timezone: string
  currency: string
  language: string
  latitude?: number
  longitude?: number
}

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'VN': 'VND',
  'TH': 'THB',
  'SG': 'SGD',
  'MY': 'MYR',
  'ID': 'IDR',
  'PH': 'PHP',
  'JP': 'JPY',
  'KR': 'KRW',
  'CN': 'CNY',
  'HK': 'HKD',
  'TW': 'TWD',
  'US': 'USD',
  'GB': 'GBP',
  'EU': 'EUR',
  'AU': 'AUD',
  'CA': 'CAD',
}

// Country to language mapping
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'VN': 'vi',
  'TH': 'th',
  'SG': 'en',
  'MY': 'ms',
  'ID': 'id',
  'PH': 'en',
  'JP': 'ja',
  'KR': 'ko',
  'CN': 'zh',
  'HK': 'zh',
  'TW': 'zh',
  'US': 'en',
  'GB': 'en',
  'EU': 'en',
  'AU': 'en',
  'CA': 'en',
}

// Country to timezone mapping (primary timezone)
const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
  'VN': 'Asia/Saigon',
  'TH': 'Asia/Bangkok',
  'SG': 'Asia/Singapore',
  'MY': 'Asia/Kuala_Lumpur',
  'ID': 'Asia/Jakarta',
  'PH': 'Asia/Manila',
  'JP': 'Asia/Tokyo',
  'KR': 'Asia/Seoul',
  'CN': 'Asia/Shanghai',
  'HK': 'Asia/Hong_Kong',
  'TW': 'Asia/Taipei',
}

/**
 * Detect location from browser's geolocation API
 */
export async function detectLocationFromBrowser(): Promise<LocationInfo | null> {
  if (!navigator.geolocation) {
    console.warn('Geolocation is not supported by this browser')
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Try to get location details from reverse geocoding
        try {
          const locationInfo = await reverseGeocode(latitude, longitude)
          resolve(locationInfo)
        } catch (error) {
          console.error('Reverse geocoding failed:', error)
          resolve(null)
        }
      },
      (error) => {
        console.warn('Geolocation permission denied:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Reverse geocode coordinates to location info
 * Using Nominatim (OpenStreetMap) API - free and no API key required
 */
async function reverseGeocode(latitude: number, longitude: number): Promise<LocationInfo | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'BookingSmart/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Reverse geocoding failed')
    }

    const data = await response.json()
    const countryCode = data.address?.country_code?.toUpperCase() || 'VN'

    return {
      country: data.address?.country || 'Vietnam',
      countryCode,
      region: data.address?.state || data.address?.province,
      city: data.address?.city || data.address?.town,
      timezone: COUNTRY_TIMEZONE_MAP[countryCode] || 'Asia/Saigon',
      currency: COUNTRY_CURRENCY_MAP[countryCode] || 'VND',
      language: COUNTRY_LANGUAGE_MAP[countryCode] || 'vi',
      latitude,
      longitude,
    }
  } catch (error) {
    console.error('Failed to reverse geocode:', error)
    return null
  }
}

/**
 * Detect location from IP address using ipapi.co (free tier)
 */
export async function detectLocationFromIP(): Promise<LocationInfo | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'BookingSmart/1.0'
      }
    })

    if (!response.ok) {
      throw new Error('IP geolocation failed')
    }

    const data = await response.json()
    const countryCode = data.country_code || 'VN'

    return {
      country: data.country_name || 'Vietnam',
      countryCode,
      region: data.region,
      city: data.city,
      timezone: data.timezone || COUNTRY_TIMEZONE_MAP[countryCode] || 'Asia/Saigon',
      currency: data.currency || COUNTRY_CURRENCY_MAP[countryCode] || 'VND',
      language: data.languages?.split(',')[0] || COUNTRY_LANGUAGE_MAP[countryCode] || 'vi',
      latitude: data.latitude,
      longitude: data.longitude,
    }
  } catch (error) {
    console.error('Failed to detect location from IP:', error)
    return null
  }
}

/**
 * Detect location from browser language and timezone
 */
export function detectLocationFromBrowserSettings(): LocationInfo {
  // Get browser language
  const browserLang = navigator.language || 'vi-VN'
  const langCode = browserLang.split('-')[0]

  // Get browser timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  // Try to guess country from timezone
  let countryCode = 'VN'
  for (const [country, tz] of Object.entries(COUNTRY_TIMEZONE_MAP)) {
    if (tz === timezone) {
      countryCode = country
      break
    }
  }

  // If language is Vietnamese, default to Vietnam
  if (langCode === 'vi') {
    countryCode = 'VN'
  }

  return {
    country: getCountryName(countryCode),
    countryCode,
    timezone: timezone || COUNTRY_TIMEZONE_MAP[countryCode] || 'Asia/Saigon',
    currency: COUNTRY_CURRENCY_MAP[countryCode] || 'VND',
    language: langCode || 'vi',
  }
}

/**
 * Get full country name from country code
 */
function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'VN': 'Vietnam',
    'TH': 'Thailand',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'US': 'United States',
    'GB': 'United Kingdom',
    'AU': 'Australia',
    'CA': 'Canada',
  }
  return countryNames[countryCode] || countryCode
}

/**
 * Comprehensive location detection with fallback chain
 */
export async function detectUserLocation(): Promise<LocationInfo> {
  // Try IP-based detection first (faster and doesn't require permission)
  try {
    const ipLocation = await detectLocationFromIP()
    if (ipLocation) {
      console.log('Location detected from IP:', ipLocation)
      return ipLocation
    }
  } catch (error) {
    console.warn('IP-based location detection failed:', error)
  }

  // Try browser geolocation (requires permission)
  try {
    const browserLocation = await detectLocationFromBrowser()
    if (browserLocation) {
      console.log('Location detected from browser geolocation:', browserLocation)
      return browserLocation
    }
  } catch (error) {
    console.warn('Browser geolocation failed:', error)
  }

  // Fallback to browser settings
  const settingsLocation = detectLocationFromBrowserSettings()
  console.log('Location detected from browser settings:', settingsLocation)
  return settingsLocation
}

/**
 * Get location display string
 */
export function formatLocation(location: LocationInfo): string {
  const parts: string[] = []

  if (location.city) parts.push(location.city)
  if (location.region) parts.push(location.region)
  parts.push(location.country)

  return parts.join(', ')
}

/**
 * Check if location detection is supported
 */
export function isLocationDetectionSupported(): boolean {
  return 'geolocation' in navigator
}

