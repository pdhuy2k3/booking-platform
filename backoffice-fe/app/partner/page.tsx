import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Hotel, Calendar, DollarSign, TrendingUp, Eye, Plus } from "lucide-react"
import { PartnerLayout } from "@/components/partner/partner-layout"
import { PartnerStatsCard } from "@/components/partner/partner-stats-card"
import { PartnerRevenueChart } from "@/components/partner/partner-revenue-chart"
import { PartnerBookingsTable } from "@/components/partner/partner-bookings-table"
import { PartnerRecentActivity } from "@/components/partner/partner-recent-activity"

export default function PartnerDashboard() {
  const stats = [
    {
      title: "Khách sạn của tôi",
      value: "3",
      change: "+1",
      trend: "up" as const,
      icon: Hotel,
      description: "Khách sạn đang hoạt động",
    },
    {
      title: "Đặt chỗ tháng này",
      value: "127",
      change: "+23%",
      trend: "up" as const,
      icon: Calendar,
      description: "So với tháng trước",
    },
    {
      title: "Doanh thu tháng này",
      value: "450,000,000₫",
      change: "+18.5%",
      trend: "up" as const,
      icon: DollarSign,
      description: "Tăng trưởng tốt",
    },
    {
      title: "Tỷ lệ lấp đầy",
      value: "78%",
      change: "+5.2%",
      trend: "up" as const,
      icon: TrendingUp,
      description: "Trung bình các khách sạn",
    },
  ]

  const quickActions = [
    { title: "Thêm khách sạn mới", description: "Đăng ký khách sạn mới", action: "add-hotel", icon: Plus },
    { title: "Quản lý phòng", description: "Cập nhật thông tin phòng", action: "manage-rooms", icon: Hotel },
    { title: "Xem báo cáo", description: "Báo cáo chi tiết", action: "view-reports", icon: Eye },
    { title: "Cài đặt giá", description: "Điều chỉnh giá phòng", action: "pricing", icon: DollarSign },
  ]

  return (
    <PartnerLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Đối tác</h1>
        <p className="text-gray-600 mt-2">Quản lý khách sạn và theo dõi hiệu suất kinh doanh</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <PartnerStatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Activity Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Revenue Chart */}
        <div className="xl:col-span-2">
          <PartnerRevenueChart />
        </div>

        {/* Recent Activity */}
        <div className="xl:col-span-1">
          <PartnerRecentActivity />
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="mb-6 lg:mb-8">
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Các tác vụ thường dùng cho đối tác</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <action.icon className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-sm lg:text-base">{action.title}</h3>
                  </div>
                  <p className="text-xs lg:text-sm text-gray-600 mb-3">{action.description}</p>
                  <Button size="sm" className="w-full text-xs lg:text-sm">
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
          <CardDescription>Danh sách đặt chỗ mới nhất cho khách sạn của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <PartnerBookingsTable />
        </CardContent>
      </Card>
    </PartnerLayout>
  )
}
