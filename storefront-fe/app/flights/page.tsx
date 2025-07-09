import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, MapPin, Users, Plane } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChatBot } from "@/components/chat-bot"

export default function FlightsPage() {
  const flights = [
    {
      id: 1,
      airline: "Vietnam Airlines",
      logo: "/placeholder.svg?height=40&width=40",
      departure: { time: "08:00", airport: "HAN", city: "Hà Nội" },
      arrival: { time: "10:15", airport: "SGN", city: "TP.HCM" },
      duration: "2h 15m",
      price: "2,500,000",
      class: "Economy",
      stops: "Bay thẳng",
    },
    {
      id: 2,
      airline: "VietJet Air",
      logo: "/placeholder.svg?height=40&width=40",
      departure: { time: "14:30", airport: "HAN", city: "Hà Nội" },
      arrival: { time: "16:45", airport: "SGN", city: "TP.HCM" },
      duration: "2h 15m",
      price: "1,800,000",
      class: "Economy",
      stops: "Bay thẳng",
    },
    {
      id: 3,
      airline: "Bamboo Airways",
      logo: "/placeholder.svg?height=40&width=40",
      departure: { time: "19:00", airport: "HAN", city: "Hà Nội" },
      arrival: { time: "21:15", airport: "SGN", city: "TP.HCM" },
      duration: "2h 15m",
      price: "2,200,000",
      class: "Economy",
      stops: "Bay thẳng",
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
              <Plane className="w-5 h-5" />
              Tìm kiếm chuyến bay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">Từ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="from" defaultValue="Hà Nội (HAN)" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">Đến</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="to" defaultValue="TP.HCM (SGN)" className="pl-10" />
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
                  <Input id="passengers" defaultValue="1 người lớn" className="pl-10" />
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
            <h2 className="text-2xl font-bold">Kết quả tìm kiếm</h2>
            <p className="text-gray-600">{flights.length} chuyến bay được tìm thấy</p>
          </div>

          {flights.map((flight) => (
            <Card key={flight.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {/* Airline Logo */}
                    <div className="flex items-center space-x-3">
                      <img src={flight.logo || "/placeholder.svg"} alt={flight.airline} className="w-10 h-10 rounded" />
                      <div>
                        <p className="font-medium">{flight.airline}</p>
                        <p className="text-sm text-gray-500">{flight.class}</p>
                      </div>
                    </div>

                    {/* Flight Details */}
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.departure.time}</p>
                        <p className="text-sm text-gray-500">{flight.departure.airport}</p>
                        <p className="text-xs text-gray-400">{flight.departure.city}</p>
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-16 h-px bg-gray-300"></div>
                          <Plane className="w-4 h-4" />
                          <div className="w-16 h-px bg-gray-300"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{flight.duration}</p>
                        <p className="text-xs text-green-600">{flight.stops}</p>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold">{flight.arrival.time}</p>
                        <p className="text-sm text-gray-500">{flight.arrival.airport}</p>
                        <p className="text-xs text-gray-400">{flight.arrival.city}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price and Book */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{flight.price}₫</p>
                    <p className="text-sm text-gray-500 mb-3">cho 1 người</p>
                    <Button className="bg-blue-600 hover:bg-blue-700">Chọn chuyến bay</Button>
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
