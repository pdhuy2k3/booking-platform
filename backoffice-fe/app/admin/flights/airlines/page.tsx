"use client"

import { useState, useEffect } from "react"
import { Building } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { MediaSelector } from "@/components/ui/media-selector"
import { AirlineService } from "@/services/airline-service"
import { mediaService } from "@/services/media-service"
import type { Airline, PaginatedResponse } from "@/types/api"
import { toast } from "sonner"
import { AdminPageLayout } from "@/components/admin/shared/admin-page-layout"
import { AdminTable, renderBadge, renderDate, renderImage } from "@/components/admin/shared/admin-table"
import { AdminFormDialog } from "@/components/admin/shared/admin-form-dialog"

interface AirlineFormData {
  name: string
  code: string
}

export default function AdminAirlines() {
  const [airlines, setAirlines] = useState<PaginatedResponse<Airline> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState<AirlineFormData>({ name: "", code: "" })
  const [formDataImages, setFormDataImages] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState<Partial<AirlineFormData>>({})
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null)
  const [editingAirlineImages, setEditingAirlineImages] = useState<string[]>([])
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

  const validateForm = (data: AirlineFormData): boolean => {
    const errors: Partial<AirlineFormData> = {}
    
    if (!data.name.trim()) {
      errors.name = "Tên hãng hàng không là bắt buộc"
    }
    
    if (!data.code.trim()) {
      errors.code = "Mã IATA là bắt buộc"
    } else if (data.code.length !== 2) {
      errors.code = "Mã IATA phải có đúng 2 ký tự"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAirline = async () => {
    if (!validateForm(formData)) return
    
    try {
      setSubmitting(true)
      
      const airlineData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        mediaPublicIds: formDataImages
      }
      
      await AirlineService.createAirline(airlineData)
      toast.success("Tạo hãng hàng không thành công")
      
      setIsAddDialogOpen(false)
      resetForm()
      loadAirlines()
    } catch (error: any) {
      console.error("Failed to create airline:", error)
      toast.error(error.message || "Không thể tạo hãng hàng không")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAirline = async () => {
    if (!editingAirline || !validateForm(formData)) return
    
    try {
      setSubmitting(true)
      
      const airlineData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        mediaPublicIds: editingAirlineImages
      }
      
      await AirlineService.updateAirline(editingAirline.id, airlineData)
      toast.success("Cập nhật hãng hàng không thành công")
      
      setIsEditDialogOpen(false)
      resetForm()
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
      await AirlineService.deleteAirline(deletingAirline.id)
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
    setFormData({
      name: airline.name,
      code: airline.code,
    })
    setEditingAirlineImages(airline.images || [])
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (airline: Airline) => {
    setDeletingAirline(airline)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", code: "" })
    setFormDataImages([])
    setEditingAirlineImages([])
    setFormErrors({})
    setEditingAirline(null)
  }

  const renderAirlineLogo = (airline: Airline) => {
    const firstImagePublicId = airline.images?.[0]
    if (firstImagePublicId) {
      const imageUrl = mediaService.getOptimizedUrl(`/api/media/${firstImagePublicId}`, {
        width: 32,
        height: 32,
        crop: 'fill',
        quality: 'auto'
      })
      return renderImage(imageUrl, airline.name)
    }
    return renderImage("", airline.name, "Logo")
  }

  // Stats calculations
  const totalAirlines = airlines?.totalElements || 0
  const activeAirlines = airlines?.content.filter(a => a.isActive).length || 0

  // Table columns
  const columns = [
    {
      key: 'logo',
      title: 'Logo',
      render: (_: any, airline: Airline) => renderAirlineLogo(airline)
    },
    { key: 'code', title: 'Mã IATA' },
    { key: 'name', title: 'Tên hãng' },
    {
      key: 'isActive',
      title: 'Trạng thái',
      render: (value: boolean) => renderBadge(value, "Hoạt động", "Tạm ngừng")
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (value: string) => renderDate(value)
    }
  ]

  // Form fields
  const formFields = [
    {
      name: 'name',
      label: 'Tên hãng hàng không',
      placeholder: 'Vietnam Airlines',
      required: true,
      value: formData.name,
      onChange: (value: string) => setFormData({ ...formData, name: value }),
      error: formErrors.name
    },
    {
      name: 'code',
      label: 'Mã IATA',
      placeholder: 'VN',
      maxLength: 2,
      required: true,
      value: formData.code,
      onChange: (value: string) => setFormData({ ...formData, code: value.toUpperCase() }),
      error: formErrors.code
    }
  ]

  const customFields = [
    {
      name: 'images',
      label: 'Logo hãng hàng không',
      component: (
        <MediaSelector
          value={isEditDialogOpen ? editingAirlineImages : formDataImages}
          onChange={isEditDialogOpen ? setEditingAirlineImages : setFormDataImages}
          folder="airlines"
          maxSelection={2}
          allowUpload={true}
        />
      )
    }
  ]

  return (
    <AdminPageLayout
      title="Quản lý Hãng hàng không"
      description="Quản lý tất cả hãng hàng không trong hệ thống"
      onAddClick={() => {
        resetForm()
        setIsAddDialogOpen(true)
      }}
      addButtonText="Thêm hãng hàng không"
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Tìm kiếm hãng hàng không..."
      stats={[
        {
          title: "Tổng hãng hàng không",
          value: totalAirlines,
          description: "Tất cả hãng hàng không",
          icon: <Building className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: "Đang hoạt động",
          value: activeAirlines,
          description: "Hãng đang hoạt động",
          icon: <Building className="h-4 w-4 text-muted-foreground" />
        },
        {
          title: "Tạm ngừng",
          value: totalAirlines - activeAirlines,
          description: "Hãng tạm ngừng",
          icon: <Building className="h-4 w-4 text-muted-foreground" />
        }
      ]}
    >
      <AdminTable
        data={airlines?.content || []}
        columns={columns}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        emptyMessage="Không có hãng hàng không nào"
        minWidth="600px"
      />

      {/* Add Dialog */}
      <AdminFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Thêm hãng hàng không mới"
        description="Nhập thông tin hãng hàng không mới vào hệ thống"
        fields={formFields}
        customFields={customFields}
        onSubmit={handleAddAirline}
        submitLabel="Tạo hãng hàng không"
        isSubmitting={submitting}
        canSubmit={Boolean(formData.name.trim() && formData.code.trim().length === 2)}
      />

      {/* Edit Dialog */}
      <AdminFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa hãng hàng không"
        description="Cập nhật thông tin hãng hàng không"
        fields={formFields}
        customFields={customFields}
        onSubmit={handleEditAirline}
        submitLabel="Cập nhật"
        isSubmitting={submitting}
        canSubmit={Boolean(formData.name.trim() && formData.code.trim().length === 2)}
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
