"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, User, CreditCard, Plane, Building, Package } from "lucide-react"
import type { Booking } from "@/types/api"

interface BookingDetailDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingDetailDialog({ booking, open, onOpenChange }: BookingDetailDialogProps) {
  if (!booking) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>
      case "VALIDATION_PENDING":
        return <Badge className="bg-orange-100 text-orange-800">Chờ xác thực</Badge>
      case "PAYMENT_PENDING":
        return <Badge className="bg-blue-100 text-blue-800">Chờ thanh toán</Badge>
      case "PAID":
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
      case "PAYMENT_FAILED":
        return <Badge className="bg-red-100 text-red-800">Thanh toán thất bại</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Thất bại</Badge>
      case "VALIDATION_FAILED":
        return <Badge className="bg-red-100 text-red-800">Xác thực thất bại</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }



  const getTypeIcon = (bookingType: string) => {
    switch (bookingType) {
      case "FLIGHT":
        return <Plane className="h-4 w-4" />
      case "HOTEL":
        return <Building className="h-4 w-4" />
      case "COMBO":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(booking.bookingType)}
            Chi tiết đặt chỗ #{booking.bookingReference}
          </DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về đặt chỗ và trạng thái hiện tại
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trạng thái đặt chỗ</CardTitle>
              </CardHeader>
              <CardContent>
                {getStatusBadge(booking.status)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saga State</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{booking.sagaState}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tổng tiền</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(booking.totalAmount)}</div>
                <div className="text-xs text-muted-foreground">{booking.currency}</div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">User ID</div>
                  <div className="text-sm text-muted-foreground">{booking.userId}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Booking Source</div>
                  <div className="text-sm text-muted-foreground">{booking.bookingSource}</div>
                </div>
              </div>
              {booking.confirmationNumber && (
                <div>
                  <div className="text-sm font-medium">Số xác nhận</div>
                  <div className="text-sm text-muted-foreground">{booking.confirmationNumber}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(booking.bookingType)}
                Chi tiết dịch vụ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                try {
                  const productDetails = JSON.parse(booking.productDetailsJson);
                  
                  if (booking.bookingType === "HOTEL") {
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium">Khách sạn</div>
                            <div className="text-sm text-muted-foreground">{productDetails.hotelName}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Địa chỉ</div>
                            <div className="text-sm text-muted-foreground">{productDetails.hotelAddress}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium">Ngày nhận phòng</div>
                            <div className="text-sm text-muted-foreground">{productDetails.checkInDate}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Ngày trả phòng</div>
                            <div className="text-sm text-muted-foreground">{productDetails.checkOutDate}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium">Loại phòng</div>
                            <div className="text-sm text-muted-foreground">{productDetails.roomType}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Số phòng</div>
                            <div className="text-sm text-muted-foreground">{productDetails.numberOfRooms}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Số khách</div>
                            <div className="text-sm text-muted-foreground">{productDetails.numberOfGuests} người</div>
                          </div>
                        </div>

                        {productDetails.amenities && productDetails.amenities.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Tiện nghi</div>
                            <div className="flex flex-wrap gap-1">
                              {productDetails.amenities.map((amenity: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {productDetails.guests && productDetails.guests.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Thông tin khách</div>
                            <div className="space-y-2">
                              {productDetails.guests.map((guest: any, index: number) => (
                                <div key={index} className="border rounded p-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-sm">
                                        {guest.firstName} {guest.lastName}
                                        {guest.guestType === "PRIMARY" && (
                                          <Badge variant="outline" className="ml-2 text-xs">Chính</Badge>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {guest.email} • {guest.phoneNumber}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        Sinh: {guest.dateOfBirth} • Quốc tịch: {guest.nationality}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // For other booking types, show raw JSON for now
                  return (
                    <div>
                      <div className="text-sm font-medium">Chi tiết sản phẩm</div>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-gray-50 p-2 rounded">
                        {JSON.stringify(productDetails, null, 2)}
                      </pre>
                    </div>
                  );
                } catch (error) {
                  return (
                    <div>
                      <div className="text-sm font-medium">Dữ liệu không hợp lệ</div>
                      <div className="text-sm text-muted-foreground">Không thể parse productDetailsJson</div>
                    </div>
                  );
                }
              })()}
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Thông tin đặt chỗ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Ngày tạo</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(booking.createdAt * 1000).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Cập nhật lần cuối</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(booking.updatedAt * 1000).toLocaleString("vi-VN")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium">Người tạo</div>
                  <div className="text-sm text-muted-foreground">{booking.createdBy}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Người cập nhật</div>
                  <div className="text-sm text-muted-foreground">{booking.updatedBy}</div>
                </div>
              </div>

              {booking.sagaId && (
                <div>
                  <div className="text-sm font-medium">Saga ID</div>
                  <div className="text-sm text-muted-foreground font-mono">{booking.sagaId}</div>
                </div>
              )}

              {booking.cancelledAt && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Ngày hủy</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(booking.cancelledAt * 1000).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  {booking.cancellationReason && (
                    <div>
                      <div className="text-sm font-medium">Lý do hủy</div>
                      <div className="text-sm text-muted-foreground">{booking.cancellationReason}</div>
                    </div>
                  )}
                </div>
              )}

              {booking.compensationReason && (
                <div>
                  <div className="text-sm font-medium">Lý do bồi thường</div>
                  <div className="text-sm text-muted-foreground">{booking.compensationReason}</div>
                </div>
              )}

              {booking.notes && (
                <div>
                  <div className="text-sm font-medium">Ghi chú</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {booking.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}