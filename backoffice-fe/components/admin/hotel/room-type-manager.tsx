"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { MediaSelector } from "@/components/ui/media-selector";
import { formatMediaForDisplay } from "@/lib/media-utils"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, DollarSign, Boxes } from "lucide-react"
import { RoomTypeService } from "@/services/room-type-service"
import type { RoomType, MediaResponse } from "@/types/api"
import { toast } from "sonner"
import { RoomAvailabilityDialog } from "./room-availability-dialog"

interface RoomTypeManagerProps {
  hotelId: number
  onRoomTypesChange?: () => void
}

export function RoomTypeManager({ hotelId, onRoomTypesChange }: RoomTypeManagerProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null)
  const [newRoomType, setNewRoomType] = useState({
    name: "",
    description: "",
    capacityAdults: 2,
    basePrice: 0,
  })
  const [newRoomTypeMedia, setNewRoomTypeMedia] = useState<MediaResponse[]>([])
  const [editingRoomTypeMedia, setEditingRoomTypeMedia] = useState<MediaResponse[]>([])
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false)
  const [availabilityRoomType, setAvailabilityRoomType] = useState<RoomType | null>(null)

  useEffect(() => {
    loadRoomTypes()
  }, [hotelId])

  const loadRoomTypes = async () => {
    try {
      setLoading(true)
      const data = await RoomTypeService.getRoomTypesByHotel(hotelId)
      setRoomTypes(data)
    } catch (error) {
      console.error("Failed to load room types:", error)
      toast.error("Không thể tải danh sách loại phòng")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoomType = async () => {
    // Validate required fields
    if (!newRoomType.name.trim()) {
      toast.error("Vui lòng nhập tên loại phòng")
      return
    }
    if (!newRoomType.basePrice || newRoomType.basePrice <= 0) {
      toast.error("Vui lòng nhập giá cơ sở hợp lệ")
      return
    }
    if (!newRoomType.capacityAdults || newRoomType.capacityAdults < 1) {
      toast.error("Vui lòng nhập số người tối đa hợp lệ")
      return
    }

    try {
      const roomTypeData = {
        ...newRoomType,
        media: newRoomTypeMedia
      }
      await RoomTypeService.createRoomType(hotelId, roomTypeData)
      toast.success("Loại phòng đã được tạo thành công")
      setIsCreateDialogOpen(false)
      setNewRoomType({
        name: "",
        description: "",
        capacityAdults: 2,
        basePrice: 0,
      })
      setNewRoomTypeMedia([])
      loadRoomTypes()
      onRoomTypesChange?.()
    } catch (error: any) {
      console.error("Failed to create room type:", error)
      toast.error(error.message || "Không thể tạo loại phòng")
    }
  }

  const handleEditRoomType = async (roomType: RoomType) => {
    setSelectedRoomType(roomType)
    
    // Set media for editing
    if (roomType.media) {
      setEditingRoomTypeMedia(roomType.media)
    }
    
    setIsEditDialogOpen(true)
  }

  const handleUpdateRoomType = async () => {
    if (!selectedRoomType) return

    // Validate required fields
    if (!selectedRoomType.name.trim()) {
      toast.error("Vui lòng nhập tên loại phòng")
      return
    }
    if (!selectedRoomType.basePrice || selectedRoomType.basePrice <= 0) {
      toast.error("Vui lòng nhập giá cơ sở hợp lệ")
      return
    }
    if (!selectedRoomType.capacityAdults || selectedRoomType.capacityAdults < 1) {
      toast.error("Vui lòng nhập số người tối đa hợp lệ")
      return
    }

    try {
      const roomTypeData = {
        ...selectedRoomType,
        media: editingRoomTypeMedia
      }
      await RoomTypeService.updateRoomType(selectedRoomType.id, roomTypeData)
      toast.success("Loại phòng đã được cập nhật thành công")
      setIsEditDialogOpen(false)
      setSelectedRoomType(null)
      setEditingRoomTypeMedia([])
      loadRoomTypes()
      onRoomTypesChange?.()
    } catch (error: any) {
      console.error("Failed to update room type:", error)
      toast.error(error.message || "Không thể cập nhật loại phòng")
    }
  }

  const handleDeleteRoomType = async (roomTypeId: number, roomTypeName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa loại phòng "${roomTypeName}"?`)) return

    try {
      await RoomTypeService.deleteRoomType(roomTypeId)
      toast.success("Loại phòng đã được xóa thành công")
      loadRoomTypes()
      onRoomTypesChange?.()
    } catch (error: any) {
      console.error("Failed to delete room type:", error)
      toast.error(error.message || "Không thể xóa loại phòng")
    }
  }

  const handleManageAvailability = (roomType: RoomType) => {
    setAvailabilityRoomType(roomType)
    setIsAvailabilityDialogOpen(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const filteredRoomTypes = roomTypes.filter(roomType =>
    roomType.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Đang tải...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Quản lý loại phòng</CardTitle>
            <CardDescription>Quản lý các loại phòng của khách sạn</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm loại phòng
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm loại phòng mới</DialogTitle>
                <DialogDescription>Nhập thông tin loại phòng mới</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên loại phòng *</Label>
                  <Input
                    id="name"
                    placeholder="VD: Deluxe Room"
                    value={newRoomType.name}
                    onChange={(e) => setNewRoomType({...newRoomType, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả loại phòng..."
                    value={newRoomType.description}
                    onChange={(e) => setNewRoomType({...newRoomType, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacityAdults">Số người tối đa *</Label>
                    <Input
                      id="capacityAdults"
                      type="number"
                      placeholder="2"
                      value={newRoomType.capacityAdults}
                      onChange={(e) => setNewRoomType({...newRoomType, capacityAdults: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Giá cơ sở (VND) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      placeholder="1500000"
                      value={newRoomType.basePrice}
                      onChange={(e) => setNewRoomType({...newRoomType, basePrice: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomtype-images">Hình ảnh loại phòng</Label>
                  <Label htmlFor="roomtype-images">Hình ảnh loại phòng</Label>
                  <MediaSelector
                    value={newRoomTypeMedia}
                    onMediaChange={setNewRoomTypeMedia}
                    maxSelection={10}
                    folder="hotels"
                    allowUpload={true}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false)
                  setNewRoomTypeMedia([])
                }}>
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreateRoomType}
                  disabled={!newRoomType.name.trim() || !newRoomType.basePrice || newRoomType.basePrice <= 0 || !newRoomType.capacityAdults || newRoomType.capacityAdults < 1}
                >
                  Thêm loại phòng
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm loại phòng..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Room Types Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên loại phòng</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Số người</TableHead>
                  <TableHead>Giá cơ sở</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoomTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Không có loại phòng nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoomTypes.map((roomType) => (
                    <TableRow key={roomType.id}>
                      <TableCell className="font-medium">{roomType.name}</TableCell>
                      <TableCell>
                        <div className="text-sm max-w-[200px] truncate">
                          {roomType.description || "Chưa có mô tả"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {roomType.capacityAdults}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center font-medium">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatPrice(roomType.basePrice || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleManageAvailability(roomType)}>
                              <Boxes className="mr-2 h-4 w-4" />
                              Quản lý tồn kho
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditRoomType(roomType)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteRoomType(roomType.id, roomType.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
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
        </div>
      </CardContent>

      {/* Edit Room Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa loại phòng</DialogTitle>
            <DialogDescription>Cập nhật thông tin loại phòng</DialogDescription>
          </DialogHeader>
          {selectedRoomType && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên loại phòng *</Label>
                <Input
                  id="edit-name"
                  value={selectedRoomType.name}
                  onChange={(e) => setSelectedRoomType({...selectedRoomType, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={selectedRoomType.description || ""}
                  onChange={(e) => setSelectedRoomType({...selectedRoomType, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-capacityAdults">Số người tối đa *</Label>
                  <Input
                    id="edit-capacityAdults"
                    type="number"
                    value={selectedRoomType.capacityAdults}
                    onChange={(e) => setSelectedRoomType({...selectedRoomType, capacityAdults: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-basePrice">Giá cơ sở (VND) *</Label>
                  <Input
                    id="edit-basePrice"
                    type="number"
                    value={selectedRoomType.basePrice}
                    onChange={(e) => setSelectedRoomType({...selectedRoomType, basePrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-roomtype-images">Hình ảnh loại phòng</Label>
                <Label htmlFor="edit-roomtype-images">Hình ảnh loại phòng</Label>
                <MediaSelector
                  value={editingRoomTypeMedia}
                  onMediaChange={setEditingRoomTypeMedia}
                  maxSelection={10}
                  folder="hotels"
                  allowUpload={true}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingRoomTypeMedia([])
            }}>
              Hủy
            </Button>
            <Button 
              onClick={handleUpdateRoomType}
              disabled={!selectedRoomType || !selectedRoomType.name.trim() || !selectedRoomType.basePrice || selectedRoomType.basePrice <= 0 || !selectedRoomType.capacityAdults || selectedRoomType.capacityAdults < 1}
            >
              Cập nhật
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RoomAvailabilityDialog
        open={isAvailabilityDialogOpen}
        onOpenChange={(open) => {
          setIsAvailabilityDialogOpen(open)
          if (!open) {
            setAvailabilityRoomType(null)
          }
        }}
        hotelId={hotelId}
        roomTypeId={availabilityRoomType?.id ?? 0}
        roomTypeName={availabilityRoomType?.name ?? ""}
        onSaved={() => {
          loadRoomTypes()
          onRoomTypesChange?.()
        }}
      />
    </Card>
  )
}
