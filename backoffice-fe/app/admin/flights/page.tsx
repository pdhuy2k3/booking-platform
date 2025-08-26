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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, Plane, Eye, MoreHorizontal } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { AdminLayout } from "@/components/admin/admin-layout"
import { FlightService } from "@/services/flight-service"
import type { Flight, PaginatedResponse } from "@/types/api"

export default function AdminFlights() {
  const [flights, setFlights] = useState<PaginatedResponse<Flight> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Selected flight for actions
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadFlights()
  }, [searchTerm])

  const loadFlights = async () => {
    try {
      setLoading(true)
      const data = await FlightService.getFlights({
        search: searchTerm || undefined,
        page: 1,
        size: 20,
      })
      setFlights(data)
    } catch (error) {
      console.error("Failed to load flights:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      case "DELAYED":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm hoãn</Badge>
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "ON_TIME":
        return <Badge className="bg-blue-100 text-blue-800">Đúng giờ</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Không xác định</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  // Note: These stats will need to be implemented once backend provides seat information
  // For now, using placeholder values since the new Flight interface doesn't have seat data
  const totalFlights = flights?.totalElements || 0
  const activeFlights = flights?.content.filter(f => f.status === 'ACTIVE').length || 0

  return (
    <AdminLayout>
      {/* Header - Stack on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Chuyến bay</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả chuyến bay trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Thêm chuyến bay
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm chuyến bay mới</DialogTitle>
              <DialogDescription>Nhập thông tin chuyến bay mới vào hệ thống</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="flightId">Mã chuyến bay</Label>
                <Input id="flightId" placeholder="VN001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="airline">Hãng hàng không</Label>
                <Input id="airline" placeholder="Vietnam Airlines" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">Điểm đi</Label>
                <Input id="from" placeholder="HAN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Điểm đến</Label>
                <Input id="to" placeholder="SGN" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure">Giờ khởi hành</Label>
                <Input id="departure" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival">Giờ đến</Label>
                <Input id="arrival" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Ngày bay</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá vé</Label>
                <Input id="price" placeholder="2,500,000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Tổng số ghế</Label>
                <Input id="seats" type="number" placeholder="180" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="available">Ghế trống</Label>
                <Input id="available" type="number" placeholder="180" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Thêm chuyến bay</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - Better responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chuyến bay</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights?.totalElements || 0}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuyến bay hoạt động</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlights}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuyến bay hủy</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights?.content.filter(f => f.status === 'CANCELLED').length || 0}</div>
            <p className="text-xs text-muted-foreground">Đã hủy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flights?.content.length ? 
                formatPrice(flights.content.reduce((sum, f) => sum + (f.basePrice || 0), 0) / flights.content.length) : 
                '0 ₫'
              }
            </div>
            <p className="text-xs text-muted-foreground">Giá vé trung bình</p>
          </CardContent>
        </Card>
      </div>

      {/* Flights Table - Add horizontal scroll on mobile */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách chuyến bay</CardTitle>
              <CardDescription className="text-sm">Quản lý tất cả chuyến bay trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm chuyến bay..."
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
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã chuyến bay</TableHead>
                  <TableHead>Hãng hàng không</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Thời gian bay</TableHead>
                  <TableHead>Loại máy bay</TableHead>
                  <TableHead>Giá cơ bản</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : flights?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  flights?.content.map((flight) => (
                    <TableRow key={flight.id}>
                      <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                      <TableCell>{flight.airline?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {flight.departureAirport?.code} → {flight.arrivalAirport?.code}
                      </TableCell>
                      <TableCell>
                        {flight.baseDurationMinutes ? `${Math.floor(flight.baseDurationMinutes / 60)}h ${flight.baseDurationMinutes % 60}m` : 'N/A'}
                      </TableCell>
                      <TableCell>{flight.aircraftType || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{flight.basePrice ? formatPrice(flight.basePrice) : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={flight.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {flight.isActive ? 'Có' : 'Không'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(flight.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFlight(flight)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFlight(flight)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                setSelectedFlight(flight)
                                setIsDeleteDialogOpen(true)
                              }}
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
        </CardContent>
      </Card>

      {/* View Flight Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết chuyến bay</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của chuyến bay {selectedFlight?.flightNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedFlight && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="font-semibold">Mã chuyến bay</Label>
                <div className="text-sm">{selectedFlight.flightNumber}</div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Hãng hàng không</Label>
                <div className="text-sm">{selectedFlight.airline?.name || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Sân bay đi</Label>
                <div className="text-sm">
                  {selectedFlight.departureAirport?.code} - {selectedFlight.departureAirport?.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Sân bay đến</Label>
                <div className="text-sm">
                  {selectedFlight.arrivalAirport?.code} - {selectedFlight.arrivalAirport?.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Thời gian bay</Label>
                <div className="text-sm">
                  {selectedFlight.baseDurationMinutes
                    ? `${Math.floor(selectedFlight.baseDurationMinutes / 60)}h ${selectedFlight.baseDurationMinutes % 60}m`
                    : 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Loại máy bay</Label>
                <div className="text-sm">{selectedFlight.aircraftType || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Giá cơ bản</Label>
                <div className="text-sm font-medium">
                  {selectedFlight.basePrice ? formatPrice(selectedFlight.basePrice) : 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Trạng thái hoạt động</Label>
                <div>{selectedFlight.isActive ? getStatusBadge('ACTIVE') : getStatusBadge('CANCELLED')}</div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="font-semibold">Trạng thái chuyến bay</Label>
                <div>{getStatusBadge(selectedFlight.status)}</div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Flight Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyến bay</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chuyến bay {selectedFlight?.flightNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedFlight && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-flightNumber">Mã chuyến bay</Label>
                <Input
                  id="edit-flightNumber"
                  defaultValue={selectedFlight.flightNumber}
                  placeholder="VN001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-aircraftType">Loại máy bay</Label>
                <Input
                  id="edit-aircraftType"
                  defaultValue={selectedFlight.aircraftType || ''}
                  placeholder="Boeing 777"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-basePrice">Giá cơ bản (VND)</Label>
                <Input
                  id="edit-basePrice"
                  type="number"
                  defaultValue={selectedFlight.basePrice || 0}
                  placeholder="2500000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-baseDuration">Thời gian bay (phút)</Label>
                <Input
                  id="edit-baseDuration"
                  type="number"
                  defaultValue={selectedFlight.baseDurationMinutes || 0}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Trạng thái hoạt động</Label>
                <Select defaultValue={selectedFlight.isActive ? "true" : "false"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Hoạt động</SelectItem>
                    <SelectItem value="false">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái chuyến bay</Label>
                <Select defaultValue={selectedFlight.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="ON_TIME">Đúng giờ</SelectItem>
                    <SelectItem value="DELAYED">Tạm hoãn</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button
              disabled={submitting}
              onClick={() => {
                // TODO: Implement update flight logic
                setIsEditDialogOpen(false)
                toast({
                  title: "Thành công",
                  description: "Chuyến bay đã được cập nhật.",
                })
              }}
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Flight Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chuyến bay</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuyến bay <strong>{selectedFlight?.flightNumber}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
              onClick={() => {
                // TODO: Implement delete flight logic
                setIsDeleteDialogOpen(false)
                setSelectedFlight(null)
                toast({
                  title: "Thành công",
                  description: "Chuyến bay đã được xóa.",
                })
              }}
            >
              {submitting ? "Đang xóa..." : "Xóa chuyến bay"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
