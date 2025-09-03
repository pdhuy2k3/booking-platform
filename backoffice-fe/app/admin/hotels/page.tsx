"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { HotelService } from "@/services/hotel-service"
import { HotelStats } from "@/components/admin/hotel/hotel-stats"
import { HotelTable } from "@/components/admin/hotel/hotel-table"
import { HotelFormDialog } from "@/components/admin/hotel/hotel-form-dialog"
import { HotelViewDialog } from "@/components/admin/hotel/hotel-view-dialog"
import type { Hotel, PaginatedResponse } from "@/types/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface HotelFormData {
  name: string
  description: string
  address: string
  city: string
  country: string
  starRating: number
}

const initialHotelForm: HotelFormData = {
  name: "",
  description: "",
  address: "",
  city: "",
  country: "Việt Nam",
  starRating: 3,
}

export default function AdminHotels() {
  const router = useRouter()

  // State management
  const [hotels, setHotels] = useState<PaginatedResponse<Hotel> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState<string>("all")

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null)

  // Form data
  const [newHotel, setNewHotel] = useState<HotelFormData>(initialHotelForm)
  const [editHotelData, setEditHotelData] = useState<HotelFormData>(initialHotelForm)
  const [newHotelImages, setNewHotelImages] = useState<string[]>([])
  const [editingHotelImages, setEditingHotelImages] = useState<string[]>([])

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

  // Hotel management handlers
  const handleCreateHotel = async () => {
    try {
      const hotelData = {
        ...newHotel,
        images: newHotelImages
      }
      
      await HotelService.createHotel(hotelData)
      toast.success("Khách sạn đã được tạo thành công")
      setIsAddDialogOpen(false)
      setNewHotel(initialHotelForm)
      setNewHotelImages([])
      loadHotels()
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
    setEditingHotel(hotel)
    setEditHotelData({
      name: hotel.name,
      description: hotel.description || "",
      address: hotel.address,
      city: hotel.city,
      country: hotel.country || "Việt Nam",
      starRating: hotel.starRating || 3,
    })
    setEditingHotelImages(hotel.images || [])
    setIsEditDialogOpen(true)
  }

  const handleUpdateHotel = async () => {
    if (!editingHotel) return
    
    try {
      const hotelData = {
        ...editHotelData,
        images: editingHotelImages
      }
      
      await HotelService.updateHotel(editingHotel.id, hotelData)
      toast.success("Khách sạn đã được cập nhật thành công")
      setIsEditDialogOpen(false)
      setEditingHotel(null)
      setEditingHotelImages([])
      loadHotels()
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
      loadHotels()
    } catch (error) {
      console.error("Failed to delete hotel:", error)
      toast.error("Không thể xóa khách sạn")
    }
  }

  const navigateToHotelDetails = (hotelId: number) => {
    router.push(`/admin/hotels/${hotelId}`)
  }

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Khách sạn</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả khách sạn trong hệ thống</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm khách sạn
        </Button>
      </div>

      <HotelStats hotels={hotels} formatPrice={formatPrice} />

      <HotelTable
        hotels={hotels}
        loading={loading}
        searchTerm={searchTerm}
        cityFilter={cityFilter}
        onSearchChange={setSearchTerm}
        onCityFilterChange={setCityFilter}
        onViewHotel={handleViewHotel}
        onEditHotel={handleEditHotel}
        onDeleteHotel={handleDeleteHotel}
        onNavigateToDetails={navigateToHotelDetails}
        formatPrice={formatPrice}
      />

      {/* Add Hotel Dialog */}
      <HotelFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Thêm khách sạn mới"
        description="Nhập thông tin khách sạn mới vào hệ thống"
        hotel={newHotel}
        onHotelChange={setNewHotel}
        images={newHotelImages}
        onImagesChange={setNewHotelImages}
        onSubmit={handleCreateHotel}
        submitLabel="Thêm khách sạn"
      />

      {/* Edit Hotel Dialog */}
      <HotelFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa khách sạn"
        description="Cập nhật thông tin khách sạn"
        hotel={editHotelData}
        onHotelChange={setEditHotelData}
        images={editingHotelImages}
        onImagesChange={setEditingHotelImages}
        onSubmit={handleUpdateHotel}
        submitLabel="Cập nhật"
      />

      {/* View Hotel Dialog */}
      <HotelViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        hotel={selectedHotel}
        onNavigateToDetails={navigateToHotelDetails}
        formatPrice={formatPrice}
      />
    </AdminLayout>
  )
}
