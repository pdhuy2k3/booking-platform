"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import type { Flight, PaginatedResponse } from "@/types/api"

interface FlightTableProps {
  flights: PaginatedResponse<Flight> | null
  loading: boolean
  searchTerm: string
  onSearchChange: (term: string) => void
  onViewFlight: (flight: Flight) => void
  onEditFlight: (flight: Flight) => void
  onDeleteFlight: (flight: Flight) => void
  formatPrice: (price: number) => string
}

export function FlightTable({
  flights,
  loading,
  searchTerm,
  onSearchChange,
  onViewFlight,
  onEditFlight,
  onDeleteFlight,
  formatPrice
}: FlightTableProps) {
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

  return (
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
                onChange={(e) => onSearchChange(e.target.value)}
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
                    <TableCell>{flight.airline?.name || 'Chưa có thông tin'}</TableCell>
                    <TableCell>
                      {flight.departureAirport?.code && flight.arrivalAirport?.code
                        ? `${flight.departureAirport.code} → ${flight.arrivalAirport.code}`
                        : 'Chưa có thông tin'
                      }
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
                          <DropdownMenuItem onClick={() => onViewFlight(flight)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditFlight(flight)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => onDeleteFlight(flight)}
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
  )
}
