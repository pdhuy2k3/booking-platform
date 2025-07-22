import { Button } from "@/common/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { Badge } from "@/common/components/ui/badge"
import { CalendarDays, MapPin, Users, Hotel, Star } from "lucide-react"
import { Header } from "@/common/components/layout/header"
import { Footer } from "@/common/components/layout/footer"
import { ChatBot } from "@/common/components/chat-bot"

export default function HotelsPage() {
  const hotels = [
    {
      id: 1,
      name: "Lotte Hotel Hanoi",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.8,
      reviews: 1250,
      location: "Ba Đình, Hà Nội",
      price: "3,500,000",
      originalPrice: "4,200,000",
      amenities: ["Wifi miễn phí", "Bể bơi", "Spa", "Nhà hàng"],
      description: "Khách sạn 5 sao sang trọng tại trung tâm Hà Nội",
    },
    {
      id: 2,
      name: "InterContinental Hanoi Westlake",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.7,
      reviews: 980,
      location: "Tây Hồ, Hà Nội",
      price: "4,200,000",
      originalPrice: "5,000,000",
      amenities: ["Wifi miễn phí", "Bể bơi", "Gym", "Spa"],
      description: "Resort sang trọng bên hồ Tây thơ mộng",
    },
    {
      id: 3,
      name: "JW Marriott Hotel Hanoi",
      image: "/placeholder.svg?height=200&width=300",
      rating: 4.6,
      reviews: 750,
      location: "Ba Đình, Hà Nội",
      price: "2,800,000",
      originalPrice: "3,500,000",
      amenities: ["Wifi miễn phí", "Nhà hàng", "Bar", "Phòng họp"],
      description: "Khách sạn hiện đại với dịch vụ đẳng cấp quốc tế",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="w-5 h-5" />
              Tìm kiếm khách sạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Điểm đến</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="destination" defaultValue="Hà Nội" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkin">Nhận phòng</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="checkin" type="date" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkout">Trả phòng</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="checkout" type="date" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guests">Khách</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="guests" defaultValue="2 khách, 1 phòng" className="pl-10" />
                </div>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Tìm kiếm</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Khách sạn tại Hà Nội</h2>
            <p className="text-gray-600">{hotels.length} khách sạn được tìm thấy</p>
          </div>

          {hotels.map((hotel) => (
            <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Hotel Image */}
                  <div className="w-80 h-64 flex-shrink-0">
                    <img
                      src={hotel.image || "/placeholder.svg"}
                      alt={hotel.name}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                  </div>

                  {/* Hotel Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{hotel.name}</h3>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(hotel.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                              />
                            ))}
                            <span className="text-sm font-medium ml-1">{hotel.rating}</span>
                            <span className="text-sm text-gray-500">({hotel.reviews} đánh giá)</span>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {hotel.location}
                        </p>

                        <p className="text-gray-700 mb-4">{hotel.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.map((amenity, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Price and Book */}
                      <div className="text-right ml-6">
                        <div className="mb-2">
                          <p className="text-sm text-gray-500 line-through">{hotel.originalPrice}₫</p>
                          <p className="text-2xl font-bold text-blue-600">{hotel.price}₫</p>
                          <p className="text-sm text-gray-500">mỗi đêm</p>
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700 w-full">Chọn phòng</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
      <ChatBot />
    </div>
  )
}
