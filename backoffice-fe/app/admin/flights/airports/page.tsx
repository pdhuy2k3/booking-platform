"use client"

import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AdminPageLayout } from "@/components/admin/shared/admin-page-layout"
import { AirportStats } from "@/components/admin/airport/airport-stats"
import { AirportTable } from "@/components/admin/airport/airport-table"
import { AirportFormDialog } from "@/components/admin/airport/airport-form-dialog"
import { AirportService } from "@/services/airport-service"
import type { Airport, PaginatedResponse } from "@/types/api"
import { toast } from "@/components/ui/use-toast"

export default function AdminAirports() {
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
  
  // Selected airport for actions
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

  const handleAddAirport = async (data: any) => {
    try {
      setSubmitting(true)
      
      const airportData = {
        name: data.name.trim(),
        iataCode: data.iataCode.trim().toUpperCase(),
        city: data.city.trim(),
        country: data.country.trim(),
        timezone: data.timezone?.trim() || undefined,
        mediaPublicIds: data.mediaPublicIds
      }
      
      await AirportService.createAirport(airportData)
      
      toast({
        title: "Thành công",
        description: "Tạo sân bay thành công",
      })
      
      setIsAddDialogOpen(false)
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

  const handleEditAirport = async (data: any) => {
    if (!editingAirport) return
    
    try {
      setSubmitting(true)
      
      const airportData = {
        name: data.name.trim(),
        iataCode: data.iataCode.trim().toUpperCase(),
        city: data.city.trim(),
        country: data.country.trim(),
        timezone: data.timezone?.trim() || undefined,
        mediaPublicIds: data.mediaPublicIds
      }
      
      await AirportService.updateAirport(editingAirport.airportId, airportData)
      
      toast({
        title: "Thành công",
        description: "Cập nhật sân bay thành công",
      })
      
      setIsEditDialogOpen(false)
      setEditingAirport(null)
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
      await AirportService.deleteAirport(deletingAirport.airportId)
      
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
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (airport: Airport) => {
    setDeletingAirport(airport)
    setIsDeleteDialogOpen(true)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCityFilter("")
    setCountryFilter("")
  }

  const filters = (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      <Input
        placeholder="Lọc theo thành phố..."
        value={cityFilter}
        onChange={(e) => setCityFilter(e.target.value)}
        className="w-full sm:w-48"
      />
      <Input
        placeholder="Lọc theo quốc gia..."
        value={countryFilter}
        onChange={(e) => setCountryFilter(e.target.value)}
        className="w-full sm:w-48"
      />
      {(searchTerm || cityFilter || countryFilter) && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          Xóa bộ lọc
        </Button>
      )}
    </div>
  )

  return (
    <AdminPageLayout
      title="Quản lý Sân bay"
      description="Quản lý tất cả sân bay trong hệ thống"
      onAddClick={() => setIsAddDialogOpen(true)}
      addButtonText="Thêm sân bay"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Tìm kiếm sân bay..."
      filters={filters}
    >
      <AirportStats data={airports} />
      
      <AirportTable
        data={airports?.content || []}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      {/* Add Dialog */}
      <AirportFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAirport}
        isSubmitting={submitting}
        title="Thêm sân bay mới"
        description="Nhập thông tin sân bay mới vào hệ thống"
      />

      {/* Edit Dialog */}
      <AirportFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingAirport(null)
        }}
        onSubmit={handleEditAirport}
        isSubmitting={submitting}
        editingAirport={editingAirport}
        title="Chỉnh sửa sân bay"
        description="Cập nhật thông tin sân bay"
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
    </AdminPageLayout>
  )
}
