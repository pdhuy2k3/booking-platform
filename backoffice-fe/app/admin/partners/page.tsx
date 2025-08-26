"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { 
  Search, MoreHorizontal, Eye, CheckCircle, XCircle, Building2, 
  Users, Clock, AlertCircle, TrendingUp, Hotel, Car, MapPin,
  Calendar, FileText, UserCheck, Ban, RefreshCw, Mail
} from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PartnerService, type PartnerAdminVm } from "@/services/partner-service"
import { PartnerDetailDialog } from "@/components/admin/partner-detail-dialog"
import { PartnerApprovalDialog } from "@/components/admin/partner-approval-dialog"
import { useToast } from "@/hooks/use-toast"
import type { PaginatedResponse } from "@/types/api"

export default function AdminPartners() {
  const [partners, setPartners] = useState<PaginatedResponse<PartnerAdminVm> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedPartner, setSelectedPartner] = useState<PartnerAdminVm | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const { toast } = useToast()

  // Statistics
  const [stats, setStats] = useState({
    totalPartners: 0,
    pendingApplications: 0,
    activePartners: 0,
    partnersByType: {} as { [key: string]: number }
  })

  useEffect(() => {
    loadPartners()
    loadStats()
  }, [searchTerm, selectedStatus, selectedType, currentPage])

  const loadPartners = async () => {
    try {
      setLoading(true)
      const data = await PartnerService.getPartners({
        search: searchTerm || undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        partnerType: selectedType !== "all" ? selectedType : undefined,
        page: currentPage,
        size: 10,
      })
      setPartners(data)
    } catch (error) {
      console.error("Failed to load partners:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đối tác",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await PartnerService.getPartnerStats()
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const handleViewPartner = (partner: PartnerAdminVm) => {
    setSelectedPartner(partner)
    setDetailDialogOpen(true)
  }

  const handleApprovePartner = (partner: PartnerAdminVm) => {
    setSelectedPartner(partner)
    setApprovalDialogOpen(true)
  }

  const handleRejectPartner = async (partner: PartnerAdminVm, reason: string) => {
    try {
      await PartnerService.rejectPartner(partner.id, {
        adminUserId: "current-admin-id", // TODO: Get from auth context
        reason
      })
      toast({
        title: "Thành công",
        description: "Đã từ chối đơn đăng ký đối tác",
      })
      loadPartners()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối đơn đăng ký",
        variant: "destructive",
      })
    }
  }

  const handleSuspendPartner = async (partner: PartnerAdminVm) => {
    if (!confirm(`Bạn có chắc chắn muốn tạm ngưng đối tác "${partner.businessName}"?`)) return

    try {
      await PartnerService.suspendPartner(partner.id, "Suspended by admin")
      toast({
        title: "Thành công",
        description: "Đã tạm ngưng hoạt động của đối tác",
      })
      loadPartners()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạm ngưng đối tác",
        variant: "destructive",
      })
    }
  }

  const handleReactivatePartner = async (partner: PartnerAdminVm) => {
    try {
      await PartnerService.reactivatePartner(partner.id)
      toast({
        title: "Thành công",
        description: "Đã kích hoạt lại đối tác",
      })
      loadPartners()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể kích hoạt lại đối tác",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
      case "suspended":
        return <Badge className="bg-gray-100 text-gray-800">Tạm ngưng</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case "HOTEL":
        return (
          <Badge variant="outline" className="gap-1">
            <Hotel className="w-3 h-3" />
            Khách sạn
          </Badge>
        )
      case "TRANSPORT":
        return (
          <Badge variant="outline" className="gap-1">
            <Car className="w-3 h-3" />
            Vận chuyển
          </Badge>
        )
      case "ACTIVITY":
        return (
          <Badge variant="outline" className="gap-1">
            <MapPin className="w-3 h-3" />
            Hoạt động
          </Badge>
        )
      default:
        return <Badge variant="outline">N/A</Badge>
    }
  }

  const getOnboardingBadge = (status: string | null) => {
    switch (status) {
      case "incomplete":
        return <Badge variant="outline" className="text-orange-600">Chưa hoàn thành</Badge>
      case "pending_review":
        return <Badge variant="outline" className="text-blue-600">Đang xem xét</Badge>
      case "approved":
        return <Badge variant="outline" className="text-green-600">Đã xác minh</Badge>
      case "active":
        return <Badge variant="outline" className="text-green-700">Đang hoạt động</Badge>
      default:
        return <Badge variant="outline">N/A</Badge>
    }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Đối tác</h1>
        <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý đối tác khách sạn, vận chuyển và hoạt động</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đối tác</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPartners}</div>
            <p className="text-xs text-muted-foreground">Đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Đơn đăng ký mới</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activePartners}</div>
            <p className="text-xs text-muted-foreground">Đối tác hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phân loại</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Khách sạn</span>
                <span className="font-medium">{stats.partnersByType.HOTEL || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Vận chuyển</span>
                <span className="font-medium">{stats.partnersByType.TRANSPORT || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Hoạt động</span>
                <span className="font-medium">{stats.partnersByType.ACTIVITY || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách đối tác</CardTitle>
              <CardDescription className="text-sm">Quản lý thông tin và trạng thái đối tác</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                  <SelectItem value="suspended">Tạm ngưng</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Loại đối tác" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="HOTEL">Khách sạn</SelectItem>
                  <SelectItem value="TRANSPORT">Vận chuyển</SelectItem>
                  <SelectItem value="ACTIVITY">Hoạt động</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm đối tác..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Đối tác</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Trạng thái duyệt</TableHead>
                  <TableHead>Onboarding</TableHead>
                  <TableHead>Tài sản</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : partners?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  partners?.content.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" />
                            <AvatarFallback>
                              {partner.businessName?.charAt(0) || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{partner.businessName || "N/A"}</div>
                            <div className="text-sm text-gray-500">{partner.contactPersonName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(partner.partnerType)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{partner.email}</div>
                          <div className="text-sm text-gray-500">{partner.phoneNumber || "N/A"}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {partner.applicationDate 
                          ? new Date(partner.applicationDate).toLocaleDateString("vi-VN")
                          : new Date(partner.createdTimestamp).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.approvalStatus)}</TableCell>
                      <TableCell>{getOnboardingBadge(partner.onboardingStatus)}</TableCell>
                      <TableCell className="text-center">
                        {partner.partnerType === "HOTEL" ? partner.totalProperties : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPartner(partner)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            
                            {partner.approvalStatus === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleApprovePartner(partner)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Phê duyệt
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => {
                                    const reason = prompt("Lý do từ chối:")
                                    if (reason) handleRejectPartner(partner, reason)
                                  }}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {partner.approvalStatus === "approved" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => {/* Send email */}}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Gửi email
                                </DropdownMenuItem>
                                {partner.enabled ? (
                                  <DropdownMenuItem 
                                    className="text-orange-600"
                                    onClick={() => handleSuspendPartner(partner)}
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Tạm ngưng
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => handleReactivatePartner(partner)}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Kích hoạt lại
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {partners && partners.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Trang trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {currentPage + 1} / {partners.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(partners.totalPages - 1, currentPage + 1))}
                disabled={currentPage >= partners.totalPages - 1}
              >
                Trang sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedPartner && (
        <>
          <PartnerDetailDialog
            partner={selectedPartner}
            open={detailDialogOpen}
            onOpenChange={setDetailDialogOpen}
          />
          
          <PartnerApprovalDialog
            partner={selectedPartner}
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            onSuccess={() => {
              loadPartners()
              setApprovalDialogOpen(false)
            }}
          />
        </>
      )}
    </AdminLayout>
  )
}
