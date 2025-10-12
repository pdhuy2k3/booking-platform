"use client"

import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { AdminPageLayout } from "@/components/admin/shared/admin-page-layout"
import { AircraftStats } from "@/components/admin/aircraft/aircraft-stats"
import { AircraftTable } from "@/components/admin/aircraft/aircraft-table"
import { AircraftFormDialog } from "@/components/admin/aircraft/aircraft-form-dialog"
import { AircraftService } from "@/services/aircraft-service"
import type { Aircraft, PaginatedResponse } from "@/types/api"

export default function AdminAircraft() {
  const [aircraft, setAircraft] = useState<PaginatedResponse<Aircraft> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Selected aircraft for actions
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAircraft()
  }, [searchTerm])

  const loadAircraft = async () => {
    try {
      setLoading(true)
      const data = await AircraftService.getAircraft({
        search: searchTerm || undefined,
        page: 0,
        size: 20,
      })
      setAircraft(data)
    } catch (error) {
      console.error("Failed to load aircraft:", error)
    } finally {
      setLoading(false)
    }
  }

  // Handle add aircraft
  const handleAddAircraft = async (data: any) => {
    try {
      setSubmitting(true)

      const newAircraft = {
        model: data.model.trim(),
        manufacturer: data.manufacturer.trim() || undefined,
        capacityEconomy: data.capacityEconomy ? parseInt(data.capacityEconomy) : undefined,
        capacityBusiness: data.capacityBusiness ? parseInt(data.capacityBusiness) : undefined,
        capacityFirst: data.capacityFirst ? parseInt(data.capacityFirst) : undefined,
        totalCapacity: data.totalCapacity ? parseInt(data.totalCapacity) : undefined,
        registrationNumber: data.registrationNumber.trim() || undefined,
        mediaPublicIds: data.mediaPublicIds,
        featuredMediaUrl: data.featuredMediaUrl
      }

      await AircraftService.createAircraft(newAircraft)
      
      toast({
        title: "Thành công",
        description: "Máy bay đã được thêm thành công.",
      })

      setIsAddDialogOpen(false)
      loadAircraft()
    } catch (error: any) {
      console.error("Error adding aircraft:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm máy bay. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit aircraft
  const handleEditAircraft = async (data: any) => {
    if (!selectedAircraft) return

    try {
      setSubmitting(true)

      const updatedAircraft = {
        model: data.model.trim(),
        manufacturer: data.manufacturer.trim() || undefined,
        capacityEconomy: data.capacityEconomy ? parseInt(data.capacityEconomy) : undefined,
        capacityBusiness: data.capacityBusiness ? parseInt(data.capacityBusiness) : undefined,
        capacityFirst: data.capacityFirst ? parseInt(data.capacityFirst) : undefined,
        totalCapacity: data.totalCapacity ? parseInt(data.totalCapacity) : undefined,
        registrationNumber: data.registrationNumber.trim() || undefined,
        mediaPublicIds: data.mediaPublicIds,
        featuredMediaUrl: data.featuredMediaUrl
      }

      await AircraftService.updateAircraft(selectedAircraft.aircraftId, updatedAircraft)
      
      toast({
        title: "Thành công",
        description: "Máy bay đã được cập nhật thành công.",
      })

      setIsEditDialogOpen(false)
      setSelectedAircraft(null)
      loadAircraft()
    } catch (error: any) {
      console.error("Error updating aircraft:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật máy bay. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete aircraft
  const handleDeleteAircraft = async () => {
    if (!selectedAircraft) return

    try {
      setSubmitting(true)
      await AircraftService.deleteAircraft(selectedAircraft.aircraftId)
      
      toast({
        title: "Thành công",
        description: "Máy bay đã được xóa thành công.",
      })

      setIsDeleteDialogOpen(false)
      setSelectedAircraft(null)
      loadAircraft()
    } catch (error: any) {
      console.error("Error deleting aircraft:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa máy bay. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle opening edit dialog
  const handleOpenEditDialog = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft)
    setIsEditDialogOpen(true)
  }

  return (
    <AdminPageLayout
      title="Quản lý Máy bay"
      description="Quản lý tất cả máy bay trong hệ thống"
      onAddClick={() => setIsAddDialogOpen(true)}
      addButtonText="Thêm máy bay"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Tìm kiếm máy bay..."
    >
      <AircraftStats data={aircraft} />
      
      <AircraftTable
        data={aircraft?.content || []}
        loading={loading}
        onEdit={handleOpenEditDialog}
        onDelete={(aircraft) => {
          setSelectedAircraft(aircraft)
          setIsDeleteDialogOpen(true)
        }}
      />

      {/* Add Dialog */}
      <AircraftFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAircraft}
        isSubmitting={submitting}
        title="Thêm máy bay mới"
        description="Nhập thông tin máy bay mới vào hệ thống"
      />

      {/* Edit Dialog */}
      <AircraftFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedAircraft(null)
        }}
        onSubmit={handleEditAircraft}
        isSubmitting={submitting}
        editingAircraft={selectedAircraft}
        title="Chỉnh sửa máy bay"
        description="Cập nhật thông tin máy bay"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa máy bay</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa máy bay <strong>{selectedAircraft?.model}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
              onClick={handleDeleteAircraft}
            >
              {submitting ? "Đang xóa..." : "Xóa máy bay"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPageLayout>
  )
}