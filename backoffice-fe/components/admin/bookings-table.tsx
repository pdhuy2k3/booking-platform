"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

const bookings = [
  {
    id: "BK001",
    customer: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    service: "Chuyến bay",
    details: "HAN → SGN",
    date: "2024-01-15",
    amount: "2,500,000₫",
    status: "confirmed",
  },
  {
    id: "BK002",
    customer: "Trần Thị B",
    email: "tranthib@email.com",
    service: "Khách sạn",
    details: "Lotte Hotel Hanoi",
    date: "2024-01-20",
    amount: "7,000,000₫",
    status: "confirmed",
  },
  {
    id: "BK003",
    customer: "Lê Văn C",
    email: "levanc@email.com",
    service: "Chuyến bay",
    details: "SGN → HAN",
    date: "2024-01-25",
    amount: "1,800,000₫",
    status: "pending",
  },
  {
    id: "BK004",
    customer: "Phạm Thị D",
    email: "phamthid@email.com",
    service: "Khách sạn",
    details: "InterContinental Westlake",
    date: "2024-01-28",
    amount: "4,200,000₫",
    status: "cancelled",
  },
  {
    id: "BK005",
    customer: "Hoàng Văn E",
    email: "hoangvane@email.com",
    service: "Combo",
    details: "Flight + Hotel Package",
    date: "2024-02-01",
    amount: "8,500,000₫",
    status: "confirmed",
  },
]

export function BookingsTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm đặt chỗ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đặt chỗ</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Dịch vụ</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.customer}</div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.service}</div>
                    <div className="text-sm text-gray-500">{booking.details}</div>
                  </div>
                </TableCell>
                <TableCell>{booking.date}</TableCell>
                <TableCell className="font-medium">{booking.amount}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hủy đặt chỗ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
