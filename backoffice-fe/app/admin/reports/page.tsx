"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin/admin-layout"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, TrendingUp, Users, Calendar } from "lucide-react"

const monthlyRevenue = [
  { month: "T1", revenue: 2400, bookings: 1200 },
  { month: "T2", revenue: 1800, bookings: 980 },
  { month: "T3", revenue: 2200, bookings: 1100 },
  { month: "T4", revenue: 2800, bookings: 1400 },
  { month: "T5", revenue: 3200, bookings: 1600 },
  { month: "T6", revenue: 2900, bookings: 1450 },
]

const serviceDistribution = [
  { name: "Chuyến bay", value: 45, color: "#2563eb" },
  { name: "Khách sạn", value: 35, color: "#16a34a" },
  { name: "Combo", value: 15, color: "#dc2626" },
  { name: "Khác", value: 5, color: "#ca8a04" },
]

const topDestinations = [
  { destination: "TP.HCM", bookings: 1250, revenue: 3200 },
  { destination: "Hà Nội", bookings: 1100, revenue: 2800 },
  { destination: "Đà Nẵng", bookings: 850, revenue: 2100 },
  { destination: "Phú Quốc", bookings: 650, revenue: 1950 },
  { destination: "Nha Trang", bookings: 480, revenue: 1200 },
]

export default function AdminReports() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Phân tích</h1>
          <p className="text-gray-600 mt-2">Thống kê chi tiết về hoạt động kinh doanh</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,900M₫</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge className="bg-green-100 text-green-800">+12.5%</Badge>
              <span>so với tháng trước</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đặt chỗ mới</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,450</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge className="bg-green-100 text-green-800">+8.2%</Badge>
              <span>tăng trưởng</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng mới</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge className="bg-green-100 text-green-800">+15.3%</Badge>
              <span>trong tháng</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Badge className="bg-yellow-100 text-yellow-800">-0.5%</Badge>
              <span>cần cải thiện</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
            <CardDescription>Biểu đồ doanh thu và đặt chỗ 6 tháng gần đây</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? `${value}M₫` : value,
                    name === "revenue" ? "Doanh thu" : "Đặt chỗ",
                  ]}
                />
                <Bar dataKey="revenue" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phân bố dịch vụ</CardTitle>
            <CardDescription>Tỷ lệ đặt chỗ theo từng loại dịch vụ</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Tỷ lệ"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Destinations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Điểm đến phổ biến</CardTitle>
          <CardDescription>Top 5 điểm đến được đặt nhiều nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDestinations.map((destination, index) => (
              <div key={destination.destination} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{destination.destination}</h3>
                    <p className="text-sm text-gray-500">{destination.bookings} đặt chỗ</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{destination.revenue}M₫</p>
                  <p className="text-sm text-gray-500">Doanh thu</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiệu suất hệ thống</CardTitle>
            <CardDescription>Các chỉ số quan trọng về hiệu suất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Thời gian phản hồi trung bình</span>
              <Badge className="bg-green-100 text-green-800">1.2s</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tỷ lệ thành công thanh toán</span>
              <Badge className="bg-green-100 text-green-800">98.5%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tỷ lệ hủy đặt chỗ</span>
              <Badge className="bg-yellow-100 text-yellow-800">2.4%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Độ hài lòng khách hàng</span>
              <Badge className="bg-green-100 text-green-800">4.7/5</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xu hướng tìm kiếm</CardTitle>
            <CardDescription>Từ khóa được tìm kiếm nhiều nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Vé máy bay Hà Nội</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-16 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">80%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Khách sạn TP.HCM</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-14 h-2 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">70%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Du lịch Đà Nẵng</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-12 h-2 bg-purple-600 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">60%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Combo du lịch</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div className="w-8 h-2 bg-orange-600 rounded-full"></div>
                </div>
                <span className="text-xs text-gray-500">40%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
