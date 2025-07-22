import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Badge } from "@/common/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/common/components/ui/avatar"
import { Plane, Hotel, Calendar, MapPin, Clock, User, Settings, CreditCard, Bell, Download } from "lucide-react"
import { Header } from "@/common/components/layout/header"
import { Footer } from "@/common/components/layout/footer"
import { ChatBot } from "@/common/components/chat-bot"

export default function DashboardPage() {
  const bookings = [
    {
      id: "BK001",
      type: "flight",
      title: "Chuyến bay HAN → SGN",
      airline: "Vietnam Airlines",
      date: "2024-01-15",
      time: "08:00 - 10:15",
      status: "confirmed",
      price: "2,500,000₫",
    },
    {
      id: "BK002",
      type: "hotel",
      title: "Lotte Hotel Hanoi",
      location: "Ba Đình, Hà Nội",
      date: "2024-01-20 - 2024-01-22",
      status: "confirmed",
      price: "7,000,000₫",
    },
    {
      id: "BK003",
      type: "flight",
      title: "Chuyến bay SGN → HAN",
      airline: "VietJet Air",
      date: "2024-01-25",
      time: "19:00 - 21:15",
      status: "pending",
      price: "1,800,000₫",
    },
  ]

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="w-4 h-4" />
      case "hotel":
        return <Hotel className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <CardTitle>Nguyễn Văn A</CardTitle>
                <CardDescription>nguyenvana@email.com</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Thông tin cá nhân
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Đặt chỗ của tôi
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Thanh toán
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Thông báo
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Cài đặt
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Quản lý đặt chỗ và thông tin cá nhân</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng đặt chỗ</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đã chi tiêu</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45,300,000₫</div>
                  <p className="text-xs text-muted-foreground">+15% từ tháng trước</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Điểm thưởng</CardTitle>
                  <Badge className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,450</div>
                  <p className="text-xs text-muted-foreground">+180 điểm mới</p>
                </CardContent>
              </Card>
            </div>

            {/* Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Đặt chỗ gần đây</CardTitle>
                <CardDescription>Quản lý và theo dõi các đặt chỗ của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {getTypeIcon(booking.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{booking.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {booking.date}
                            </span>
                            {booking.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {booking.time}
                              </span>
                            )}
                            {booking.airline && <span>{booking.airline}</span>}
                            {booking.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {booking.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(booking.status)}
                        <div className="text-right">
                          <p className="font-medium">{booking.price}</p>
                          <p className="text-sm text-gray-500">#{booking.id}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  )
}
