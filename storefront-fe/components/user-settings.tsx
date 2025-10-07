/**
 * User Settings component for managing timezone, currency, language, and location preferences
 */
"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { usePreferences } from '@/contexts/preferences-context'
import { SUPPORTED_TIMEZONES, getTimezoneDisplayName } from '@/lib/timezone'
import { Globe, MapPin, DollarSign, Clock, Languages, Loader2 } from 'lucide-react'
import { useDateFormatter } from '@/hooks/use-date-formatter'

const SUPPORTED_CURRENCIES = [
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
]

const SUPPORTED_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'th', name: 'ภาษาไทย' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
]

const DATE_FORMAT_OPTIONS = [
  { value: 'VN', label: 'Vietnamese (dd/MM/yyyy)', example: '05/10/2025' },
  { value: 'US', label: 'US (MM/dd/yyyy)', example: '10/05/2025' },
  { value: 'ISO', label: 'ISO (yyyy-MM-dd)', example: '2025-10-05' },
]

export function UserSettings() {
  const {
    preferences,
    locationInfo,
    isDetectingLocation,
    updatePreferences,
    detectAndApplyLocation,
  } = usePreferences()

  const { formatDateTime, timezone } = useDateFormatter()

  const handleTimezoneChange = (value: string) => {
    updatePreferences({ timezone: value })
  }

  const handleCurrencyChange = (value: string) => {
    updatePreferences({ currency: value })
  }

  const handleLanguageChange = (value: string) => {
    updatePreferences({ language: value })
  }

  const handleDateFormatChange = (value: string) => {
    updatePreferences({ dateFormat: value as 'VN' | 'US' | 'ISO' })
  }

  const handleAutoDetectToggle = (checked: boolean) => {
    updatePreferences({ autoDetectLocation: checked })
    if (checked) {
      detectAndApplyLocation()
    }
  }

  const handleManualDetect = () => {
    detectAndApplyLocation()
  }

  const currentTime = new Date().toISOString()

  return (
    <div className="space-y-6">
      {/* Location Detection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Location Detection</CardTitle>
            </div>
            {isDetectingLocation && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <CardDescription>
            Automatically detect your location to set timezone, currency, and language preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-detect">Auto-detect location</Label>
              <p className="text-sm text-muted-foreground">
                Automatically detect and apply location on login
              </p>
            </div>
            <Switch
              id="auto-detect"
              checked={preferences.autoDetectLocation ?? true}
              onCheckedChange={handleAutoDetectToggle}
              disabled={isDetectingLocation}
            />
          </div>

          <Button
            variant="outline"
            onClick={handleManualDetect}
            disabled={isDetectingLocation}
            className="w-full"
          >
            {isDetectingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting location...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Detect Location Now
              </>
            )}
          </Button>

          {locationInfo && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">Detected Location:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium">Country:</span> {locationInfo.country} ({locationInfo.countryCode})
                </p>
                {locationInfo.city && (
                  <p>
                    <span className="font-medium">City:</span> {locationInfo.city}
                  </p>
                )}
                {locationInfo.region && (
                  <p>
                    <span className="font-medium">Region:</span> {locationInfo.region}
                  </p>
                )}
                <p>
                  <span className="font-medium">Timezone:</span> {locationInfo.timezone}
                </p>
                <p>
                  <span className="font-medium">Currency:</span> {locationInfo.currency}
                </p>
                <p>
                  <span className="font-medium">Language:</span> {locationInfo.language}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Timezone & Date Format</CardTitle>
          </div>
          <CardDescription>
            Configure how dates and times are displayed throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {getTimezoneDisplayName(tz)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Current time: {formatDateTime(currentTime)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-format">Date Format</Label>
            <Select value={preferences.dateFormat || 'VN'} onValueChange={handleDateFormatChange}>
              <SelectTrigger id="date-format">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMAT_OPTIONS.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{format.label}</span>
                      <Badge variant="secondary" className="ml-2">
                        {format.example}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Currency</CardTitle>
          </div>
          <CardDescription>
            Select your preferred currency for displaying prices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Select value={preferences.currency || 'VND'} onValueChange={handleCurrencyChange}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <Badge variant="outline">{currency.code}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <CardTitle>Language</CardTitle>
          </div>
          <CardDescription>
            Select your preferred language for the interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="language">Preferred Language</Label>
          <Select value={preferences.language || 'vi'} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">Current Settings Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timezone:</span>
            <span className="font-medium">{getTimezoneDisplayName(timezone)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-medium">
              {SUPPORTED_CURRENCIES.find((c) => c.code === preferences.currency)?.name || 'Vietnamese Dong'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Language:</span>
            <span className="font-medium">
              {SUPPORTED_LANGUAGES.find((l) => l.code === preferences.language)?.name || 'Tiếng Việt'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date Format:</span>
            <span className="font-medium">
              {DATE_FORMAT_OPTIONS.find((f) => f.value === preferences.dateFormat)?.label || 'Vietnamese'}
            </span>
          </div>
          {locationInfo && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">
                {locationInfo.city ? `${locationInfo.city}, ` : ''}
                {locationInfo.country}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

