import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, Plane, Hotel, Users, Star, Clock, Shield } from "lucide-react"
import { ChatBot } from "@/components/chat-bot"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    <Plane className="w-4 h-4 mr-2" />
                    Tìm chuyến bay
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
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    <Hotel className="w-4 h-4 mr-2" />
                    Tìm khách sạn
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
                  Hệ thống bảo mật đa lớp với công nghệ Logto, đảm bảo thông tin cá nhân được bảo vệ tuyệt đối
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

      <Footer />
      <ChatBot />
    </div>
  )
}
