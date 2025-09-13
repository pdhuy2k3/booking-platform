"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { HotelService } from "@/services/hotel-service"
import { RoomService } from "@/services/room-service"
import { AmenityService } from "@/services/amenity-service"
import { RoomTypeService } from "@/services/room-type-service"
import { HotelAmenityManager } from "@/components/admin/hotel/hotel-amenity-manager"
import { HotelStatistics } from "@/components/admin/hotel/hotel-statistics"
import { RoomTypeManager } from "@/components/admin/hotel/room-type-manager"
import { MediaSelector } from "@/components/ui/media-selector";
import { HotelHeader } from "@/components/admin/hotel/hotel-header"
import { HotelOverview } from "@/components/admin/hotel/hotel-overview"
import { RoomManagement } from "@/components/admin/hotel/room-management"
import { RoomFormDialog } from "@/components/admin/hotel/room-form-dialog"
import type { Hotel, Room, Amenity, RoomType, MediaResponse } from "@/types/api"
import { formatMediaForDisplay } from "@/lib/media-utils"
import { toast } from "sonner"

interface RoomFormData {
  roomNumber: string
  description: string
  price: number
  maxOccupancy: number
  bedType: string
  roomSize: number
  isAvailable: boolean
  roomTypeId: number | null
  amenityIds: number[]
  inheritPriceFromRoomType?: boolean
  inheritMediaFromRoomType?: boolean
}

const initialRoomForm: RoomFormData = {
  roomNumber: "",
  description: "",
  price: 0,
  maxOccupancy: 2,
  bedType: "",
  roomSize: 0,
  isAvailable: true,
  roomTypeId: null,
  amenityIds: [],
  inheritPriceFromRoomType: false,
  inheritMediaFromRoomType: false,
}

export default function HotelDetails() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id

  // Ensure id is properly converted to number and handle edge cases
  const hotelId = React.useMemo(() => {
    if (!id || Array.isArray(id)) return null
    const numId = Number(id)
    return isNaN(numId) ? null : numId
  }, [id])

  // State management
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [hotelImages, setHotelImages] = useState<MediaResponse[]>([])

  // Dialog states
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false)
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  // Form data
  const [newRoom, setNewRoom] = useState<RoomFormData>(initialRoomForm)
  const [newRoomMedia, setNewRoomMedia] = useState<MediaResponse[]>([])
  const [editingRoomMedia, setEditingRoomMedia] = useState<MediaResponse[]>([])

  useEffect(() => {
    if (hotelId) {
      loadHotelDetails()
    }
  }, [hotelId]) // Use hotelId instead of id

  const loadHotelDetails = async () => {
    if (!hotelId) return

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
      setRooms(roomsData?.content || [])
      
      // Load available amenities
      const amenitiesData = await AmenityService.getActiveAmenities()
      setAmenities(amenitiesData || [])
      
      // Load room types for this hotel
      const roomTypesData = await RoomTypeService.getRoomTypesByHotel(hotelId)
      setRoomTypes(roomTypesData || [])
      
      // Set hotel images if available
      if (hotelData.media) {
        setHotelImages(hotelData.media)
      }
      
    } catch (error) {
      console.error("Failed to load hotel details:", error)
      toast.error("Không thể tải thông tin khách sạn")
    } finally {
      setLoading(false)
    }
  }

  // Room management handlers
  const handleCreateRoom = async () => {
    if (!hotelId) return

    if (!newRoom.roomNumber.trim()) {
      toast.error("Vui lòng nhập số phòng")
      return
    }
    if (!newRoom.roomTypeId) {
      toast.error("Vui lòng chọn loại phòng")
      return
    }
    if (!newRoom.price || newRoom.price <= 0) {
      toast.error("Vui lòng nhập giá phòng hợp lệ")
      return
    }
    
    try {
      const roomData = {
        ...newRoom,
        media: newRoomMedia
      }
      
      await RoomService.createRoom(hotelId, roomData)
      toast.success("Phòng đã được tạo thành công")
      setIsAddRoomDialogOpen(false)
      setNewRoom(initialRoomForm)
      setNewRoomMedia([])
      loadHotelDetails()
    } catch (error) {
      console.error("Failed to create room:", error)
      toast.error("Không thể tạo phòng")
    }
  }

  const handleEditRoom = async (room: Room) => {
    // Determine if room is inheriting price from room type
    const roomType = roomTypes.find(rt => rt.id === (room.roomTypeId || room.roomType?.id))
    const isInheritingPrice = roomType?.basePrice ? room.price === roomType.basePrice : false
    
    setSelectedRoom({
      ...room,
      amenityIds: Array.isArray(room.amenities) ? room.amenities.map(a => a.id) : []
    })
    
    // Set media for editing
    if (room.media) {
      setEditingRoomMedia(room.media)
    } else {
      setEditingRoomMedia([])
    }

    setIsEditRoomDialogOpen(true)
  }

  const handleUpdateRoom = async () => {
    if (!selectedRoom) return
    
    if (!selectedRoom.roomNumber.trim()) {
      toast.error("Vui lòng nhập số phòng")
      return
    }
    if (!selectedRoom.roomTypeId && !selectedRoom.roomType?.id) {
      toast.error("Vui lòng chọn loại phòng")
      return
    }
    if (!selectedRoom.price || selectedRoom.price <= 0) {
      toast.error("Vui lòng nhập giá phòng hợp lệ")
      return
    }
    
    try {
      const updateData = {
        ...selectedRoom,
        roomTypeId: selectedRoom.roomTypeId || selectedRoom.roomType?.id,
        media: editingRoomMedia  // Use editingRoomMedia directly
      }
      await RoomService.updateRoom(selectedRoom.id, updateData)
      toast.success("Phòng đã được cập nhật thành công")
      setIsEditRoomDialogOpen(false)
      setSelectedRoom(null)
      setEditingRoomMedia([])
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
      await loadHotelDetails()
    } catch (error) {
      console.error("Failed to toggle room availability:", error)
      toast.error("Không thể thay đổi trạng thái phòng")
    }
  }

  // Hotel management handlers
  const handleUpdateHotelAmenities = async (amenityIds: number[]) => {
    if (!hotelId) return

    try {
      await HotelService.updateHotelAmenities(hotelId, amenityIds)
      await loadHotelDetails()
    } catch (error) {
      console.error("Failed to update hotel amenities:", error)
      throw error
    }
  }

  const handleUpdateHotelImages = async (media: MediaResponse[]) => {
    if (!hotelId) return

    try {
      await HotelService.updateHotel(hotelId, {  media })
      setHotelImages(media)
      toast.success("Hình ảnh khách sạn đã được cập nhật")
      await loadHotelDetails()
    } catch (error) {
      console.error("Failed to update hotel images:", error)
      toast.error("Không thể cập nhật hình ảnh khách sạn")
      throw error
    }
  }

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  // Loading state
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

  // Hotel not found state
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
      <HotelHeader
        hotel={hotel}
        onBack={() => router.push("/admin/hotels")}
        onAddRoom={() => setIsAddRoomDialogOpen(true)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full md:w-auto">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="rooms">Quản lý phòng</TabsTrigger>
          <TabsTrigger value="room-types">Loại phòng</TabsTrigger>
          <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
          <TabsTrigger value="media">Hình ảnh</TabsTrigger>
          <TabsTrigger value="statistics">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <HotelOverview hotel={hotel} formatPrice={formatPrice} />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomManagement
            rooms={rooms}
            formatPrice={formatPrice}
            onEditRoom={handleEditRoom}
            onDeleteRoom={handleDeleteRoom}
            onToggleAvailability={handleToggleRoomAvailability}
          />
        </TabsContent>

        <TabsContent value="room-types">
          {hotelId && (
            <RoomTypeManager
              hotelId={hotelId}
              onRoomTypesChange={loadHotelDetails}
            />
          )}
        </TabsContent>

        <TabsContent value="amenities">
          {hotelId && (
            <HotelAmenityManager
              hotelId={hotelId}
              hotelAmenities={hotel.amenities || []}
              allAmenities={amenities}
              onUpdate={handleUpdateHotelAmenities}
            />
          )}
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quản lý hình ảnh khách sạn</CardTitle>
              <CardDescription>Chọn hình ảnh hiển thị cho khách sạn</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaSelector
                folder="hotels"
                value={hotelImages}
                onMediaChange={handleUpdateHotelImages}
                maxSelection={10}
                allowUpload={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <HotelStatistics hotel={hotel} rooms={rooms} />
        </TabsContent>
      </Tabs>

      {/* Add Room Dialog */}
      <RoomFormDialog
        isOpen={isAddRoomDialogOpen}
        onClose={() => setIsAddRoomDialogOpen(false)}
        title="Thêm phòng mới"
        description="Nhập thông tin phòng mới"
        room={newRoom}
        onRoomChange={setNewRoom}
        roomTypes={roomTypes}
        amenities={amenities}
        media={newRoomMedia}
        onMediaChange={setNewRoomMedia}
        onSubmit={handleCreateRoom}
        submitLabel="Thêm phòng"
        formatPrice={formatPrice}
      />

      {/* Edit Room Dialog */}
      {selectedRoom && (
        <RoomFormDialog
          isOpen={isEditRoomDialogOpen}
          onClose={() => setIsEditRoomDialogOpen(false)}
          title="Chỉnh sửa phòng"
          description="Cập nhật thông tin phòng"
          room={(() => {
            // Determine inheritance status
            const roomType = roomTypes.find(rt => rt.id === (selectedRoom.roomTypeId || selectedRoom.roomType?.id))
            const isInheritingPrice = roomType?.basePrice ? selectedRoom.price === roomType.basePrice : false
            
            // For media inheritance, we'll check if room has no media but room type has media
            // This is a reasonable heuristic since media inheritance is more obvious
            const isInheritingMedia = (!selectedRoom.media || selectedRoom.media.length === 0) && 
                                    roomType?.media && roomType.media.length > 0
            
            return {
              roomNumber: selectedRoom.roomNumber,
              description: selectedRoom.description,
              price: selectedRoom.price,
              maxOccupancy: selectedRoom.maxOccupancy,
              bedType: selectedRoom.bedType,
              roomSize: selectedRoom.roomSize,
              isAvailable: selectedRoom.isAvailable,
              roomTypeId: selectedRoom.roomTypeId || selectedRoom.roomType?.id || null,
              amenityIds: selectedRoom.amenityIds || [],
              inheritPriceFromRoomType: isInheritingPrice,
              inheritMediaFromRoomType: isInheritingMedia,
              media: editingRoomMedia
            }
          })()}
          onRoomChange={(updatedRoom) => {
            // Update selectedRoom with the new data
            setSelectedRoom({
              ...selectedRoom,
              ...updatedRoom
            })
            // Also update editingRoomMedia if media was changed
            if (updatedRoom.media) {
              setEditingRoomMedia(updatedRoom.media)
            }
          }}
          roomTypes={roomTypes}
          amenities={amenities}
          media={editingRoomMedia}
          onMediaChange={setEditingRoomMedia}
          onSubmit={handleUpdateRoom}
          submitLabel="Cập nhật"
          formatPrice={formatPrice}
        />
      )}
    </AdminLayout>
  )
}
