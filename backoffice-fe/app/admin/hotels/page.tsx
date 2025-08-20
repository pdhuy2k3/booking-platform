"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, MapPin, Star, Bed, Settings } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { HotelService } from "@/services/hotel-service"
import type { Hotel, PaginatedResponse } from "@/types/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AdminHotels() {
  const router = useRouter()
  const [hotels, setHotels] = useState<PaginatedResponse<Hotel> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)
  const [newHotel, setNewHotel] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "Việt Nam",
    starRating: 3,
  })

  useEffect(() => {
    loadHotels()
  }, [searchTerm, cityFilter])

  const loadHotels = async () => {
    try {
      setLoading(true)
      const data = await HotelService.getHotels({
        search: searchTerm || undefined,
        city: cityFilter === "all" ? undefined : cityFilter,
        page: 0,
        size: 20,
      })
      setHotels(data)
    } catch (error) {
      console.error("Failed to load hotels:", error)
      toast.error("Không thể tải danh sách khách sạn")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHotel = async () => {
    try {
      await HotelService.createHotel(newHotel)
      toast.success("Khách sạn đã được tạo thành công")
      setIsAddDialogOpen(false)
      setNewHotel({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "Việt Nam",
        starRating: 3,
      })
      loadHotels() // Refresh the list
    } catch (error) {
      console.error("Failed to create hotel:", error)
      toast.error("Không thể tạo khách sạn")
    }
  }

  const handleViewHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel)
    setIsViewDialogOpen(true)
  }

  const handleEditHotel = (hotel: Hotel) => {
    setEditingHotel({
      ...hotel,
      starRating: hotel.starRating || 3,
      country: hotel.country || "Việt Nam"
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateHotel = async () => {
    if (!editingHotel) return
    
    try {
      await HotelService.updateHotel(editingHotel.id, editingHotel)
      toast.success("Khách sạn đã được cập nhật thành công")
      setIsEditDialogOpen(false)
      setEditingHotel(null)
      loadHotels() // Refresh the list
    } catch (error) {
      console.error("Failed to update hotel:", error)
      toast.error("Không thể cập nhật khách sạn")
    }
  }

  const handleDeleteHotel = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa khách sạn này?")) return
    
    try {
      await HotelService.deleteHotel(id)
      toast.success("Khách sạn đã được xóa thành công")
      loadHotels() // Refresh the list
    } catch (error) {
      console.error("Failed to delete hotel:", error)
      toast.error("Không thể xóa khách sạn")
    }
  }

  const navigateToHotelDetails = (hotelId: number) => {
    router.push(`/admin/hotels/${hotelId}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const totalHotels = hotels?.totalElements || 0
  const activeHotels = hotels?.content.filter((h) => h.status !== "INACTIVE").length || 0
  const totalRooms = hotels?.content.reduce((sum, hotel) => sum + (hotel.availableRooms || 0), 0) || 0
  const avgRating = hotels?.content.length
    ? (hotels.content.reduce((sum, hotel) => sum + (hotel.starRating || 0), 0) / hotels.content.length).toFixed(1)
    : "0.0"

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Khách sạn</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả khách sạn trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Thêm khách sạn
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm khách sạn mới</DialogTitle>
              <DialogDescription>Nhập thông tin khách sạn mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="hotelName">Tên khách sạn</Label>
                <Input 
                  id="hotelName" 
                  placeholder="Lotte Hotel Hanoi" 
                  value={newHotel.name}
                  onChange={(e) => setNewHotel({...newHotel, name: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea 
                  id="description" 
                  placeholder="Khách sạn 5 sao sang trọng..." 
                  value={newHotel.description}
                  onChange={(e) => setNewHotel({...newHotel, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Thành phố</Label>
                <Input 
                  id="city" 
                  placeholder="Hà Nội" 
                  value={newHotel.city}
                  onChange={(e) => setNewHotel({...newHotel, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Quốc gia</Label>
                <Input 
                  id="country" 
                  placeholder="Việt Nam" 
                  value={newHotel.country}
                  onChange={(e) => setNewHotel({...newHotel, country: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Input 
                  id="address" 
                  placeholder="54 Liễu Giai, Ba Đình" 
                  value={newHotel.address}
                  onChange={(e) => setNewHotel({...newHotel, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Đánh giá</Label>
                <Select 
                  value={newHotel.starRating.toString()} 
                  onValueChange={(value) => setNewHotel({...newHotel, starRating: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số sao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 sao</SelectItem>
                    <SelectItem value="2">2 sao</SelectItem>
                    <SelectItem value="3">3 sao</SelectItem>
                    <SelectItem value="4">4 sao</SelectItem>
                    <SelectItem value="5">5 sao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateHotel}>Thêm khách sạn</Button>
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
            <p className="text-xs text-muted-foreground">
              {totalHotels ? Math.round((activeHotels / totalHotels) * 100) : 0}% tổng số
            </p>
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
            <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground">Trung bình</p>
          </CardContent>
        </Card>
      </div>

      {/* Hotels Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách khách sạn</CardTitle>
              <CardDescription className="text-sm">Quản lý tất cả khách sạn trong hệ thống</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm khách sạn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                  <SelectItem value="TP.HCM">TP.HCM</SelectItem>
                  <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                  <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                  <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                  <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead>Số phòng</TableHead>
                  <TableHead>Giá từ</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : hotels?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  hotels?.content.map((hotel) => (
                    <TableRow key={hotel.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-10" />
                          <div>
                            <div className="font-medium">{hotel.name}</div>
                            <div className="text-sm text-gray-500">ID: {hotel.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{hotel.address}</div>
                          <div className="text-sm text-gray-500">
                            {hotel.city}, {hotel.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(hotel.starRating || 0)}
                          <span className="text-sm text-gray-600 ml-1">({hotel.starRating || 0})</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{hotel.availableRooms || 0}</TableCell>
                      <TableCell className="font-medium">
                        {hotel.minPrice ? formatPrice(hotel.minPrice) : "Liên hệ"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewHotel(hotel)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditHotel(hotel)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigateToHotelDetails(hotel.id)}>
                              <Settings className="mr-2 h-4 w-4" />
                              Quản lý phòng
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteHotel(hotel.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa khách sạn
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

      {/* View Hotel Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết khách sạn</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về khách sạn
            </DialogDescription>
          </DialogHeader>
          {selectedHotel && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Tên khách sạn</Label>
                  <p className="font-medium">{selectedHotel.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Đánh giá</Label>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedHotel.starRating || 0)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Thành phố</Label>
                  <p className="font-medium">{selectedHotel.city}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Quốc gia</Label>
                  <p className="font-medium">{selectedHotel.country}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm text-gray-500">Địa chỉ</Label>
                  <p className="font-medium">{selectedHotel.address}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm text-gray-500">Mô tả</Label>
                  <p className="font-medium">{selectedHotel.description || "Chưa có mô tả"}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Số phòng có sẵn</Label>
                  <p className="font-medium">{selectedHotel.availableRooms || 0} phòng</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Giá thấp nhất</Label>
                  <p className="font-medium">
                    {selectedHotel.minPrice ? formatPrice(selectedHotel.minPrice) : "Chưa có"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              navigateToHotelDetails(selectedHotel!.id)
            }}>
              <Settings className="w-4 h-4 mr-2" />
              Quản lý phòng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Hotel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách sạn</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin khách sạn
            </DialogDescription>
          </DialogHeader>
          {editingHotel && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="editHotelName">Tên khách sạn</Label>
                <Input
                  id="editHotelName"
                  value={editingHotel.name}
                  onChange={(e) => setEditingHotel({...editingHotel, name: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="editDescription">Mô tả</Label>
                <Textarea
                  id="editDescription"
                  value={editingHotel.description || ""}
                  onChange={(e) => setEditingHotel({...editingHotel, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCity">Thành phố</Label>
                <Input
                  id="editCity"
                  value={editingHotel.city}
                  onChange={(e) => setEditingHotel({...editingHotel, city: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCountry">Quốc gia</Label>
                <Input
                  id="editCountry"
                  value={editingHotel.country}
                  onChange={(e) => setEditingHotel({...editingHotel, country: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="editAddress">Địa chỉ</Label>
                <Input
                  id="editAddress"
                  value={editingHotel.address}
                  onChange={(e) => setEditingHotel({...editingHotel, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRating">Đánh giá</Label>
                <Select
                  value={editingHotel.starRating.toString()}
                  onValueChange={(value) => setEditingHotel({...editingHotel, starRating: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn số sao" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 sao</SelectItem>
                    <SelectItem value="2">2 sao</SelectItem>
                    <SelectItem value="3">3 sao</SelectItem>
                    <SelectItem value="4">4 sao</SelectItem>
                    <SelectItem value="5">5 sao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingHotel(null)
            }}>
              Hủy
            </Button>
            <Button onClick={handleUpdateHotel}>Cập nhật</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
