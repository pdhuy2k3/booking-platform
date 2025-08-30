"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Eye, Edit, Settings, Plane, Users, DollarSign, Calendar } from "lucide-react"
import { PartnerLayout } from "@/components/partner/partner-layout"
import { usePartnerPermissions } from "@/hooks/use-partner-permissions"

// Mock data for partner's flights
const partnerFlights = [
  {
    id: "VN001",
    flightNumber: "VN001",
    airline: "Vietnam Airlines",
    route: "HAN → SGN",
    departure: "08:00",
    arrival: "10:15",
    date: "2024-01-15",
    price: "2,500,000₫",
    totalSeats: 180,
    availableSeats: 45,
    bookingsThisMonth: 135,
    revenue: "337,500,000₫",
    status: "ACTIVE",
  },
  {
    id: "VN002",
    flightNumber: "VN002",
    airline: "Vietnam Airlines",
    route: "SGN → HAN",
    departure: "14:30",
    arrival: "16:45",
    date: "2024-01-15",
    price: "2,500,000₫",
    totalSeats: 180,
    availableSeats: 67,
    bookingsThisMonth: 113,
    revenue: "282,500,000₫",
    status: "ACTIVE",
  },
  {
    id: "VN003",
    flightNumber: "VN003",
    airline: "Vietnam Airlines",
    route: "HAN → DAD",
    departure: "19:00",
    arrival: "20:30",
    date: "2024-01-16",
    price: "2,200,000₫",
    totalSeats: 164,
    availableSeats: 23,
    bookingsThisMonth: 141,
    revenue: "310,200,000₫",
    status: "ACTIVE",
  },
]

export default function PartnerFlights() {
  const permissions = usePartnerPermissions()
  const [flights, setFlights] = useState(partnerFlights)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<any>(null)

  // Form state for edit flight
  const [editForm, setEditForm] = useState({
    flightNumber: '',
    airline: '',
    from: '',
    to: '',
    departure: '',
    arrival: '',
    date: '',
    price: '',
    seats: '',
    aircraft: ''
  })

  // Redirect if no permission
  if (!permissions.canManageFlights) {
    return (
      <PartnerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
            <p className="text-gray-600">Bạn không có quyền quản lý chuyến bay.</p>
          </div>
        </div>
      </PartnerLayout>
    )
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

  const filteredFlights = flights.filter(
    (flight) =>
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.route.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalFlights = flights.length
  const totalSeats = flights.reduce((sum, flight) => sum + flight.totalSeats, 0)
  const totalBookings = flights.reduce((sum, flight) => sum + flight.bookingsThisMonth, 0)
  const occupancyRate =
    totalSeats > 0
      ? Math.round(((totalSeats - flights.reduce((sum, flight) => sum + flight.availableSeats, 0)) / totalSeats) * 100)
      : 0

  // Handle opening edit dialog
  const handleOpenEditDialog = (flight: any) => {
    setSelectedFlight(flight)
    // Parse route to get from and to airports
    const routeParts = flight.route.split(' → ')
    const fromAirport = routeParts[0] || ''
    const toAirport = routeParts[1] || ''
    
    setEditForm({
      flightNumber: flight.flightNumber || '',
      airline: flight.airline || '',
      from: fromAirport,
      to: toAirport,
      departure: flight.departure || '',
      arrival: flight.arrival || '',
      date: flight.date || '',
      price: flight.price?.replace('₫', '').replace(',', '') || '',
      seats: flight.totalSeats?.toString() || '',
      aircraft: '' // We don't have aircraft type in the mock data
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateFlight = () => {
    if (!selectedFlight) return
    
    // Update the flight in the list
    const updatedFlights = flights.map(flight => 
      flight.id === selectedFlight.id ? {
        ...flight,
        flightNumber: editForm.flightNumber,
        airline: editForm.airline,
        route: `${editForm.from} → ${editForm.to}`,
        departure: editForm.departure,
        arrival: editForm.arrival,
        date: editForm.date,
        price: editForm.price ? `${parseInt(editForm.price).toLocaleString()}₫` : flight.price,
        totalSeats: editForm.seats ? parseInt(editForm.seats) : flight.totalSeats
      } : flight
    )
    
    setFlights(updatedFlights)
    setIsEditDialogOpen(false)
    setSelectedFlight(null)
  }

  return (
    <PartnerLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Chuyến bay của tôi</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý các chuyến bay bạn đã đăng ký</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 w-full lg:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Thêm chuyến bay mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm chuyến bay mới</DialogTitle>
              <DialogDescription>Nhập thông tin chuyến bay để đăng ký với BookingSmart</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="flightNumber">Mã chuyến bay *</Label>
                <Input id="flightNumber" placeholder="VD: VN001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="airline">Hãng hàng không *</Label>
                <Input id="airline" placeholder="VD: Vietnam Airlines" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from">Điểm đi *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sân bay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HAN">HAN - Nội Bài</SelectItem>
                    <SelectItem value="SGN">SGN - Tân Sơn Nhất</SelectItem>
                    <SelectItem value="DAD">DAD - Đà Nẵng</SelectItem>
                    <SelectItem value="CXR">CXR - Cam Ranh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Điểm đến *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sân bay" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HAN">HAN - Nội Bài</SelectItem>
                    <SelectItem value="SGN">SGN - Tân Sơn Nhất</SelectItem>
                    <SelectItem value="DAD">DAD - Đà Nẵng</SelectItem>
                    <SelectItem value="CXR">CXR - Cam Ranh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departure">Giờ khởi hành *</Label>
                <Input id="departure" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrival">Giờ đến *</Label>
                <Input id="arrival" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Ngày bay *</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Giá vé (VND) *</Label>
                <Input id="price" placeholder="2500000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seats">Tổng số ghế *</Label>
                <Input id="seats" type="number" placeholder="180" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aircraft">Loại máy bay</Label>
                <Input id="aircraft" placeholder="VD: Boeing 787" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>Gửi đăng ký</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chuyến bay</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlights}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Ghế đã đặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đặt chỗ tháng này</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Tổng đặt chỗ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">930M₫</div>
            <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
          </CardContent>
        </Card>
      </div>

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách chuyến bay</CardTitle>
              <CardDescription className="text-sm">Quản lý các chuyến bay bạn đã đăng ký</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm chuyến bay..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã chuyến bay</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Ngày bay</TableHead>
                  <TableHead>Giá vé</TableHead>
                  <TableHead>Ghế trống</TableHead>
                  <TableHead>Đặt chỗ/tháng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFlights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlights.map((flight) => (
                    <TableRow key={flight.id}>
                      <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                      <TableCell>{flight.route}</TableCell>
                      <TableCell>
                        {flight.departure} - {flight.arrival}
                      </TableCell>
                      <TableCell>{flight.date}</TableCell>
                      <TableCell className="font-medium">{flight.price}</TableCell>
                      <TableCell>
                        <span className={flight.availableSeats < 30 ? "text-orange-600 font-medium" : ""}>
                          {flight.availableSeats}/{flight.totalSeats}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{flight.bookingsThisMonth}</TableCell>
                      <TableCell>{getStatusBadge(flight.status, flight.availableSeats)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenEditDialog(flight)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Cài đặt giá
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

      {/* Edit Flight Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyến bay</DialogTitle>
            <DialogDescription>Cập nhật thông tin chuyến bay {selectedFlight?.flightNumber}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-flightNumber">Mã chuyến bay *</Label>
              <Input 
                id="edit-flightNumber" 
                placeholder="VD: VN001" 
                value={editForm.flightNumber}
                onChange={(e) => setEditForm(prev => ({...prev, flightNumber: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-airline">Hãng hàng không *</Label>
              <Input 
                id="edit-airline" 
                placeholder="VD: Vietnam Airlines" 
                value={editForm.airline}
                onChange={(e) => setEditForm(prev => ({...prev, airline: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-from">Sân bay đi *</Label>
              <Select value={editForm.from} onValueChange={(value) => setEditForm(prev => ({...prev, from: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sân bay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HAN">HAN - Nội Bài</SelectItem>
                  <SelectItem value="SGN">SGN - Tân Sơn Nhất</SelectItem>
                  <SelectItem value="DAD">DAD - Đà Nẵng</SelectItem>
                  <SelectItem value="CXR">CXR - Cam Ranh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-to">Sân bay đến *</Label>
              <Select value={editForm.to} onValueChange={(value) => setEditForm(prev => ({...prev, to: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sân bay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HAN">HAN - Nội Bài</SelectItem>
                  <SelectItem value="SGN">SGN - Tân Sơn Nhất</SelectItem>
                  <SelectItem value="DAD">DAD - Đà Nẵng</SelectItem>
                  <SelectItem value="CXR">CXR - Cam Ranh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-departure">Giờ khởi hành *</Label>
              <Input 
                id="edit-departure" 
                type="time" 
                value={editForm.departure}
                onChange={(e) => setEditForm(prev => ({...prev, departure: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-arrival">Giờ đến *</Label>
              <Input 
                id="edit-arrival" 
                type="time" 
                value={editForm.arrival}
                onChange={(e) => setEditForm(prev => ({...prev, arrival: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Ngày bay *</Label>
              <Input 
                id="edit-date" 
                type="date" 
                value={editForm.date}
                onChange={(e) => setEditForm(prev => ({...prev, date: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Giá vé (VND) *</Label>
              <Input 
                id="edit-price" 
                placeholder="2500000" 
                value={editForm.price}
                onChange={(e) => setEditForm(prev => ({...prev, price: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-seats">Tổng số ghế *</Label>
              <Input 
                id="edit-seats" 
                type="number" 
                placeholder="180" 
                value={editForm.seats}
                onChange={(e) => setEditForm(prev => ({...prev, seats: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-aircraft">Loại máy bay</Label>
              <Input 
                id="edit-aircraft" 
                placeholder="VD: Boeing 787" 
                value={editForm.aircraft}
                onChange={(e) => setEditForm(prev => ({...prev, aircraft: e.target.value}))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateFlight}>Lưu thay đổi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </PartnerLayout>
  )
}
