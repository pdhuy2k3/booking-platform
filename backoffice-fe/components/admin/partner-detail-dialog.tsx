"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Building2, Mail, Phone, MapPin, Calendar, FileText, Globe, 
  CheckCircle, XCircle, Clock, User, CreditCard, Hotel, 
  Car, Activity, AlertCircle, UserCheck, Ban
} from "lucide-react"
import type { PartnerAdminVm } from "@/services/partner-service"

interface PartnerDetailDialogProps {
  partner: PartnerAdminVm
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PartnerDetailDialog({ partner, open, onOpenChange }: PartnerDetailDialogProps) {
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "suspended":
        return <Ban className="w-4 h-4 text-gray-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "HOTEL":
        return <Hotel className="w-5 h-5" />
      case "TRANSPORT":
        return <Car className="w-5 h-5" />
      case "ACTIVITY":
        return <Activity className="w-5 h-5" />
      default:
        return <Building2 className="w-5 h-5" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getTypeIcon(partner.partnerType)}
            <div className="flex-1">
              <DialogTitle className="text-xl">{partner.businessName || "Đối tác"}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                {getStatusIcon(partner.approvalStatus)}
                <span className="capitalize">{partner.approvalStatus || "N/A"}</span>
                {partner.partnerType && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>{partner.partnerType}</span>
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Thông tin chung</TabsTrigger>
            <TabsTrigger value="business">Doanh nghiệp</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[50vh] mt-4">
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Thông tin liên hệ</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Người liên hệ</p>
                      <p className="font-medium">{partner.contactPersonName || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium">{partner.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="font-medium">{partner.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Địa chỉ</p>
                      <p className="font-medium">{partner.businessAddress || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Trạng thái tài khoản</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái duyệt</p>
                    <Badge variant={partner.approvalStatus === "approved" ? "default" : "secondary"}>
                      {partner.approvalStatus || "N/A"}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái onboarding</p>
                    <Badge variant="outline">
                      {partner.onboardingStatus || "N/A"}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tài khoản</p>
                    <Badge variant={partner.enabled ? "default" : "secondary"}>
                      {partner.enabled ? "Hoạt động" : "Vô hiệu hóa"}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Quản lý bởi</p>
                    <p className="font-medium">{partner.accountManager || "Chưa phân công"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Thông tin doanh nghiệp</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Tên doanh nghiệp</p>
                      <p className="font-medium">{partner.businessName || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Số đăng ký kinh doanh</p>
                      <p className="font-medium">{partner.businessRegistrationNumber || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Mã số thuế</p>
                      <p className="font-medium">{partner.taxId || "N/A"}</p>
                    </div>
                  </div>
                  
                  {partner.partnerType === "HOTEL" && (
                    <div className="flex items-center gap-3">
                      <Hotel className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Số lượng khách sạn</p>
                        <p className="font-medium">{partner.totalProperties || 0}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-500 uppercase">Lịch sử hoạt động</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Ngày đăng ký</p>
                      <p className="font-medium">
                        {partner.applicationDate 
                          ? new Date(partner.applicationDate).toLocaleDateString("vi-VN")
                          : new Date(partner.createdTimestamp).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  
                  {partner.approvedDate && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs text-gray-500">Ngày phê duyệt</p>
                        <p className="font-medium">
                          {new Date(partner.approvedDate).toLocaleDateString("vi-VN")}
                        </p>
                        {partner.approvalNotes && (
                          <p className="text-sm text-gray-600 mt-1">
                            Ghi chú: {partner.approvalNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {partner.rejectedDate && (
                    <div className="flex items-center gap-3">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-xs text-gray-500">Ngày từ chối</p>
                        <p className="font-medium">
                          {new Date(partner.rejectedDate).toLocaleDateString("vi-VN")}
                        </p>
                        {partner.rejectionReason && (
                          <p className="text-sm text-gray-600 mt-1">
                            Lý do: {partner.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {partner.lastLogin && (
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Đăng nhập lần cuối</p>
                        <p className="font-medium">
                          {new Date(partner.lastLogin).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
