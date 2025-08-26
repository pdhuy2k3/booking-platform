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
import { Plus, Search, Edit, Trash2, MapPin, Navigation } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AirportService } from "@/services/airport-service"
import type { Airport, PaginatedResponse } from "@/types/api"
import { toast } from "@/components/ui/use-toast"

interface AirportFormData {
  name: string
  code: string
  city: string
  country: string
  timezone: string
}

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
  
  // Form states
  const [formData, setFormData] = useState<AirportFormData>({ 
    name: "", 
    code: "", 
    city: "", 
    country: "", 
    timezone: "" 
  })
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
      await AirportService.createAirport({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        timezone: formData.timezone.trim() || undefined,
      })
      
      toast({
        title: "Thành công",
        description: "Tạo sân bay thành công",
      })
      
      setIsAddDialogOpen(false)
      setFormData({ name: "", code: "", city: "", country: "", timezone: "" })
      setFormErrors({})
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
      await AirportService.updateAirport(editingAirport.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        timezone: formData.timezone.trim() || undefined,
      })
      
      toast({
        title: "Thành công",
        description: "Cập nhật sân bay thành công",
      })
      
      setIsEditDialogOpen(false)
      setEditingAirport(null)
      setFormData({ name: "", code: "", city: "", country: "", timezone: "" })
      setFormErrors({})
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
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (airport: Airport) => {
    setDeletingAirport(airport)
    setIsDeleteDialogOpen(true)
  }

  const resetAddForm = () => {
    setFormData({ name: "", code: "", city: "", country: "", timezone: "" })
    setFormErrors({})
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCityFilter("")
    setCountryFilter("")
    setCurrentPage(0)
  }

  const totalAirports = airports?.totalElements || 0
  const activeAirports = airports?.content.filter(a => a.isActive).length || 0
  const uniqueCities = new Set(airports?.content.map(a => a.city).filter(Boolean)).size
  const uniqueCountries = new Set(airports?.content.map(a => a.country).filter(Boolean)).size

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Sân bay</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả sân bay trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto" onClick={resetAddForm}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm sân bay
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm sân bay mới</DialogTitle>
              <DialogDescription>Nhập thông tin sân bay mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sân bay *</Label>
                <Input
                  id="name"
                  placeholder="Sân bay Quốc tế Nội Bài"
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
                  placeholder="HAN"
                  maxLength={3}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className={formErrors.code ? "border-red-500" : ""}
                />
                {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Thành phố *</Label>
                  <Input
                    id="city"
                    placeholder="Hà Nội"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={formErrors.city ? "border-red-500" : ""}
                  />
                  {formErrors.city && <p className="text-sm text-red-500">{formErrors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Quốc gia *</Label>
                  <Input
                    id="country"
                    placeholder="Vietnam"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className={formErrors.country ? "border-red-500" : ""}
                  />
                  {formErrors.country && <p className="text-sm text-red-500">{formErrors.country}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Múi giờ</Label>
                <Input
                  id="timezone"
                  placeholder="Asia/Ho_Chi_Minh"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
                Hủy
              </Button>
              <Button onClick={handleAddAirport} disabled={submitting}>
                {submitting ? "Đang tạo..." : "Tạo sân bay"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sân bay</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAirports}</div>
            <p className="text-xs text-muted-foreground">Tất cả sân bay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAirports}</div>
            <p className="text-xs text-muted-foreground">Sân bay hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thành phố</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCities}</div>
            <p className="text-xs text-muted-foreground">Số thành phố</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quốc gia</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCountries}</div>
            <p className="text-xs text-muted-foreground">Số quốc gia</p>
          </CardContent>
        </Card>
      </div>

      {/* Airports Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách sân bay</CardTitle>
              <CardDescription className="text-sm">Quản lý tất cả sân bay trong hệ thống</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm sân bay..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã IATA</TableHead>
                  <TableHead>Tên sân bay</TableHead>
                  <TableHead>Thành phố</TableHead>
                  <TableHead>Quốc gia</TableHead>
                  <TableHead>Múi giờ</TableHead>
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
                ) : airports?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  airports?.content.map((airport) => (
                    <TableRow key={airport.id}>
                      <TableCell className="font-medium">{airport.code}</TableCell>
                      <TableCell>{airport.name}</TableCell>
                      <TableCell>{airport.city}</TableCell>
                      <TableCell>{airport.country}</TableCell>
                      <TableCell>{airport.timezone || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={airport.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {airport.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(airport.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(airport)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => openDeleteDialog(airport)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
            <DialogTitle>Chỉnh sửa sân bay</DialogTitle>
            <DialogDescription>Cập nhật thông tin sân bay</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên sân bay *</Label>
              <Input
                id="edit-name"
                placeholder="Sân bay Quốc tế Nội Bài"
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
                placeholder="HAN"
                maxLength={3}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className={formErrors.code ? "border-red-500" : ""}
              />
              {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-city">Thành phố *</Label>
                <Input
                  id="edit-city"
                  placeholder="Hà Nội"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={formErrors.city ? "border-red-500" : ""}
                />
                {formErrors.city && <p className="text-sm text-red-500">{formErrors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-country">Quốc gia *</Label>
                <Input
                  id="edit-country"
                  placeholder="Vietnam"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className={formErrors.country ? "border-red-500" : ""}
                />
                {formErrors.country && <p className="text-sm text-red-500">{formErrors.country}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-timezone">Múi giờ</Label>
              <Input
                id="edit-timezone"
                placeholder="Asia/Ho_Chi_Minh"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleEditAirport} disabled={submitting}>
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
