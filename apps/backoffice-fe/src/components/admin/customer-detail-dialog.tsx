"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Mail, Phone, MapPin, Star, ShoppingBag, DollarSign } from "lucide-react"
import type { Customer } from "@/types/api"

interface CustomerDetailDialogProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}

export function CustomerDetailDialog({ customer, open, onOpenChange, onEdit }: CustomerDetailDialogProps) {
  if (!customer) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>
      case "BANNED":
        return <Badge className="bg-red-100 text-red-800">Bị khóa</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return <Badge className="bg-purple-100 text-purple-800">Platinum</Badge>
      case "GOLD":
        return <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>
      case "SILVER":
        return <Badge className="bg-gray-100 text-gray-800">Silver</Badge>
      case "BRONZE":
        return <Badge className="bg-orange-100 text-orange-800">Bronze</Badge>
      default:
        return <Badge variant="secondary">{tier}</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết khách hàng</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về khách hàng
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Header với Avatar */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback className="text-lg">{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{customer.name}</h3>
              <p className="text-gray-600">{customer.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                {getStatusBadge(customer.status)}
                {getTierBadge(customer.tier)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Thông tin liên hệ</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
                {customer.nationality && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{customer.nationality}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Thông tin tài khoản</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    Tham gia: {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {customer.lastLoginAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      Đăng nhập cuối: {new Date(customer.lastLoginAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Thống kê */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Tổng đặt chỗ</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{customer.totalBookings}</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">Tổng chi tiêu</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(customer.totalSpent)}</p>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Hạng thành viên</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{customer.tier}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={onEdit}>
            Chỉnh sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
