"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { UserInfo } from '@/lib/auth-client'
import { UserPreferences, UserAddress } from '@/lib/validation-schemas'
import { detectUserLocation, type LocationInfo } from '@/lib/location'
import { detectUserTimezone } from '@/lib/timezone'

interface PreferencesContextType {
  preferences: UserPreferences
  address: UserAddress
  locationInfo: LocationInfo | null
  isDetectingLocation: boolean
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateAddress: (address: Partial<UserAddress>) => void
  applyPreferences: () => void
  loadFromUser: (user: UserInfo) => void
  detectAndApplyLocation: () => Promise<void>
  getTimezone: () => string
  getCurrency: () => string
  getLanguage: () => string
  getDateFormat: () => 'VN' | 'US' | 'ISO'
}

const defaultPreferences: UserPreferences = {
  language: 'vi',
  currency: 'VND',
  timezone: 'Asia/Ho_Chi_Minh',
  dateFormat: 'VN',
  theme: 'auto',
  density: 'comfortable',
  notifications: 'email',
  autoDetectLocation: true,
  countryCode: 'VN',
}

const defaultAddress: UserAddress = {
  street: '',
  city: '',
  state: '',
  country: 'Vietnam',
  postalCode: ''
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [address, setAddress] = useState<UserAddress>(defaultAddress)
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)

  // Detect and apply location on mount
  const detectAndApplyLocation = useCallback(async () => {
    setIsDetectingLocation(true)
    try {
      const location = await detectUserLocation()
      setLocationInfo(location)

      // Only auto-apply if user has autoDetectLocation enabled or no preferences set
      const shouldAutoApply = preferences.autoDetectLocation !== false

      if (shouldAutoApply) {
        const newPreferences: Partial<UserPreferences> = {}

        // Update timezone if not already set
        if (!preferences.timezone || preferences.autoDetectLocation) {
          newPreferences.timezone = location.timezone
        }

        // Update currency if not already set
        if (!preferences.currency || preferences.autoDetectLocation) {
          newPreferences.currency = location.currency.toUpperCase()
        }

        // Update language if not already set
        if (!preferences.language || preferences.autoDetectLocation) {
          newPreferences.language = location.language
        }

        // Update country code
        newPreferences.countryCode = location.countryCode

        // Update date format based on country
        if (!preferences.dateFormat || preferences.autoDetectLocation) {
          newPreferences.dateFormat = location.countryCode === 'US' ? 'US' : 'VN'
        }

        updatePreferences(newPreferences)

        // Update address if location has city/region info
        if (location.city || location.region) {
          updateAddress({
            city: location.city,
            state: location.region,
            country: location.country,
          })
        }

        console.log('Location auto-detected and applied:', location)
      }
    } catch (error) {
      console.error('Failed to detect location:', error)
    } finally {
      setIsDetectingLocation(false)
    }
  }, [preferences.autoDetectLocation, preferences.timezone, preferences.currency, preferences.language, preferences.dateFormat])

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user-preferences')
    const savedAddress = localStorage.getItem('user-address')
    
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({ ...defaultPreferences, ...parsed })
      } catch (error) {
        console.error('Failed to parse saved preferences:', error)
      }
    } else {
      // No saved preferences, detect timezone from browser
      const detectedTimezone = detectUserTimezone()
      setPreferences(prev => ({ ...prev, timezone: detectedTimezone }))
    }
    
    if (savedAddress) {
      try {
        setAddress({ ...defaultAddress, ...JSON.parse(savedAddress) })
      } catch (error) {
        console.error('Failed to parse saved address:', error)
      }
    }
  }, [])

  // Detect location on mount if autoDetectLocation is enabled
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user-preferences')
    let shouldDetect = true

    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        shouldDetect = parsed.autoDetectLocation !== false
      } catch (error) {
        // Ignore parse errors
      }
    }

    if (shouldDetect) {
      detectAndApplyLocation()
    }
  }, [])

  // Apply preferences to the UI
  useEffect(() => {
    applyPreferences()
  }, [preferences])

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences }
      localStorage.setItem('user-preferences', JSON.stringify(updated))
      return updated
    })
  }

  const updateAddress = (newAddress: Partial<UserAddress>) => {
    setAddress(prev => {
      const updated = { ...prev, ...newAddress }
      localStorage.setItem('user-address', JSON.stringify(updated))
      return updated
    })
  }

  const applyPreferences = () => {
    const root = document.documentElement

    // Apply theme
    if (preferences.theme === 'dark' || (preferences.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply density
    if (preferences.density) {
      root.setAttribute('data-density', preferences.density)
    }

    // Apply language
    if (preferences.language) {
      document.documentElement.lang = preferences.language.split('-')[0]
    }

    // Store timezone in data attribute for easy access
    if (preferences.timezone) {
      root.setAttribute('data-timezone', preferences.timezone)
    }

    // Store currency in data attribute
    if (preferences.currency) {
      root.setAttribute('data-currency', preferences.currency)
    }
  }

  // Load preferences from user data
  const loadFromUser = (user: UserInfo) => {
    if (user.preferences) {
      updatePreferences(user.preferences)
    }
    if (user.address) {
      updateAddress(user.address)
    }
  }

  // Helper getters
  const getTimezone = () => preferences.timezone || detectUserTimezone()
  const getCurrency = () => preferences.currency || 'VND'
  const getLanguage = () => preferences.language || 'vi'
  const getDateFormat = () => preferences.dateFormat || 'VN'

  const value: PreferencesContextType = {
    preferences,
    address,
    locationInfo,
    isDetectingLocation,
    updatePreferences,
    updateAddress,
    applyPreferences,
    loadFromUser,
    detectAndApplyLocation,
    getTimezone,
    getCurrency,
    getLanguage,
    getDateFormat,
  }

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}

// Helper functions
export function formatFullAddress(address: UserAddress): string {
  const parts: string[] = []
  
  if (address.street) parts.push(address.street)
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.country) parts.push(address.country)
  if (address.postalCode) parts.push(address.postalCode)
  
  return parts.join(', ')
}

export function formatShortAddress(address: UserAddress): string {
  const parts: string[] = []
  
  if (address.city) parts.push(address.city)
  if (address.state) parts.push(address.state)
  if (address.country) parts.push(address.country)
  
  return parts.join(', ')
}

export function isAddressComplete(address: UserAddress): boolean {
  return !!(address.street && address.city && address.country)
}
