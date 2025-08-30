"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"
import { PartnerService } from "@/services/partner-service"
import { useToast } from "@/hooks/use-toast"
import type { PartnerAdminVm } from "@/services/partner-service"

interface PartnerApprovalDialogProps {
  partner: PartnerAdminVm
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PartnerApprovalDialog({ 
  partner, 
  open, 
  onOpenChange, 
  onSuccess 
}: PartnerApprovalDialogProps) {
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleApprove = async () => {
    setLoading(true)
    try {
      await PartnerService.approvePartner(partner.id, {
        adminUserId: "current-admin-id", // TODO: Get from auth context
        notes: notes || undefined
      })
      
      toast({
        title: "Thành công",
        description: "Đã phê duyệt đối tác thành công",
      })
      
      onSuccess()
      onOpenChange(false)
      setNotes("")
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể phê duyệt đối tác",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Phê duyệt đối tác
          </DialogTitle>
          <DialogDescription>
            Xác nhận phê duyệt đơn đăng ký của {partner.businessName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sau khi phê duyệt, đối tác sẽ được kích hoạt tài khoản và có thể đăng nhập vào hệ thống.
              Email thông báo sẽ được gửi tới {partner.email}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú phê duyệt (tùy chọn)</Label>
            <Textarea
              id="notes"
              placeholder="Nhập ghi chú nếu cần..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Thông tin đối tác:</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Loại hình:</span>
                <span className="font-medium">{partner.partnerType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{partner.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày đăng ký:</span>
                <span className="font-medium">
                  {partner.applicationDate 
                    ? new Date(partner.applicationDate).toLocaleDateString("vi-VN")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleApprove} disabled={loading}>
            {loading ? "Đang xử lý..." : "Phê duyệt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
