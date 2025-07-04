import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, DollarSign, AlertTriangle } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCard } from "@/components/admin/stats-card"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { BookingsTable } from "@/components/admin/bookings-table"
import { RecentActivity } from "@/components/admin/recent-activity"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Tổng doanh thu",
      value: "2,450,000,000₫",
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      description: "So với tháng trước",
    },
    {
      title: "Đặt chỗ mới",
      value: "1,234",
      change: "+8.2%",
      trend: "up" as const,
      icon: Calendar,
      description: "Trong 30 ngày qua",
    },
    {
      title: "Khách hàng hoạt động",
      value: "8,945",
      change: "+15.3%",
      trend: "up" as const,
      icon: Users,
      description: "Người dùng đang hoạt động",
    },
    {
      title: "Tỷ lệ hủy",
      value: "2.4%",
      change: "-0.8%",
      trend: "down" as const,
      icon: AlertTriangle,
      description: "Giảm so với tháng trước",
    },
  ]

  const quickActions = [
    { title: "Thêm chuyến bay", description: "Tạo chuyến bay mới", action: "add-flight" },
    { title: "Thêm khách sạn", description: "Đăng ký khách sạn mới", action: "add-hotel" },
    { title: "Xem báo cáo", description: "Báo cáo chi tiết", action: "view-reports" },
    { title: "Quản lý khuyến mãi", description: "Tạo mã giảm giá", action: "manage-promotions" },
  ]

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Quản trị</h1>
        <p className="text-gray-600 mt-2">Tổng quan hoạt động nền tảng BookingSmart</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Các tác vụ thường dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                  <Button size="sm" className="w-full">
                    Thực hiện
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Đặt chỗ gần đây</CardTitle>
          <CardDescription>Danh sách đặt chỗ mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsTable />
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
