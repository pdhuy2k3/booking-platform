"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { ProfileService } from "@/lib/profile-service"

interface PasswordChangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PasswordChangeModal({ isOpen, onClose, onSuccess }: PasswordChangeModalProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const passwordUpdateData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }

      await ProfileService.updatePassword(passwordUpdateData)
      onClose()
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      onSuccess()
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      })
    } catch (error) {
      console.error('Failed to update password:', error)
      toast({
        title: "Password Update Failed",
        description: "Failed to update password. Please check your current password and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="bg-gray-900/95 border-gray-800 w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-white">Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleChangePassword}
              disabled={isSaving}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {isSaving ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-700 hover:bg-gray-800"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
