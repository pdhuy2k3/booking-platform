"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Eye, Edit, Plus, Trash2, DollarSign, Plane } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { FlightFareService } from "@/services/flight-fare.service"
import { useToast } from "@/hooks/use-toast"
import type { FlightFare, PaginatedResponse, FlightFareCreateRequest, FlightFareUpdateRequest } from "@/types/api"

export default function AdminFlightFares() {
  const [flightFares, setFlightFares] = useState<PaginatedResponse<FlightFare> | null>(null)
  const [loading, setLoading] = useState(true)
  const [scheduleIdFilter, setScheduleIdFilter] = useState("")
  const [fareClassFilter, setFareClassFilter] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFare, setSelectedFare] = useState<FlightFare | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  // Form states
  const [formData, setFormData] = useState<FlightFareCreateRequest>({
    scheduleId: "",
    fareClass: "ECONOMY",
    price: 0,
    availableSeats: 0,
  })
  const [editFormData, setEditFormData] = useState<FlightFareUpdateRequest>({})

  const { toast } = useToast()

  useEffect(() => {
    loadFlightFares()
  }, [scheduleIdFilter, fareClassFilter, currentPage])

  const loadFlightFares = async () => {
    try {
      setLoading(true)
      const data = await FlightFareService.getFlightFares({
        scheduleId: scheduleIdFilter || undefined,
        fareClass: fareClassFilter || undefined,
        page: currentPage,
        size: 10,
      })
      setFlightFares(data)
    } catch (error) {
      console.error("Failed to load flight fares:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giá vé",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFare = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await FlightFareService.createFlightFare(formData)
      toast({
        title: "Thành công",
        description: "Đã tạo giá vé thành công",
      })
      setCreateDialogOpen(false)
      resetForm()
      loadFlightFares()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo giá vé",
        variant: "destructive",
      })
    }
  }

  const handleEditFare = (fare: FlightFare) => {
    setSelectedFare(fare)
    setEditFormData({
      fareClass: fare.fareClass,
      price: fare.price,
      availableSeats: fare.availableSeats,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateFare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFare) return

    try {
      await FlightFareService.updateFlightFare(selectedFare.fareId, editFormData)
      toast({
        title: "Thành công",
        description: "Đã cập nhật giá vé thành công",
      })
      setEditDialogOpen(false)
      setSelectedFare(null)
      loadFlightFares()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật giá vé",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFare = (fare: FlightFare) => {
    setSelectedFare(fare)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedFare) return

    try {
      await FlightFareService.deleteFlightFare(selectedFare.fareId)
      toast({
        title: "Thành công",
        description: "Đã xóa giá vé thành công",
      })
      setDeleteDialogOpen(false)
      setSelectedFare(null)
      loadFlightFares()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa giá vé",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      scheduleId: "",
      fareClass: "ECONOMY",
      price: 0,
      availableSeats: 0,
    })
  }

  const getFareClassBadge = (fareClass: string) => {
    switch (fareClass) {
      case "ECONOMY":
        return <Badge className="bg-blue-100 text-blue-800">Phổ thông</Badge>
      case "PREMIUM_ECONOMY":
        return <Badge className="bg-purple-100 text-purple-800">Phổ thông đặc biệt</Badge>
      case "BUSINESS":
        return <Badge className="bg-green-100 text-green-800">Thương gia</Badge>
      case "FIRST":
        return <Badge className="bg-yellow-100 text-yellow-800">Hạng nhất</Badge>
      default:
        return <Badge>{fareClass}</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý giá vé máy bay</h2>
          <p className="text-muted-foreground">
            Quản lý giá vé cho các chuyến bay theo hạng ghế
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giá vé</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.totalElements || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phổ thông</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.content.filter(f => f.fareClass === "ECONOMY").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thương gia</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.content.filter(f => f.fareClass === "BUSINESS").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hạng nhất</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.content.filter(f => f.fareClass === "FIRST").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách giá vé</CardTitle>
            <CardDescription>
              Quản lý giá vé cho các chuyến bay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Mã lịch trình..."
                    value={scheduleIdFilter}
                    onChange={(e) => setScheduleIdFilter(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Select value={fareClassFilter} onValueChange={setFareClassFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Chọn hạng ghế" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả hạng ghế</SelectItem>
                    <SelectItem value="ECONOMY">Phổ thông</SelectItem>
                    <SelectItem value="PREMIUM_ECONOMY">Phổ thông đặc biệt</SelectItem>
                    <SelectItem value="BUSINESS">Thương gia</SelectItem>
                    <SelectItem value="FIRST">Hạng nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm giá vé
              </Button>
            </div>

            {/* Flight Fares Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giá vé</TableHead>
                    <TableHead>Mã lịch trình</TableHead>
                    <TableHead>Hạng ghế</TableHead>
                    <TableHead>Giá vé</TableHead>
                    <TableHead>Ghế trống</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : flightFares?.content?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    flightFares?.content?.map((fare) => (
                      <TableRow key={fare.fareId}>
                        <TableCell className="font-medium">{fare.fareId}</TableCell>
                        <TableCell>{fare.scheduleId}</TableCell>
                        <TableCell>{getFareClassBadge(fare.fareClass)}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatPrice(fare.price)}
                        </TableCell>
                        <TableCell>{fare.availableSeats}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditFare(fare)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFare(fare)}
                                className="text-red-600"
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

            {/* Pagination */}
            {flightFares && flightFares.totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Trước
                </Button>
                <div className="text-sm text-muted-foreground">
                  Trang {currentPage + 1} / {flightFares.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(flightFares.totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= flightFares.totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Flight Fare Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm giá vé mới</DialogTitle>
            <DialogDescription>
              Tạo giá vé mới cho chuyến bay
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFare} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleId">Mã lịch trình</Label>
              <Input
                id="scheduleId"
                value={formData.scheduleId}
                onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                placeholder="Nhập mã lịch trình"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fareClass">Hạng ghế</Label>
              <Select
                value={formData.fareClass}
                onValueChange={(value: any) => setFormData({ ...formData, fareClass: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">Phổ thông</SelectItem>
                  <SelectItem value="PREMIUM_ECONOMY">Phổ thông đặc biệt</SelectItem>
                  <SelectItem value="BUSINESS">Thương gia</SelectItem>
                  <SelectItem value="FIRST">Hạng nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá vé (VND)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="Nhập giá vé"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableSeats">Số ghế trống</Label>
              <Input
                id="availableSeats"
                type="number"
                value={formData.availableSeats}
                onChange={(e) => setFormData({ ...formData, availableSeats: Number(e.target.value) })}
                placeholder="Nhập số ghế trống"
                min="0"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCreateDialogOpen(false)
                  resetForm()
                }}
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Tạo giá vé
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Flight Fare Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa giá vé</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin giá vé
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFare} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-fareClass">Hạng ghế</Label>
              <Select
                value={editFormData.fareClass}
                onValueChange={(value: any) => setEditFormData({ ...editFormData, fareClass: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ECONOMY">Phổ thông</SelectItem>
                  <SelectItem value="PREMIUM_ECONOMY">Phổ thông đặc biệt</SelectItem>
                  <SelectItem value="BUSINESS">Thương gia</SelectItem>
                  <SelectItem value="FIRST">Hạng nhất</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Giá vé (VND)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editFormData.price || 0}
                onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                placeholder="Nhập giá vé"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-availableSeats">Số ghế trống</Label>
              <Input
                id="edit-availableSeats"
                type="number"
                value={editFormData.availableSeats || 0}
                onChange={(e) => setEditFormData({ ...editFormData, availableSeats: Number(e.target.value) })}
                placeholder="Nhập số ghế trống"
                min="0"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setSelectedFare(null)
                }}
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Cập nhật
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giá vé này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
