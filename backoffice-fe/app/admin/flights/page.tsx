"use client"

import { useState } from "react"
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
import { AdminLayout } from "@/components/admin/admin-layout"
import { Plus, Search, Edit, Trash2, Plane } from "lucide-react"

const flights = [
  {
    id: "VN001",
    airline: "Vietnam Airlines",
    route: "HAN → SGN",
    departure: "08:00",
    arrival: "10:15",
    date: "2024-01-15",
    price: "2,500,000₫",
    seats: 180,
    available: 45,
    status: "active",
  },
  {
    id: "VJ002",
    airline: "VietJet Air",
    route: "SGN → HAN",
    departure: "14:30",
    arrival: "16:45",
    date: "2024-01-15",
    price: "1,800,000₫",
    seats: 180,
    available: 67,
    status: "active",
  },
  {
    id: "QH003",
    airline: "Bamboo Airways",
    route: "HAN → DAD",
    departure: "19:00",
    arrival: "20:30",
    date: "2024-01-16",
    price: "2,200,000₫",
    seats: 164,
    available: 23,
    status: "active",
  },
  {
    id: "VN004",
    airline: "Vietnam Airlines",
    route: "SGN → PQC",
    departure: "11:30",
    arrival: "12:45",
    date: "2024-01-17",
    price: "3,000,000₫",
    seats: 180,
    available: 0,
    status: "full",
  },
]

export default function AdminFlights() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const getStatusBadge = (status: string, available: number) => {
    if (status === "full" || available === 0) {
      return <Badge className="bg-red-100 text-red-800">Hết chỗ</Badge>
    }
    if (available < 30) {
      return <Badge className="bg-yellow-100 text-yellow-800">Sắp hết</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Còn chỗ</Badge>
  }

  const filteredFlights = flights.filter(
    (flight) =>
      flight.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.route.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Chuyến bay</h1>
          <p className="text-gray-600 mt-2">Quản lý tất cả chuyến bay trong hệ thống</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chuyến bay</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights.length}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng ghế</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights.reduce((sum, flight) => sum + flight.seats, 0)}</div>
            <p className="text-xs text-muted-foreground">Trên tất cả chuyến bay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ghế trống</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights.reduce((sum, flight) => sum + flight.available, 0)}</div>
            <p className="text-xs text-muted-foreground">Có thể đặt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                ((flights.reduce((sum, flight) => sum + flight.seats, 0) -
                  flights.reduce((sum, flight) => sum + flight.available, 0)) /
                  flights.reduce((sum, flight) => sum + flight.seats, 0)) *
                  100,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground">Ghế đã đặt</p>
          </CardContent>
        </Card>
      </div>

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách chuyến bay</CardTitle>
              <CardDescription>Quản lý tất cả chuyến bay trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm chuyến bay..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
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
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">{flight.id}</TableCell>
                    <TableCell>{flight.airline}</TableCell>
                    <TableCell>{flight.route}</TableCell>
                    <TableCell>
                      {flight.departure} - {flight.arrival}
                    </TableCell>
                    <TableCell>{flight.date}</TableCell>
                    <TableCell className="font-medium">{flight.price}</TableCell>
                    <TableCell>
                      <span className={flight.available < 30 ? "text-orange-600 font-medium" : ""}>
                        {flight.available}/{flight.seats}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(flight.status, flight.available)}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
