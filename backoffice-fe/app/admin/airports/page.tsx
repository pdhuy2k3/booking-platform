"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AirportService } from "@/services/airport-service"
import { AirportStats } from "@/components/admin/airport/airport-stats"
import { AirportTable } from "@/components/admin/airport/airport-table"
import { AirportFormDialog } from "@/components/admin/airport/airport-form-dialog"
import type { Airport, PaginatedResponse } from "@/types/api"
import { toast } from "@/components/ui/use-toast"

interface AirportFormData {
  name: string
  code: string
  city: string
  country: string
  timezone?: string
}

const initialFormData: AirportFormData = {
  name: "",
  code: "",
  city: "",
  country: "",
  timezone: ""
}

export default function AdminAirports() {
  // State management
  const [airports, setAirports] = useState<PaginatedResponse<Airport> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<AirportFormData>(initialFormData)
  const [formImages, setFormImages] = useState<string[]>([])
  const [editingAirportImages, setEditingAirportImages] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState<Partial<AirportFormData>>({})
  const [editingAirport, setEditingAirport] = useState<Airport | null>(null)
  const [deletingAirport, setDeletingAirport] = useState<Airport | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAirports()
  }, [searchTerm, cityFilter, countryFilter, currentPage])

  const loadAirports = async () => {
    try {
      setLoading(true)
      const data = await AirportService.getAirports({
        search: searchTerm || undefined,
        city: cityFilter || undefined,
        country: countryFilter || undefined,
        page: currentPage,
        size: 20,
      })
      setAirports(data)
    } catch (error) {
      console.error("Failed to load airports:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sân bay",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (data: AirportFormData): boolean => {
    const errors: Partial<AirportFormData> = {}
    
    if (!data.name.trim()) {
      errors.name = "Tên sân bay là bắt buộc"
    }
    
    if (!data.code.trim()) {
      errors.code = "Mã IATA là bắt buộc"
    } else if (data.code.length !== 3) {
      errors.code = "Mã IATA phải có đúng 3 ký tự"
    }
    
    if (!data.city.trim()) {
      errors.city = "Thành phố là bắt buộc"
    }
    
    if (!data.country.trim()) {
      errors.country = "Quốc gia là bắt buộc"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAirport = async () => {
    if (!validateForm(formData)) return
    
    try {
      setSubmitting(true)
      
      const airportData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        timezone: formData.timezone?.trim() || undefined,
        images: formImages
      }
      
      await AirportService.createAirport(airportData)
      
      toast({
        title: "Thành công",
        description: "Tạo sân bay thành công",
      })
      
      setIsAddDialogOpen(false)
      resetAddForm()
      loadAirports()
    } catch (error: any) {
      console.error("Failed to create airport:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo sân bay",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAirport = async () => {
    if (!editingAirport || !validateForm(formData)) return
    
    try {
      setSubmitting(true)
      
      const airportData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        timezone: formData.timezone?.trim() || undefined,
        images: editingAirportImages
      }
      
      await AirportService.updateAirport(editingAirport.id, airportData)
      
      toast({
        title: "Thành công",
        description: "Cập nhật sân bay thành công",
      })
      
      setIsEditDialogOpen(false)
      setEditingAirport(null)
      resetAddForm()
      loadAirports()
    } catch (error: any) {
      console.error("Failed to update airport:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật sân bay",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAirport = async () => {
    if (!deletingAirport) return
    
    try {
      setSubmitting(true)
      await AirportService.deleteAirport(deletingAirport.id)
      
      toast({
        title: "Thành công",
        description: "Xóa sân bay thành công",
      })
      
      setIsDeleteDialogOpen(false)
      setDeletingAirport(null)
      loadAirports()
    } catch (error: any) {
      console.error("Failed to delete airport:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa sân bay",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (airport: Airport) => {
    setEditingAirport(airport)
    setFormData({
      name: airport.name,
      code: airport.code,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone || "",
    })
    setEditingAirportImages(airport.images || [])
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (airport: Airport) => {
    setDeletingAirport(airport)
    setIsDeleteDialogOpen(true)
  }

  const resetAddForm = () => {
    setFormData(initialFormData)
    setFormImages([])
    setEditingAirportImages([])
    setFormErrors({})
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCityFilter("")
    setCountryFilter("")
    setCurrentPage(0)
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Sân bay</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả sân bay trong hệ thống</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto"
          onClick={() => {
            resetAddForm()
            setIsAddDialogOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm sân bay
        </Button>
      </div>

      <AirportStats airports={airports} />

      <AirportTable
        airports={airports}
        loading={loading}
        searchTerm={searchTerm}
        cityFilter={cityFilter}
        countryFilter={countryFilter}
        onSearchChange={setSearchTerm}
        onCityFilterChange={setCityFilter}
        onCountryFilterChange={setCountryFilter}
        onEditAirport={openEditDialog}
        onDeleteAirport={openDeleteDialog}
        onClearFilters={clearFilters}
      />

      {/* Add Airport Dialog */}
      <AirportFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Thêm sân bay mới"
        description="Nhập thông tin sân bay mới vào hệ thống"
        formData={formData}
        onFormDataChange={setFormData}
        images={formImages}
        onImagesChange={setFormImages}
        formErrors={formErrors}
        submitting={submitting}
        onSubmit={handleAddAirport}
        submitLabel="Tạo sân bay"
      />

      {/* Edit Airport Dialog */}
      <AirportFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa sân bay"
        description="Cập nhật thông tin sân bay"
        formData={formData}
        onFormDataChange={setFormData}
        images={editingAirportImages}
        onImagesChange={setEditingAirportImages}
        formErrors={formErrors}
        submitting={submitting}
        onSubmit={handleEditAirport}
        submitLabel="Cập nhật"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa sân bay "{deletingAirport?.name}" không? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAirport} 
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
