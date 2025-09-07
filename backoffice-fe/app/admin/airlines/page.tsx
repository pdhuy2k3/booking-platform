"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, Plane, Building, MoreHorizontal, ImageIcon } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AirlineService } from "@/services/airline-service"
import { MediaSelector } from "@/components/ui/media-selector"
const { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } = require("@/components/ui/dropdown-menu")
import type { Airline, PaginatedResponse } from "@/types/api"
import { toast } from "@/components/ui/use-toast"
import { mediaService } from "@/services/media-service"

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
  const [formErrors, setFormErrors] = useState<Partial<AirlineFormData>>({

  })
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
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách hãng hàng không",
        variant: "destructive",
      })
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
      
      // Combine basic airline data with selected images
      const airlineData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        mediaPublicIds: formDataImages // Send image publicIds to backend
      }
      
      await AirlineService.createAirline(airlineData)
      
      toast({
        title: "Thành công",
        description: "Tạo hãng hàng không thành công",
      })
      
      setIsAddDialogOpen(false)
      setFormData({ name: "", code: "" })
      setFormDataImages([])
      setFormErrors({})
      loadAirlines()
    } catch (error: any) {
      console.error("Failed to create airline:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hãng hàng không",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditAirline = async () => {
    if (!editingAirline || !validateForm(formData)) return
    
    try {
      setSubmitting(true)
      
      // Combine basic airline data with selected images
      const airlineData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        mediaPublicIds: editingAirlineImages // Send image publicIds to backend
      }
      
      await AirlineService.updateAirline(editingAirline.id, airlineData)
      
      toast({
        title: "Thành công",
        description: "Cập nhật hãng hàng không thành công",
      })
      
      setIsEditDialogOpen(false)
      setEditingAirline(null)
      setFormData({ name: "", code: "" })
      setEditingAirlineImages([])
      setFormErrors({})
      loadAirlines()
    } catch (error: any) {
      console.error("Failed to update airline:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật hãng hàng không",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAirline = async () => {
    if (!deletingAirline) return
    
    try {
      setSubmitting(true)
      await AirlineService.deleteAirline(deletingAirline.id)
      
      toast({
        title: "Thành công",
        description: "Xóa hãng hàng không thành công",
      })
      
      setIsDeleteDialogOpen(false)
      setDeletingAirline(null)
      loadAirlines()
    } catch (error: any) {
      console.error("Failed to delete airline:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa hãng hàng không",
        variant: "destructive",
      })
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
    // Load existing images if available
    setEditingAirlineImages(airline.images || [])
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (airline: Airline) => {
    setDeletingAirline(airline)
    setIsDeleteDialogOpen(true)
  }

  const resetAddForm = () => {
    setFormData({ name: "", code: "" })
    setFormErrors({})
  }

  const totalAirlines = airlines?.totalElements || 0
  const activeAirlines = airlines?.content.filter(a => a.isActive).length || 0

  const renderAirlineLogo = (airline: Airline) => {
    // Get the first image if available
    const firstImagePublicId = airline.images && airline.images.length > 0 ? airline.images[0] : null
    
    if (firstImagePublicId) {
      // Use the media service to generate an optimized Cloudinary URL
      // The mediaService expects the full path format /api/media/{publicId}
      const imageUrl = mediaService.getOptimizedUrl(`/api/media/${firstImagePublicId}`, {
        width: 32,
        height: 32,
        crop: 'fill',
        quality: 'auto'
      })
      
      return (
        <img 
          src={imageUrl} 
          alt={airline.name} 
          className="w-8 h-8 object-cover rounded-md"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23e5e7eb'/%3E%3C/svg%3E"
          }}
        />
      )
    }
    
    // Fallback placeholder
    return <div className="bg-gray-200 border-2 border-dashed rounded-md w-8 h-8" />
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Hãng hàng không</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả hãng hàng không trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto" onClick={resetAddForm}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm hãng hàng không
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm hãng hàng không mới</DialogTitle>
              <DialogDescription>Nhập thông tin hãng hàng không mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên hãng hàng không *</Label>
                <Input
                  id="name"
                  placeholder="Vietnam Airlines"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Mã IATA *</Label>
                <Input
                  id="code"
                  placeholder="VN"
                  maxLength={2}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={formErrors.code ? "border-red-500" : ""}
                />
                {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label>Logo hãng hàng không</Label>
                <MediaSelector
                  value={formDataImages}
                  onChange={setFormDataImages}
                  folder="airlines"
                  maxSelection={2}
                  allowUpload={true}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button onClick={handleAddAirline} disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo hãng hàng không"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hãng hàng không</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAirlines}</div>
            <p className="text-xs text-muted-foreground">Tất cả hãng hàng không</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAirlines}</div>
            <p className="text-xs text-muted-foreground">Hãng đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tạm ngừng</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAirlines - activeAirlines}</div>
            <p className="text-xs text-muted-foreground">Hãng tạm ngừng</p>
          </CardContent>
        </Card>
      </div>

      {/* Airlines Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách hãng hàng không</CardTitle>
              <CardDescription className="text-sm">Quản lý tất cả hãng hàng không trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm hãng hàng không..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Mã IATA</TableHead>
                  <TableHead>Tên hãng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
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
                ) : airlines?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  airlines?.content.map((airline) => (
                    <TableRow key={airline.id}>
                      <TableCell>
                        {renderAirlineLogo(airline)}
                      </TableCell>
                      <TableCell className="font-medium">{airline.code}</TableCell>
                      <TableCell>{airline.name}</TableCell>
                      <TableCell>
                        <Badge className={airline.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {airline.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(airline.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(airline)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => openDeleteDialog(airline)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa hãng
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hãng hàng không</DialogTitle>
            <DialogDescription>Cập nhật thông tin hãng hàng không</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên hãng hàng không *</Label>
              <Input
                id="edit-name"
                placeholder="Vietnam Airlines"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Mã IATA *</Label>
              <Input
                id="edit-code"
                placeholder="VN"
                maxLength={2}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className={formErrors.code ? "border-red-500" : ""}
              />
              {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
            </div>
            <div className="space-y-2">
              <Label>Logo hãng hàng không</Label>
              <MediaSelector
                value={editingAirlineImages}
                onChange={setEditingAirlineImages}
                folder="airlines"
                maxSelection={2}
                allowUpload={true}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleEditAirline} disabled={submitting}>
              {submitting ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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


    </AdminLayout>
  )
}
