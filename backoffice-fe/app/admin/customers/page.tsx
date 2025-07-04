"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Search, MoreHorizontal, Eye, Edit, Ban, Users, UserCheck, UserX, Star } from "lucide-react"

const customers = [
  {
    id: "CUS001",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    phone: "0901234567",
    joinDate: "2023-06-15",
    totalBookings: 12,
    totalSpent: "45,300,000₫",
    status: "active",
    tier: "gold",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "CUS002",
    name: "Trần Thị B",
    email: "tranthib@email.com",
    phone: "0912345678",
    joinDate: "2023-08-22",
    totalBookings: 8,
    totalSpent: "28,500,000₫",
    status: "active",
    tier: "silver",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "CUS003",
    name: "Lê Văn C",
    email: "levanc@email.com",
    phone: "0923456789",
    joinDate: "2023-12-10",
    totalBookings: 3,
    totalSpent: "8,200,000₫",
    status: "active",
    tier: "bronze",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "CUS004",
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    phone: "0934567890",
    joinDate: "2023-05-03",
    totalBookings: 25,
    totalSpent: "125,800,000₫",
    status: "active",
    tier: "platinum",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "CUS005",
    name: "Hoàng Văn E",
    email: "hoangvane@email.com",
    phone: "0945678901",
    joinDate: "2024-01-15",
    totalBookings: 1,
    totalSpent: "2,500,000₫",
    status: "inactive",
    tier: "bronze",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>
      case "banned":
        return <Badge className="bg-red-100 text-red-800">Bị khóa</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <Badge className="bg-purple-100 text-purple-800">Platinum</Badge>
      case "gold":
        return <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>
      case "silver":
        return <Badge className="bg-gray-100 text-gray-800">Silver</Badge>
      case "bronze":
        return <Badge className="bg-orange-100 text-orange-800">Bronze</Badge>
      default:
        return <Badge variant="secondary">{tier}</Badge>
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const activeCustomers = customers.filter((c) => c.status === "active").length
  const totalRevenue = customers.reduce((sum, customer) => {
    const amount = Number.parseInt(customer.totalSpent.replace(/[₫,]/g, ""))
    return sum + amount
  }, 0)

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Khách hàng</h1>
        <p className="text-gray-600 mt-2">Quản lý thông tin và hoạt động của khách hàng</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Đã đăng ký</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng hoạt động</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeCustomers / customers.length) * 100)}% tổng số
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalRevenue / 1000000).toFixed(0)}M₫</div>
            <p className="text-xs text-muted-foreground">Từ khách hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng VIP</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.tier === "platinum" || c.tier === "gold").length}
            </div>
            <p className="text-xs text-muted-foreground">Gold & Platinum</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Danh sách khách hàng</CardTitle>
              <CardDescription>Quản lý thông tin và hoạt động của khách hàng</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm khách hàng..."
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
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Ngày tham gia</TableHead>
                  <TableHead>Đặt chỗ</TableHead>
                  <TableHead>Chi tiêu</TableHead>
                  <TableHead>Hạng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={customer.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{customer.joinDate}</TableCell>
                    <TableCell className="font-medium">{customer.totalBookings}</TableCell>
                    <TableCell className="font-medium">{customer.totalSpent}</TableCell>
                    <TableCell>{getTierBadge(customer.tier)}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
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
                            <Ban className="mr-2 h-4 w-4" />
                            Khóa tài khoản
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
