"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Eye, Edit, Settings, MapPin, Star, Bed, Users } from "lucide-react"
import { PartnerLayout } from "@/components/partner/partner-layout"

// Mock data for partner's hotels
const partnerHotels = [
  {
    id: "HOTEL001",
    name: "Lotte Hotel Hanoi",
    description: "Khách sạn 5 sao sang trọng tại trung tâm Hà Nội",
    address: "54 Liễu Giai, Ba Đình",
    city: "Hà Nội",
    rating: 4.8,
    totalRooms: 15,
    availableRooms: 8,
    bookingsThisMonth: 45,
    revenue: "320,000,000₫",
    status: "ACTIVE",
  },
  {
    id: "HOTEL002",
    name: "InterContinental Hanoi Westlake",
    description: "Resort sang trọng bên hồ Tây thơ mộng",
    address: "1A Nghi Tam, Tây Hồ",
    city: "Hà Nội",
    rating: 4.7,
    totalRooms: 12,
    availableRooms: 5,
    bookingsThisMonth: 38,
    revenue: "280,000,000₫",
    status: "ACTIVE",
  },
  {
    id: "HOTEL003",
    name: "Sunrise Hotel Da Nang",
    description: "Khách sạn view biển tuyệt đẹp",
    address: "123 Võ Nguyên Giáp, Ngũ Hành Sơn",
    city: "Đà Nẵng",
    rating: 4.5,
    totalRooms: 20,
    availableRooms: 12,
    bookingsThisMonth: 28,
    revenue: "180,000,000₫",
    status: "PENDING",
  },
]

export default function PartnerHotels() {
  const [hotels, setHotels] = useState(partnerHotels)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case "INACTIVE":
        return <Badge className="bg-gray-100 text-gray-800">Tạm dừng</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalHotels = hotels.length
  const activeHotels = hotels.filter((h) => h.status === "ACTIVE").length
  const totalRooms = hotels.reduce((sum, hotel) => sum + hotel.totalRooms, 0)
  const totalBookings = hotels.reduce((sum, hotel) => sum + hotel.bookingsThisMonth, 0)

  return (
    <PartnerLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Khách sạn của tôi</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý các khách sạn bạn đã đăng ký</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Đăng ký khách sạn mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Đăng ký khách sạn mới</DialogTitle>
              <DialogDescription>Nhập thông tin khách sạn để đăng ký với BookingSmart</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="hotelName">Tên khách sạn *</Label>
                <Input id="hotelName" placeholder="VD: Sunrise Hotel Da Nang" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Mô tả khách sạn *</Label>
                <Textarea id="description" placeholder="Mô tả chi tiết về khách sạn của bạn..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                    <SelectItem value="hcm">TP.HCM</SelectItem>
                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                    <SelectItem value="nhatrang">Nha Trang</SelectItem>
                    <SelectItem value="phuquoc">Phú Quốc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Hạng sao</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn hạng sao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 sao</SelectItem>
                    <SelectItem value="4">4 sao</SelectItem>
                    <SelectItem value="5">5 sao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Địa chỉ chi tiết *</Label>
                <Input id="address" placeholder="VD: 123 Võ Nguyên Giáp, Ngũ Hành Sơn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input id="phone" placeholder="VD: 0236 123 4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email liên hệ *</Label>
                <Input id="email" type="email" placeholder="VD: info@sunrisehotel.com" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Gửi đăng ký</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách sạn</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHotels}</div>
            <p className="text-xs text-muted-foreground">Đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeHotels}</div>
            <p className="text-xs text-muted-foreground">Được duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng phòng</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">Trên tất cả khách sạn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đặt chỗ tháng này</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Tổng đặt chỗ</p>
          </CardContent>
        </Card>
      </div>

      {/* Hotels Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách khách sạn</CardTitle>
              <CardDescription className="text-sm">Quản lý các khách sạn bạn đã đăng ký</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khách sạn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Khách sạn</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Đặt chỗ/tháng</TableHead>
                  <TableHead>Doanh thu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredHotels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHotels.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src="/placeholder.svg?height=40&width=60"
                            alt={hotel.name}
                            className="w-15 h-10 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium">{hotel.name}</div>
                            <div className="text-sm text-gray-500">{hotel.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{hotel.address}</div>
                          <div className="text-sm text-gray-500">{hotel.city}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(Math.floor(hotel.rating))}
                          <span className="text-sm text-gray-600 ml-1">({hotel.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {hotel.availableRooms}/{hotel.totalRooms}
                          </div>
                          <div className="text-gray-500">Trống/Tổng</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{hotel.bookingsThisMonth}</TableCell>
                      <TableCell className="font-medium">{hotel.revenue}</TableCell>
                      <TableCell>{getStatusBadge(hotel.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Cài đặt phòng
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PartnerLayout>
  )
}
