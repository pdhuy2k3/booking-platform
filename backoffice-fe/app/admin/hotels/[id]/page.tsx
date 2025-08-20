"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, MapPin, Star, Bed, ArrowLeft, Settings, Hotel as HotelIcon, BarChart, Check, X } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { HotelService } from "@/services/hotel-service"
import { RoomService } from "@/services/room-service"
import { AmenityService } from "@/services/amenity-service"
import { HotelAmenityManager } from "@/components/admin/hotel/hotel-amenity-manager"
import { HotelStatistics } from "@/components/admin/hotel/hotel-statistics"
import type { Hotel, Room, Amenity, PaginatedResponse } from "@/types/api"
import { toast } from "sonner"

export default function HotelDetails() {
  const router = useRouter()
  const { id } = useParams()
  const hotelId = Number(id)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false)
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [hotelAmenities, setHotelAmenities] = useState<number[]>([])
  const [newRoom, setNewRoom] = useState({
    roomNumber: "",
    description: "",
    price: 0,
    maxOccupancy: 2,
    bedType: "",
    roomSize: 0,
    isAvailable: true,
    roomTypeId: null as number | null,
    amenityIds: [] as number[],
  })

  useEffect(() => {
    if (id) {
      loadHotelDetails()
    }
  }, [id])

  const loadHotelDetails = async () => {
    try {
      setLoading(true)
      
      // Load hotel details
      const hotelData = await HotelService.getHotel(hotelId)
      setHotel(hotelData)
      
      // Load rooms for this hotel
      const roomsData = await RoomService.getRoomsByHotel(hotelId, {
        page: 0,
        size: 100
      })
      setRooms(roomsData.content)
      
      // Load available amenities
      const amenitiesData = await AmenityService.getActiveAmenities()
      setAmenities(amenitiesData)
      
      // Set hotel amenities if available
      if (hotelData.amenities) {
        setHotelAmenities(hotelData.amenities.map(a => a.id))
      }
      
    } catch (error) {
      console.error("Failed to load hotel details:", error)
      toast.error("Không thể tải thông tin khách sạn")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    try {
      const roomData = {
        roomNumber: newRoom.roomNumber,
        description: newRoom.description,
        price: newRoom.price,
        maxOccupancy: newRoom.maxOccupancy,
        bedType: newRoom.bedType,
        roomSize: newRoom.roomSize,
        isAvailable: newRoom.isAvailable,
        roomTypeId: newRoom.roomTypeId,
        amenityIds: newRoom.amenityIds,
      }
      
      await RoomService.createRoom(hotelId, roomData)
      toast.success("Phòng đã được tạo thành công")
      setIsAddRoomDialogOpen(false)
      setNewRoom({
        roomNumber: "",
        description: "",
        price: 0,
        maxOccupancy: 2,
        bedType: "",
        roomSize: 0,
        isAvailable: true,
        roomTypeId: null,
        amenityIds: [],
      })
      // Refresh the rooms list
      loadHotelDetails()
    } catch (error) {
      console.error("Failed to create room:", error)
      toast.error("Không thể tạo phòng")
    }
  }

  const handleEditRoom = (room: Room) => {
    setSelectedRoom({
      ...room,
      amenityIds: room.amenities?.map(a => a.id) || []
    })
    setIsEditRoomDialogOpen(true)
  }

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return
    
    try {
      await RoomService.updateRoom(selectedRoom.id, selectedRoom)
      toast.success("Phòng đã được cập nhật thành công")
      setIsEditRoomDialogOpen(false)
      setSelectedRoom(null)
      loadHotelDetails()
    } catch (error) {
      console.error("Failed to update room:", error)
      toast.error("Không thể cập nhật phòng")
    }
  }

  const handleDeleteRoom = async (roomId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng này?")) return
    
    try {
      await RoomService.deleteRoom(roomId)
      toast.success("Phòng đã được xóa thành công")
      loadHotelDetails()
    } catch (error) {
      console.error("Failed to delete room:", error)
      toast.error("Không thể xóa phòng")
    }
  }

  const handleToggleRoomAvailability = async (roomId: number, isAvailable: boolean) => {
    try {
      await RoomService.toggleRoomAvailability(roomId, !isAvailable)
      toast.success(`Phòng đã được ${!isAvailable ? 'kích hoạt' : 'vô hiệu hóa'}`)
      loadHotelDetails()
    } catch (error) {
      console.error("Failed to toggle room availability:", error)
      toast.error("Không thể thay đổi trạng thái phòng")
    }
  }

  const handleUpdateHotelAmenities = async (amenityIds: number[]) => {
    try {
      await HotelService.updateHotelAmenities(hotelId, amenityIds)
      // Reload hotel details to refresh amenity list
      await loadHotelDetails()
    } catch (error) {
      console.error("Failed to update hotel amenities:", error)
      throw error
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge className="bg-green-100 text-green-800">Có sẵn</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Không sẵn</Badge>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Đang tải...</span>
        </div>
      </AdminLayout>
    )
  }

  if (!hotel) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Không tìm thấy khách sạn</h2>
            <Button onClick={() => router.push("/admin/hotels")} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <Button variant="outline" onClick={() => router.push("/admin/hotels")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{hotel.name}</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý thông tin và phòng của khách sạn</p>
        </div>
        <Dialog open={isAddRoomDialogOpen} onOpenChange={setIsAddRoomDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Thêm phòng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm phòng mới</DialogTitle>
              <DialogDescription>Nhập thông tin phòng mới</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="roomNumber">Số phòng</Label>
                <Input 
                  id="roomNumber" 
                  placeholder="101" 
                  value={newRoom.roomNumber}
                  onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea 
                  id="description" 
                  placeholder="Mô tả phòng..." 
                  value={newRoom.description}
                  onChange={(e) => setNewRoom({...newRoom, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá (VND)</Label>
                <Input 
                  id="price" 
                  type="number"
                  placeholder="1500000" 
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({...newRoom, price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOccupancy">Số người tối đa</Label>
                <Input 
                  id="maxOccupancy" 
                  type="number"
                  placeholder="2" 
                  value={newRoom.maxOccupancy}
                  onChange={(e) => setNewRoom({...newRoom, maxOccupancy: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedType">Loại giường</Label>
                <Input 
                  id="bedType" 
                  placeholder="Giường đôi" 
                  value={newRoom.bedType}
                  onChange={(e) => setNewRoom({...newRoom, bedType: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomSize">Diện tích (m²)</Label>
                <Input 
                  id="roomSize" 
                  type="number"
                  placeholder="25" 
                  value={newRoom.roomSize}
                  onChange={(e) => setNewRoom({...newRoom, roomSize: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isAvailable">Trạng thái</Label>
                <Select 
                  value={newRoom.isAvailable ? "available" : "unavailable"} 
                  onValueChange={(value) => setNewRoom({...newRoom, isAvailable: value === "available"})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Có sẵn</SelectItem>
                    <SelectItem value="unavailable">Không sẵn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Tiện nghi phòng</Label>
                <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`amenity-${amenity.id}`}
                          checked={newRoom.amenityIds.includes(amenity.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewRoom({...newRoom, amenityIds: [...newRoom.amenityIds, amenity.id]})
                            } else {
                              setNewRoom({...newRoom, amenityIds: newRoom.amenityIds.filter(id => id !== amenity.id)})
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`amenity-${amenity.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddRoomDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCreateRoom}>Thêm phòng</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="rooms">Quản lý phòng</TabsTrigger>
          <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
          <TabsTrigger value="statistics">Thống kê</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Hotel Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin khách sạn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Địa chỉ</h3>
              <p className="text-gray-600">{hotel.address}</p>
              <p className="text-gray-600">{hotel.city}, {hotel.country}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Đánh giá</h3>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < (hotel.starRating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                  />
                ))}
                <span className="ml-2 text-gray-600">({hotel.starRating || 0})</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Mô tả</h3>
              <p className="text-gray-600">{hotel.description || "Chưa có mô tả"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Thông số khách sạn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{hotel.availableRooms || 0}</div>
                <div className="text-sm text-gray-600">Phòng có sẵn</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {hotel.minPrice ? formatPrice(hotel.minPrice) : "Liên hệ"}
                </div>
                <div className="text-sm text-gray-600">Giá từ</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Đặt phòng hôm nay</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">4.5</div>
                <div className="text-sm text-gray-600">Đánh giá trung bình</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-6">
          <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách phòng</CardTitle>
              <CardDescription className="text-sm">Quản lý các phòng trong khách sạn</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm phòng..."
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="unavailable">Không sẵn</SelectItem>
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
                  <TableHead>Số phòng</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Số người</TableHead>
                  <TableHead>Diện tích</TableHead>
                  <TableHead>Loại giường</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không có phòng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>
                        <div className="text-sm">{room.description}</div>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(room.price)}</TableCell>
                      <TableCell>{room.maxOccupancy} người</TableCell>
                      <TableCell>{room.roomSize} m²</TableCell>
                      <TableCell>{room.bedType}</TableCell>
                      <TableCell>{getStatusBadge(room.isAvailable)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleRoomAvailability(room.id, room.isAvailable)}>
                              {room.isAvailable ? (
                                <><X className="mr-2 h-4 w-4" />Vô hiệu hóa</>
                              ) : (
                                <><Check className="mr-2 h-4 w-4" />Kích hoạt</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteRoom(room.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa phòng
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
        </TabsContent>

        {/* Amenities Tab */}
        <TabsContent value="amenities" className="space-y-6">
          <HotelAmenityManager
            hotelId={hotelId}
            hotelAmenities={hotel.amenities || []}
            allAmenities={amenities}
            onUpdate={handleUpdateHotelAmenities}
          />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <HotelStatistics hotel={hotel} rooms={rooms} />
        </TabsContent>
      </Tabs>

      {/* Edit Room Dialog */}
      <Dialog open={isEditRoomDialogOpen} onOpenChange={setIsEditRoomDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng</DialogTitle>
            <DialogDescription>Cập nhật thông tin phòng</DialogDescription>
          </DialogHeader>
          {selectedRoom && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-roomNumber">Số phòng</Label>
                <Input 
                  id="edit-roomNumber" 
                  value={selectedRoom.roomNumber}
                  onChange={(e) => setSelectedRoom({...selectedRoom, roomNumber: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea 
                  id="edit-description" 
                  value={selectedRoom.description}
                  onChange={(e) => setSelectedRoom({...selectedRoom, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Giá (VND)</Label>
                <Input 
                  id="edit-price" 
                  type="number"
                  value={selectedRoom.price}
                  onChange={(e) => setSelectedRoom({...selectedRoom, price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxOccupancy">Số người tối đa</Label>
                <Input 
                  id="edit-maxOccupancy" 
                  type="number"
                  value={selectedRoom.maxOccupancy}
                  onChange={(e) => setSelectedRoom({...selectedRoom, maxOccupancy: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bedType">Loại giường</Label>
                <Input 
                  id="edit-bedType" 
                  value={selectedRoom.bedType}
                  onChange={(e) => setSelectedRoom({...selectedRoom, bedType: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-roomSize">Diện tích (m²)</Label>
                <Input 
                  id="edit-roomSize" 
                  type="number"
                  value={selectedRoom.roomSize}
                  onChange={(e) => setSelectedRoom({...selectedRoom, roomSize: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label>Trạng thái</Label>
                <Select 
                  value={selectedRoom.isAvailable ? "available" : "unavailable"} 
                  onValueChange={(value) => setSelectedRoom({...selectedRoom, isAvailable: value === "available"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Có sẵn</SelectItem>
                    <SelectItem value="unavailable">Không sẵn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Tiện nghi phòng</Label>
                <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-amenity-${amenity.id}`}
                          checked={selectedRoom.amenityIds?.includes(amenity.id) || false}
                          onCheckedChange={(checked) => {
                            const currentIds = selectedRoom.amenityIds || []
                            if (checked) {
                              setSelectedRoom({...selectedRoom, amenityIds: [...currentIds, amenity.id]})
                            } else {
                              setSelectedRoom({...selectedRoom, amenityIds: currentIds.filter(id => id !== amenity.id)})
                            }
                          }}
                        />
                        <Label 
                          htmlFor={`edit-amenity-${amenity.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {amenity.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditRoomDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateRoom}>Cập nhật</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
