import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { CalendarDays, MapPin, Plane, Hotel, Users, Star, Clock, Shield, Database, TestTube, User } from "lucide-react"
import { ChatBot } from "@/common/components/chat-bot"
import { Header } from "@/common/components/layout/header"
import { Footer } from "@/common/components/layout/footer"
import { AuthStatus } from "@/common/components/auth-status"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Nền tảng Đặt chỗ Thông minh</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Đặt vé máy bay, phòng khách sạn và nhiều dịch vụ khác với sự hỗ trợ của AI
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center">Tìm kiếm & Đặt chỗ</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="flights" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="flights" className="flex items-center gap-2">
                    <Plane className="w-4 h-4" />
                    Chuyến bay
                  </TabsTrigger>
                  <TabsTrigger value="hotels" className="flex items-center gap-2">
                    <Hotel className="w-4 h-4" />
                    Khách sạn
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="flights" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">Từ</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="from" placeholder="Thành phố xuất phát" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">Đến</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="to" placeholder="Thành phố đích" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departure">Ngày đi</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="departure" type="date" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passengers">Hành khách</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="passengers" placeholder="1 người lớn" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" asChild>
                    <a href="/booking">
                      <Plane className="w-4 h-4 mr-2" />
                      Tìm chuyến bay
                    </a>
                  </Button>
                </TabsContent>

                <TabsContent value="hotels" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destination">Điểm đến</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="destination" placeholder="Thành phố, khách sạn" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkin">Ngày nhận phòng</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="checkin" type="date" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkout">Ngày trả phòng</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="checkout" type="date" className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guests">Khách</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="guests" placeholder="2 khách, 1 phòng" className="pl-10" />
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg" asChild>
                    <a href="/booking">
                      <Hotel className="w-4 h-4 mr-2" />
                      Tìm khách sạn
                    </a>
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn nền tảng của chúng tôi?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Trải nghiệm đặt chỗ thông minh với công nghệ AI tiên tiến</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>An toàn & Bảo mật</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Hệ thống bảo mật đa lớp, đảm bảo thông tin cá nhân được bảo vệ tuyệt đối
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Đặt chỗ nhanh chóng</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI Agent thông minh giúp xử lý yêu cầu đặt chỗ trong vài giây, tối ưu hóa trải nghiệm người dùng
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Đa dịch vụ</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Một nền tảng cho tất cả nhu cầu: máy bay, khách sạn, phim ảnh và nhiều dịch vụ khác
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Điểm đến phổ biến</h2>
            <p className="text-gray-600">Khám phá những địa điểm du lịch được yêu thích nhất</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Hà Nội", image: "/placeholder.svg?height=200&width=300", price: "từ 2,500,000₫" },
              { name: "Hồ Chí Minh", image: "/placeholder.svg?height=200&width=300", price: "từ 2,200,000₫" },
              { name: "Đà Nẵng", image: "/placeholder.svg?height=200&width=300", price: "từ 1,800,000₫" },
              { name: "Phú Quốc", image: "/placeholder.svg?height=200&width=300", price: "từ 3,000,000₫" },
            ].map((destination, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48">
                  <img
                    src={destination.image || "/placeholder.svg"}
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.price}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Development Section - Real Data Integration */}
      {process.env.NODE_ENV === 'development' && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Development & Testing</h2>
              <p className="text-gray-600">
                Real database integration testing and API examples
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Authentication Test
                  </CardTitle>
                  <CardDescription>
                    Test authentication flow and user profile integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Test the authentication flow with Keycloak and user profile fetching from customer-service.
                  </p>
                  <Link href="/test/auth">
                    <Button className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Test Authentication
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    Real Data Integration Test
                  </CardTitle>
                  <CardDescription>
                    Test connection to flight_db and hotel_db PostgreSQL databases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Verify that the application is successfully connecting to and retrieving data from the real PostgreSQL databases.
                  </p>
                  <Link href="/test/real-data">
                    <Button className="w-full">
                      <TestTube className="mr-2 h-4 w-4" />
                      Run Database Tests
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-green-600" />
                    API Usage Examples
                  </CardTitle>
                  <CardDescription>
                    Interactive examples of all API endpoints with real data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Explore and test all available API endpoints including flight search, hotel booking, and payment processing.
                  </p>
                  <Link href="/examples/api-usage">
                    <Button variant="outline" className="w-full">
                      <Plane className="mr-2 h-4 w-4" />
                      View API Examples
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Real Database Status</h3>
              </div>
              <p className="text-green-700 text-sm">
                ✅ Connected to <strong>flight_db</strong> and <strong>hotel_db</strong> PostgreSQL databases<br/>
                ✅ Using production API services instead of mock data<br/>
                ✅ BFF routing configured at <code className="bg-green-100 px-1 rounded">http://storefront</code>
              </p>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <ChatBot />
    </div>
  )
}
