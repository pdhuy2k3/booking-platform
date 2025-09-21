"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  MapPin, 
  Settings, 
  Bell, 
  Globe, 
  DollarSign, 
  Palette, 
  Layout,
  Save,
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { AttributeService, UserAttribute } from '@/lib/attribute-service'
import { AttributeValidator } from '@/lib/attribute-validation'
import { ProfileService } from '@/lib/profile-service'
import { UserInfo } from '@/lib/auth-client'
import { usePreferences, formatFullAddress } from '@/contexts/preferences-context'
import { UserPreferences, UserAddress } from '@/lib/validation-schemas'
import { toast } from '@/hooks/use-toast'

interface AttributeManagerProps {
  user: UserInfo
  onUpdate: () => void
}

export function AttributeManager({ user, onUpdate }: AttributeManagerProps) {
  const [attributes, setAttributes] = useState<UserAttribute[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { preferences, address, updatePreferences, updateAddress } = usePreferences()

  useEffect(() => {
    const userAttributes = AttributeService.populateAttributesFromUser(user)
    setAttributes(userAttributes)
  }, [user])

  const handleAttributeChange = (name: string, value: string) => {
    setAttributes(prev => 
      prev.map(attr => 
        attr.name === name ? { ...attr, value } : attr
      )
    )

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateAllAttributes = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    attributes.forEach(attribute => {
      const error = AttributeValidator.validateField(attribute.name, String(attribute.value))
      if (error) {
        newErrors[attribute.name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSave = async () => {
    if (!validateAllAttributes()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Prepare attributes for update
      const attributesToUpdate: Record<string, string | string[]> = {}
      
      attributes.forEach(attribute => {
        if (attribute.value && String(attribute.value).trim() !== '') {
          attributesToUpdate[attribute.name] = attribute.value
        }
      })

      // Update attributes in backend
      await ProfileService.updateAttributes(attributesToUpdate)

      // Update local preferences context
      const newPreferences: Partial<UserPreferences> = {
        language: attributes.find(a => a.name === 'language')?.value as string || preferences.language,
        currency: attributes.find(a => a.name === 'currency')?.value as string || preferences.currency,
        theme: attributes.find(a => a.name === 'theme')?.value as 'light' | 'dark' | 'auto' || preferences.theme,
        density: attributes.find(a => a.name === 'density')?.value as 'compact' | 'comfortable' | 'spacious' || preferences.density,
        notifications: attributes.find(a => a.name === 'notifications')?.value as 'email' | 'sms' | 'push' | 'all' | 'none' || preferences.notifications,
      }

      const newAddress: Partial<UserAddress> = {
        street: attributes.find(a => a.name === 'street')?.value as string || address.street,
        city: attributes.find(a => a.name === 'city')?.value as string || address.city,
        state: attributes.find(a => a.name === 'state')?.value as string || address.state,
        country: attributes.find(a => a.name === 'country')?.value as string || address.country,
        postalCode: attributes.find(a => a.name === 'postalCode')?.value as string || address.postalCode,
      }

      updatePreferences(newPreferences)
      updateAddress(newAddress)

      setIsEditing(false)
      onUpdate()

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    const userAttributes = AttributeService.populateAttributesFromUser(user)
    setAttributes(userAttributes)
    setErrors({})
    setIsEditing(false)
  }

  const renderAttributeInput = (attribute: UserAttribute) => {
    const error = errors[attribute.name]

    if (attribute.type === 'select' && attribute.options) {
      return (
        <Select
          value={String(attribute.value)}
          onValueChange={(value) => handleAttributeChange(attribute.name, value)}
          disabled={!isEditing}
        >
          <SelectTrigger className={error ? 'border-red-500' : ''}>
            <SelectValue placeholder={`Select ${attribute.displayName.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {attribute.options.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    if (attribute.type === 'textarea') {
      return (
        <Textarea
          value={String(attribute.value)}
          onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
          disabled={!isEditing}
          className={error ? 'border-red-500' : ''}
          placeholder={attribute.hint}
          rows={3}
        />
      )
    }

    if (attribute.type === 'date') {
      return (
        <Input
          type="date"
          value={String(attribute.value)}
          onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
          disabled={!isEditing}
          className={error ? 'border-red-500' : ''}
        />
      )
    }

    return (
      <Input
        type="text"
        value={String(attribute.value)}
        onChange={(e) => handleAttributeChange(attribute.name, e.target.value)}
        disabled={!isEditing}
        className={error ? 'border-red-500' : ''}
        placeholder={attribute.hint}
      />
    )
  }

  const getAttributeIcon = (name: string) => {
    // Preferences group attributes
    if (['language', 'currency', 'theme', 'density', 'notifications'].includes(name)) {
      switch (name) {
        case 'language': return <Globe className="h-4 w-4" />
        case 'currency': return <DollarSign className="h-4 w-4" />
        case 'theme': return <Palette className="h-4 w-4" />
        case 'density': return <Layout className="h-4 w-4" />
        case 'notifications': return <Bell className="h-4 w-4" />
        default: return <Settings className="h-4 w-4" />
      }
    }
    
    // Address group attributes
    if (['street', 'city', 'state', 'country', 'postalCode'].includes(name)) {
      return <MapPin className="h-4 w-4" />
    }
    
    return <User className="h-4 w-4" />
  }

  const getAttributeCategory = (name: string) => {
    // Preferences group attributes
    if (['language', 'currency', 'theme', 'density', 'notifications'].includes(name)) {
      return 'preferences'
    }
    
    // Address group attributes
    if (['street', 'city', 'state', 'country', 'postalCode'].includes(name)) {
      return 'address'
    }
    
    return 'basic'
  }

  const basicAttributes = attributes.filter(attr => getAttributeCategory(attr.name) === 'basic')
  const preferenceAttributes = attributes.filter(attr => getAttributeCategory(attr.name) === 'preferences')
  // Address attributes are now handled in the profile tab, not here

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">User Preferences</CardTitle>
          <CardDescription>Manage your application preferences and settings</CardDescription>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Preferences
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-500 hover:bg-green-600"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="border-gray-700 hover:bg-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preferenceAttributes.map(attribute => (
              <div key={attribute.name} className="space-y-2">
                <Label htmlFor={attribute.name} className="flex items-center gap-2">
                  {getAttributeIcon(attribute.name)}
                  {attribute.displayName}
                </Label>
                {renderAttributeInput(attribute)}
                {errors[attribute.name] && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-400">
                      {errors[attribute.name]}
                    </AlertDescription>
                  </Alert>
                )}
                {attribute.hint && !errors[attribute.name] && (
                  <p className="text-xs text-gray-400">{attribute.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
