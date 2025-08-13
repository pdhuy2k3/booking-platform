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
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, Plane } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { FlightService } from "@/services/flight-service"
import type { Flight, PaginatedResponse } from "@/types/api"

export default function AdminFlights() {
  const [flights, setFlights] = useState<PaginatedResponse<Flight> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

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

  const getStatusBadge = (status: string, available: number) => {
    if (status === "CANCELLED") {
      return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
    }
    if (available === 0) {
      return <Badge className="bg-red-100 text-red-800">Hết chỗ</Badge>
    }
    if (available < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">Sắp hết</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Còn chỗ</Badge>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const totalSeats = flights?.content.reduce((sum, flight) => sum + flight.totalSeats, 0) || 0
  const availableSeats = flights?.content.reduce((sum, flight) => sum + flight.availableSeats, 0) || 0
  const occupancyRate = totalSeats > 0 ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : 0

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
            <CardTitle className="text-sm font-medium">Tổng ghế</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSeats.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Trên tất cả chuyến bay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ghế trống</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableSeats.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Có thể đặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Ghế đã đặt</p>
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
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Ngày bay</TableHead>
                  <TableHead>Giá vé</TableHead>
                  <TableHead>Ghế trống</TableHead>
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
                      <TableCell>{flight.airline}</TableCell>
                      <TableCell>
                        {flight.departure.airport} → {flight.arrival.airport}
                      </TableCell>
                      <TableCell>
                        {flight.departure.time} - {flight.arrival.time}
                      </TableCell>
                      <TableCell>{flight.departure.date}</TableCell>
                      <TableCell className="font-medium">{formatPrice(flight.price)}</TableCell>
                      <TableCell>
                        <span className={flight.availableSeats < 30 ? "text-orange-600 font-medium" : ""}>
                          {flight.availableSeats}/{flight.totalSeats}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(flight.status, flight.availableSeats)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
    </AdminLayout>
  )
}
