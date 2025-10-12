"use client"

import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { AirlineService } from "@/services/airline-service"
import type { Airline, PaginatedResponse } from "@/types/api"
import { toast } from "sonner"
import { AdminPageLayout } from "@/components/admin/shared/admin-page-layout"
import { AirlineStats } from "@/components/admin/airline/airline-stats"
import { AirlineTable } from "@/components/admin/airline/airline-table"
import { AirlineFormDialog } from "@/components/admin/airline/airline-form-dialog"

export default function AdminAirlines() {
  const [airlines, setAirlines] = useState<PaginatedResponse<Airline> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Selected airline for actions
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null)
  const [deletingAirline, setDeletingAirline] = useState<Airline | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAirlines()
  }, [searchTerm, currentPage])

  const loadAirlines = async () => {
    try {
      setLoading(true)
      const data = await AirlineService.getAirlines({
        search: searchTerm || undefined,
        page: currentPage,
        size: 20,
      })
      setAirlines(data)
    } catch (error) {
      console.error("Failed to load airlines:", error)
      toast.error("Không thể tải danh sách hãng hàng không")
    } finally {
      setLoading(false)
    }
  }

  const handleAddAirline = async (data: any) => {
    try {
      setSubmitting(true)
      
      const airlineData = {
        name: data.name.trim(),
        iataCode: data.iataCode.trim().toUpperCase(),
        mediaPublicIds: data.mediaPublicIds,
        featuredMediaUrl: data.featuredMediaUrl
      }
      
      await AirlineService.createAirline(airlineData)
      toast.success("Tạo hãng hàng không thành công")
      
      setIsAddDialogOpen(false)
      loadAirlines()
    } catch (error: any) {
      console.error("Failed to create airline:", error)
      toast.error(error.message || "Không thể tạo hãng hàng không")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAirline = async (data: any) => {
    if (!editingAirline) return
    
    try {
      setSubmitting(true)
      
      const airlineData = {
        name: data.name.trim(),
        iataCode: data.iataCode.trim().toUpperCase(),
        mediaPublicIds: data.mediaPublicIds,
        featuredMediaUrl: data.featuredMediaUrl
      }
      
      await AirlineService.updateAirline(editingAirline.airlineId, airlineData)
      toast.success("Cập nhật hãng hàng không thành công")
      
      setIsEditDialogOpen(false)
      setEditingAirline(null)
      loadAirlines()
    } catch (error: any) {
      console.error("Failed to update airline:", error)
      toast.error(error.message || "Không thể cập nhật hãng hàng không")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAirline = async () => {
    if (!deletingAirline) return
    
    try {
      setSubmitting(true)
      await AirlineService.deleteAirline(deletingAirline.airlineId)
      toast.success("Xóa hãng hàng không thành công")
      
      setIsDeleteDialogOpen(false)
      setDeletingAirline(null)
      loadAirlines()
    } catch (error: any) {
      console.error("Failed to delete airline:", error)
      toast.error(error.message || "Không thể xóa hãng hàng không")
    } finally {
      setSubmitting(false)
    }
  }

  const openEditDialog = (airline: Airline) => {
    setEditingAirline(airline)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (airline: Airline) => {
    setDeletingAirline(airline)
    setIsDeleteDialogOpen(true)
  }

  return (
    <AdminPageLayout
      title="Quản lý Hãng hàng không"
      description="Quản lý tất cả hãng hàng không trong hệ thống"
      onAddClick={() => setIsAddDialogOpen(true)}
      addButtonText="Thêm hãng hàng không"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Tìm kiếm hãng hàng không..."
    >
      <AirlineStats data={airlines} />
      
      <AirlineTable
        data={airlines?.content || []}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      {/* Add Dialog */}
      <AirlineFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddAirline}
        isSubmitting={submitting}
        title="Thêm hãng hàng không mới"
        description="Nhập thông tin hãng hàng không mới vào hệ thống"
      />

      {/* Edit Dialog */}
      <AirlineFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setEditingAirline(null)
        }}
        onSubmit={handleEditAirline}
        isSubmitting={submitting}
        editingAirline={editingAirline}
        title="Chỉnh sửa hãng hàng không"
        description="Cập nhật thông tin hãng hàng không"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hãng hàng không "{deletingAirline?.name}" không? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAirline} 
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
