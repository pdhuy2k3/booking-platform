"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserInfo } from '@/lib/auth-client'
import { UserPreferences, UserAddress } from '@/lib/validation-schemas'

interface PreferencesContextType {
  preferences: UserPreferences
  address: UserAddress
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateAddress: (address: Partial<UserAddress>) => void
  applyPreferences: () => void
  loadFromUser: (user: UserInfo) => void
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  currency: 'USD',
  theme: 'auto',
  density: 'comfortable',
  notifications: 'email'
}

const defaultAddress: UserAddress = {
  street: '',
  city: '',
  state: '',
  country: '',
  postalCode: ''
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)
  const [address, setAddress] = useState<UserAddress>(defaultAddress)

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('user-preferences')
    const savedAddress = localStorage.getItem('user-address')
    
    if (savedPreferences) {
      try {
        setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) })
      } catch (error) {
        console.error('Failed to parse saved preferences:', error)
      }
    }
    
    if (savedAddress) {
      try {
        setAddress({ ...defaultAddress, ...JSON.parse(savedAddress) })
      } catch (error) {
        console.error('Failed to parse saved address:', error)
      }
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
    // Apply theme
    const root = document.documentElement
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

  const value: PreferencesContextType = {
    preferences,
    address,
    updatePreferences,
    updateAddress,
    applyPreferences,
    loadFromUser
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
