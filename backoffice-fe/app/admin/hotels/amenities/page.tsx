"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Settings, Check, X, ImageIcon } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AmenityService } from "@/services/amenity-service"
import { MediaSelector } from "@/components/ui/media-selector"
import type { Amenity, PaginatedResponse } from "@/types/api"
import { toast } from "sonner"

export default function AdminAmenities() {
  const [amenities, setAmenities] = useState<PaginatedResponse<Amenity> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null)
  const [newAmenity, setNewAmenity] = useState({
    name: "",
    iconUrl: "",
    isActive: true,
    displayOrder: 0,
  })
  const [newAmenityImages, setNewAmenityImages] = useState<string[]>([])
  const [editingAmenity, setEditingAmenity] = useState({
    name: "",
    iconUrl: "",
    isActive: true,
    displayOrder: 0,
  })
  const [editingAmenityImages, setEditingAmenityImages] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([])
  const [page, setPage] = useState(0)
  const [size] = useState(20)


  useEffect(() => {
    loadAmenities()
  }, [searchTerm, page])

  const loadAmenities = async () => {
    try {
      setLoading(true)
      const data = await AmenityService.getAmenities({
        search: searchTerm || undefined,
        page,
        size,
        sortBy: "displayOrder",
        sortDirection: "ASC"
      })
      setAmenities(data)
    } catch (error) {
      console.error("Failed to load amenities:", error)
      toast.error("Không thể tải danh sách tiện nghi")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAmenity = async () => {
    try {
      if (!newAmenity.name.trim()) {
        toast.error("Vui lòng nhập tên tiện nghi")
        return
      }

      // Combine basic amenity data with selected images
      const amenityData = {
        ...newAmenity,
        images: newAmenityImages // Send image publicIds to backend
      }

      await AmenityService.createAmenity(amenityData)
      toast.success("Tiện nghi đã được tạo thành công")
      setIsAddDialogOpen(false)
      setNewAmenity({
        name: "",
        iconUrl: "",
        isActive: true,
        displayOrder: 0,
      })
      setNewAmenityImages([])
      loadAmenities()
    } catch (error) {
      console.error("Failed to create amenity:", error)
      toast.error("Không thể tạo tiện nghi")
    }
  }

  const handleEditAmenity = (amenity: Amenity) => {
    setSelectedAmenity(amenity)
    setEditingAmenity({
      name: amenity.name,
      iconUrl: amenity.iconUrl || "",
      isActive: amenity.isActive,
      displayOrder: amenity.displayOrder,
    })
    // Load existing images if available
    setEditingAmenityImages([])
    setIsEditDialogOpen(true)
  }

  const handleUpdateAmenity = async () => {
    if (!selectedAmenity) return

    try {
      if (!editingAmenity.name.trim()) {
        toast.error("Vui lòng nhập tên tiện nghi")
        return
      }

      // Combine basic amenity data with selected images
      const amenityData = {
        ...editingAmenity,
        images: editingAmenityImages // Send image publicIds to backend
      }

      await AmenityService.updateAmenity(selectedAmenity.id, amenityData)
      toast.success("Tiện nghi đã được cập nhật thành công")
      setIsEditDialogOpen(false)
      setSelectedAmenity(null)
      setEditingAmenityImages([])
      loadAmenities()
    } catch (error) {
      console.error("Failed to update amenity:", error)
      toast.error("Không thể cập nhật tiện nghi")
    }
  }

  const handleDeleteAmenity = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tiện nghi này?")) return

    try {
      await AmenityService.deleteAmenity(id)
      toast.success("Tiện nghi đã được xóa thành công")
      loadAmenities()
    } catch (error) {
      console.error("Failed to delete amenity:", error)
      toast.error("Không thể xóa tiện nghi")
    }
  }

  const handleToggleStatus = async (amenity: Amenity) => {
    try {
      await AmenityService.toggleAmenityStatus(amenity.id, !amenity.isActive)
      toast.success(`Tiện nghi đã được ${!amenity.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`)
      loadAmenities()
    } catch (error) {
      console.error("Failed to toggle amenity status:", error)
      toast.error("Không thể thay đổi trạng thái tiện nghi")
    }
  }

  const handleBulkStatusChange = async (isActive: boolean) => {
    if (selectedAmenities.length === 0) {
      toast.error("Vui lòng chọn ít nhất một tiện nghi")
      return
    }

    try {
      // Process each selected amenity
      for (const id of selectedAmenities) {
        await AmenityService.toggleAmenityStatus(id, isActive)
      }
      
      toast.success(`Đã ${isActive ? 'kích hoạt' : 'vô hiệu hóa'} ${selectedAmenities.length} tiện nghi`)
      setSelectedAmenities([])
      loadAmenities()
    } catch (error) {
      console.error("Failed to bulk update amenities:", error)
      toast.error("Không thể cập nhật trạng thái tiện nghi")
    }
  }

  const toggleSelectAmenity = (id: number) => {
    setSelectedAmenities(prev => 
      prev.includes(id) 
        ? prev.filter(amenityId => amenityId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (!amenities) return
    
    if (selectedAmenities.length === amenities.content.length) {
      setSelectedAmenities([])
    } else {
      setSelectedAmenities(amenities.content.map(a => a.id))
    }
  }

  const totalAmenities = amenities?.totalElements || 0
  const activeAmenities = amenities?.content.filter(a => a.isActive).length || 0

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Tiện nghi</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý các tiện nghi của khách sạn</p>
        </div>
        <div className="flex gap-2">
          {selectedAmenities.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => handleBulkStatusChange(true)}
                className="bg-green-50 hover:bg-green-100 text-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Kích hoạt ({selectedAmenities.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => handleBulkStatusChange(false)}
                className="bg-red-50 hover:bg-red-100 text-red-700"
              >
                <X className="w-4 h-4 mr-2" />
                Vô hiệu hóa ({selectedAmenities.length})
              </Button>
            </>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm tiện nghi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm tiện nghi mới</DialogTitle>
                <DialogDescription>Nhập thông tin tiện nghi mới</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amenityName">Tên tiện nghi *</Label>
                  <Input
                    id="amenityName"
                    placeholder="Ví dụ: WiFi miễn phí"
                    value={newAmenity.name}
                    onChange={(e) => setNewAmenity({...newAmenity, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iconUrl">URL biểu tượng</Label>
                  <Input
                    id="iconUrl"
                    placeholder="https://example.com/icon.png"
                    value={newAmenity.iconUrl}
                    onChange={(e) => setNewAmenity({...newAmenity, iconUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Thứ tự hiển thị</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    placeholder="0"
                    value={newAmenity.displayOrder}
                    onChange={(e) => setNewAmenity({...newAmenity, displayOrder: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={newAmenity.isActive}
                    onCheckedChange={(checked) => setNewAmenity({...newAmenity, isActive: checked})}
                  />
                  <Label htmlFor="isActive">Kích hoạt ngay</Label>
                </div>
                <div className="space-y-2">
                  <Label>Hình ảnh tiện nghi</Label>
                  <MediaSelector
                    value={newAmenityImages}
                    onChange={setNewAmenityImages}
                    folder="amenities"
                    maxSelection={3}
                    allowUpload={true}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateAmenity}>Thêm tiện nghi</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tiện nghi</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmenities}</div>
            <p className="text-xs text-muted-foreground">Trong hệ thống</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAmenities}</div>
            <p className="text-xs text-muted-foreground">
              {totalAmenities ? Math.round((activeAmenities / totalAmenities) * 100) : 0}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vô hiệu hóa</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmenities - activeAmenities}</div>
            <p className="text-xs text-muted-foreground">Không sử dụng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trang hiện tại</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{amenities?.content.length || 0}</div>
            <p className="text-xs text-muted-foreground">Tiện nghi</p>
          </CardContent>
        </Card>
      </div>

      {/* Amenities Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách tiện nghi</CardTitle>
              <CardDescription className="text-sm">Quản lý tất cả tiện nghi trong hệ thống</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm tiện nghi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={amenities?.content && amenities.content.length > 0 && selectedAmenities.length === amenities.content.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="w-12">STT</TableHead>
                  <TableHead>Tên tiện nghi</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Thứ tự</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : amenities?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  amenities?.content.map((amenity, index) => (
                    <TableRow key={amenity.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity.id)}
                          onChange={() => toggleSelectAmenity(amenity.id)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {page * size + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{amenity.name}</TableCell>
                      <TableCell>
                        {amenity.iconUrl ? (
                          <img 
                            src={amenity.iconUrl} 
                            alt={amenity.name}
                            className="w-6 h-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{amenity.displayOrder}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={amenity.isActive}
                          onCheckedChange={() => handleToggleStatus(amenity)}
                        />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {amenity.createdAt 
                          ? new Date(amenity.createdAt).toLocaleDateString('vi-VN')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAmenity(amenity)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteAmenity(amenity.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa tiện nghi
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

          {/* Pagination */}
          {amenities && amenities.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Hiển thị {amenities.number * amenities.size + 1} - {Math.min((amenities.number + 1) * amenities.size, amenities.totalElements)} trong tổng số {amenities.totalElements} tiện nghi
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === amenities.totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Amenity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tiện nghi</DialogTitle>
            <DialogDescription>Cập nhật thông tin tiện nghi</DialogDescription>
          </DialogHeader>
          {selectedAmenity && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editAmenityName">Tên tiện nghi *</Label>
                <Input
                  id="editAmenityName"
                  value={editingAmenity.name}
                  onChange={(e) => setEditingAmenity({...editingAmenity, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editIconUrl">URL biểu tượng</Label>
                <Input
                  id="editIconUrl"
                  value={editingAmenity.iconUrl}
                  onChange={(e) => setEditingAmenity({...editingAmenity, iconUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDisplayOrder">Thứ tự hiển thị</Label>
                <Input
                  id="editDisplayOrder"
                  type="number"
                  value={editingAmenity.displayOrder}
                  onChange={(e) => setEditingAmenity({...editingAmenity, displayOrder: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="editIsActive"
                  checked={editingAmenity.isActive}
                  onCheckedChange={(checked) => setEditingAmenity({...editingAmenity, isActive: checked})}
                />
                <Label htmlFor="editIsActive">Kích hoạt</Label>
              </div>
              <div className="space-y-2">
                <Label>Hình ảnh tiện nghi</Label>
                <MediaSelector
                  value={editingAmenityImages}
                  onChange={setEditingAmenityImages}
                  folder="amenities"
                  maxSelection={3}
                  allowUpload={true}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setSelectedAmenity(null)
            }}>
              Hủy
            </Button>
            <Button onClick={handleUpdateAmenity}>Cập nhật</Button>
          </div>
        </DialogContent>
      </Dialog>


    </AdminLayout>
  )
}
