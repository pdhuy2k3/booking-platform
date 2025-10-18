"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
        title: "Mật khẩu không khớp",
        description: "Mật khẩu mới và xác nhận mật khẩu không khớp.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Mật khẩu quá ngắn",
        description: "Mật khẩu mới phải có ít nhất 8 ký tự.",
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
      handleClose()
      onSuccess()
      toast({
        title: "Đã cập nhật mật khẩu",
        description: "Mật khẩu của bạn đã được cập nhật thành công.",
      })
    } catch (error) {
      console.error('Failed to update password:', error)
      toast({
        title: "Cập nhật mật khẩu thất bại",
        description: "Không thể cập nhật mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại của bạn và thử lại.",
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose()
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>Cập nhật mật khẩu tài khoản của bạn</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              disabled={isSaving}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-1 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="sm:min-w-[120px]"
          >
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            disabled={isSaving}
            className="sm:min-w-[160px]"
          >
            {isSaving ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Cập nhật mật khẩu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
