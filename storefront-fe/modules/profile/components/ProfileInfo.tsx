"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Edit3, CheckCircle, Clock, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ProfileService } from "@/lib/profile-service"
import { mediaService } from "@/modules/media"
import { UserInfo } from "@/lib/auth-client"

interface ProfileInfoProps {
  user: UserInfo
  onUpdate: () => void
}

interface UserProfileInfo {
  fullName: string
  username: string
  email: string
  phone: string
  dateOfBirth: string
}

export function ProfileInfo({ user, onUpdate }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [userInfo, setUserInfo] = useState<UserProfileInfo>({
    fullName: user.fullName || "",
    username: user.username || "",
    email: user.email || "",
    phone: user.phone || "",
    dateOfBirth: user.dateOfBirth || "",
  })

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const profileData = {
        firstName: userInfo.fullName.split(' ')[0] || '',
        lastName: userInfo.fullName.split(' ').slice(1).join(' ') || '',
        email: userInfo.email,
      }

      await ProfileService.updateProfile(profileData)
      
      // Update basic info attributes
      const basicAttributes: Record<string, string> = {
        'phone': userInfo.phone,
        'dateOfBirth': userInfo.dateOfBirth,
      }

      const filteredAttributes = Object.fromEntries(
        Object.entries(basicAttributes).filter(([_, value]) => value.trim() !== '')
      )

      if (Object.keys(filteredAttributes).length > 0) {
        await ProfileService.updateAttributes(filteredAttributes)
      }

      await onUpdate()
      setIsEditing(false)
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

  const handleAvatarUpload = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploadingAvatar(true)
    try {
      const uploadResult = await mediaService.uploadImage(file, 'avatars')
      await ProfileService.updatePicture({ pictureUrl: uploadResult.secureUrl })
      await onUpdate()
      setAvatarPreview(uploadResult.secureUrl)
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been successfully updated.",
      })
    } catch (error) {
      console.error('Failed to update avatar:', error)
      toast({
        title: "Avatar Update Failed",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-gray-900">Personal Information</CardTitle>
          <CardDescription>Update your personal details and contact information</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
            disabled={isSaving}
            className={isEditing ? "bg-cyan-500 hover:bg-cyan-600" : "border-gray-300 hover:bg-gray-50"}
          >
            {isEditing ? (
              <>
                {isSaving ? (
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user.picture || avatarPreview || "/placeholder.svg?height=80&width=80"}
              />
              <AvatarFallback className="bg-cyan-500/10 text-cyan-400 text-2xl">
                {userInfo.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {isUploadingAvatar ? (
                <Clock className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Edit3 className="h-6 w-6 text-white" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploadingAvatar}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{userInfo.fullName}</h3>
            <p className="text-gray-600">{userInfo.email}</p>
            <p className="text-sm text-gray-500">Click to change avatar</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={userInfo.fullName}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, fullName: e.target.value }))}
              disabled={!isEditing}
              className="bg-white border-gray-300 disabled:opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={userInfo.username}
              disabled={true}
              className="bg-white border-gray-300 disabled:opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, email: e.target.value }))}
              disabled={!isEditing}
              className="bg-white border-gray-300 disabled:opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={userInfo.phone}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, phone: e.target.value }))}
              disabled={!isEditing}
              className="bg-white border-gray-300 disabled:opacity-60"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={userInfo.dateOfBirth}
              onChange={(e) => setUserInfo((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              disabled={!isEditing}
              className="bg-white border-gray-300 disabled:opacity-60"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
