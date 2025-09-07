"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react"
import type { Room } from "@/types/api"

interface RoomManagementProps {
  rooms: Room[]
  formatPrice: (price: number) => string
  onEditRoom: (room: Room) => void
  onDeleteRoom: (roomId: number) => void
  onToggleAvailability: (roomId: number, isAvailable: boolean) => void
}

export function RoomManagement({
  rooms,
  formatPrice,
  onEditRoom,
  onDeleteRoom,
  onToggleAvailability
}: RoomManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge className="bg-green-100 text-green-800">Có sẵn</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Không sẵn</Badge>
    )
  }

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "available" && room.isAvailable) ||
                         (statusFilter === "unavailable" && !room.isAvailable)
    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg lg:text-xl">Danh sách phòng</CardTitle>
            <CardDescription className="text-sm">Quản lý các phòng trong khách sạn</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm phòng..."
                className="pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="available">Có sẵn</SelectItem>
                <SelectItem value="unavailable">Không sẵn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Số phòng</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Số người</TableHead>
                <TableHead>Diện tích</TableHead>
                <TableHead>Loại giường</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    {rooms.length === 0 ? "Không có phòng nào" : "Không tìm thấy phòng phù hợp"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">{room.description}</div>
                    </TableCell>
                    <TableCell className="font-medium">{formatPrice(room.price)}</TableCell>
                    <TableCell>{room.maxOccupancy} người</TableCell>
                    <TableCell>{room.roomSize} m²</TableCell>
                    <TableCell>{room.bedType}</TableCell>
                    <TableCell>{getStatusBadge(room.isAvailable)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onToggleAvailability(room.id, room.isAvailable)}>
                            {room.isAvailable ? (
                              <><X className="mr-2 h-4 w-4" />Vô hiệu hóa</>
                            ) : (
                              <><Check className="mr-2 h-4 w-4" />Kích hoạt</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditRoom(room)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDeleteRoom(room.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa phòng
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
