"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Plane,
  Building2,
  Search,
  Filter,
  MapPin,
  CalendarIcon,
  Star,
  Clock,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import MainLayout from "../main-layout"

interface FlightSearchParams {
  from: string
  to: string
  departDate: Date | undefined
  returnDate: Date | undefined
  passengers: number
  class: string
}

interface HotelSearchParams {
  location: string
  checkIn: Date | undefined
  checkOut: Date | undefined
  guests: number
  rooms: number
}

interface FlightResult {
  id: string
  airline: string
  from: string
  to: string
  departure: string
  arrival: string
  duration: string
  price: number
  stops: number
  class: string
}

interface HotelResult {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  price: number
  amenities: string[]
  image: string
}

export default function BookingManagementPage() {
  const [activeTab, setActiveTab] = useState("flights")
  const [showFilters, setShowFilters] = useState(true)

  // Flight search state
  const [flightSearch, setFlightSearch] = useState<FlightSearchParams>({
    from: "",
    to: "",
    departDate: undefined,
    returnDate: undefined,
    passengers: 1,
    class: "economy",
  })

  // Hotel search state
  const [hotelSearch, setHotelSearch] = useState<HotelSearchParams>({
    location: "",
    checkIn: undefined,
    checkOut: undefined,
    guests: 1,
    rooms: 1,
  })

  // Filter states
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("price")

  // Mock results
  const [flightResults] = useState<FlightResult[]>([
    {
      id: "1",
      airline: "Delta Airlines",
      from: "New York (JFK)",
      to: "Paris (CDG)",
      departure: "08:30",
      arrival: "21:45",
      duration: "7h 15m",
      price: 899,
      stops: 0,
      class: "Economy",
    },
    {
      id: "2",
      airline: "Air France",
      from: "New York (JFK)",
      to: "Paris (CDG)",
      departure: "14:20",
      arrival: "03:35",
      duration: "7h 15m",
      price: 1299,
      stops: 0,
      class: "Business",
    },
    {
      id: "3",
      airline: "British Airways",
      from: "New York (JFK)",
      to: "Paris (CDG)",
      departure: "10:15",
      arrival: "01:30",
      duration: "9h 15m",
      price: 749,
      stops: 1,
      class: "Economy",
    },
  ])

  const [hotelResults] = useState<HotelResult[]>([
    {
      id: "1",
      name: "Le Grand Hotel Paris",
      location: "Paris, France",
      rating: 4.8,
      reviews: 1247,
      price: 320,
      amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"],
      image: "/luxury-hotel-paris-grand.png",
    },
    {
      id: "2",
      name: "Hotel des Arts Montmartre",
      location: "Montmartre, Paris",
      rating: 4.5,
      reviews: 892,
      price: 180,
      amenities: ["WiFi", "Restaurant", "Bar", "Parking"],
      image: "/boutique-hotel-montmartre-paris.png",
    },
    {
      id: "3",
      name: "Luxury Palace Hotel",
      location: "Champs-Élysées, Paris",
      rating: 4.9,
      reviews: 2156,
      price: 450,
      amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Concierge"],
      image: "/placeholder.svg?height=200&width=300",
    },
  ])

  const airlines = ["Delta Airlines", "Air France", "British Airways", "Lufthansa", "Emirates"]
  const amenities = ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking", "Bar", "Concierge"]

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />
      case "parking":
        return <Car className="h-4 w-4" />
      case "restaurant":
      case "bar":
        return <Coffee className="h-4 w-4" />
      case "gym":
        return <Dumbbell className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const filteredFlights = flightResults.filter(
    (flight) =>
      flight.price >= priceRange[0] &&
      flight.price <= priceRange[1] &&
      (selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline)),
  )

  const filteredHotels = hotelResults.filter(
    (hotel) =>
      hotel.price >= priceRange[0] &&
      hotel.price <= priceRange[1] &&
      (selectedAmenities.length === 0 || selectedAmenities.some((amenity) => hotel.amenities.includes(amenity))),
  )

  return (
    <MainLayout>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-balance">Book Your Perfect Trip</h1>
            <p className="text-muted-foreground text-lg">
              Search and compare flights and hotels to find the best deals for your journey
            </p>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="flights" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Flights
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Hotels
              </TabsTrigger>
            </TabsList>

            {/* Flight Tab */}
            <TabsContent value="flights" className="space-y-6">
              {/* Flight Search Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5 text-primary" />
                    Search Flights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="from">From</Label>
                      <Input
                        id="from"
                        placeholder="Departure city"
                        value={flightSearch.from}
                        onChange={(e) => setFlightSearch((prev) => ({ ...prev, from: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to">To</Label>
                      <Input
                        id="to"
                        placeholder="Destination city"
                        value={flightSearch.to}
                        onChange={(e) => setFlightSearch((prev) => ({ ...prev, to: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Departure Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {flightSearch.departDate ? format(flightSearch.departDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={flightSearch.departDate}
                            onSelect={(date) => setFlightSearch((prev) => ({ ...prev, departDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Return Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {flightSearch.returnDate ? format(flightSearch.returnDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={flightSearch.returnDate}
                            onSelect={(date) => setFlightSearch((prev) => ({ ...prev, returnDate: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passengers">Passengers</Label>
                      <Select
                        value={flightSearch.passengers.toString()}
                        onValueChange={(value) =>
                          setFlightSearch((prev) => ({ ...prev, passengers: Number.parseInt(value) }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Passenger" : "Passengers"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="class">Class</Label>
                      <Select
                        value={flightSearch.class}
                        onValueChange={(value) => setFlightSearch((prev) => ({ ...prev, class: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="economy">Economy</SelectItem>
                          <SelectItem value="premium">Premium Economy</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="first">First Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full bg-primary hover:bg-primary/90">
                        <Search className="mr-2 h-4 w-4" />
                        Search Flights
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flight Results */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Filters</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    {showFilters && (
                      <CardContent className="space-y-4">
                        {/* Price Range */}
                        <div className="space-y-2">
                          <Label>Price Range</Label>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={2000}
                            min={0}
                            step={50}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </div>

                        {/* Airlines */}
                        <div className="space-y-2">
                          <Label>Airlines</Label>
                          <div className="space-y-2">
                            {airlines.map((airline) => (
                              <div key={airline} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={airline}
                                  checked={selectedAirlines.includes(airline)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAirlines((prev) => [...prev, airline])
                                    } else {
                                      setSelectedAirlines((prev) => prev.filter((a) => a !== airline))
                                    }
                                  }}
                                  className="rounded border-border"
                                />
                                <Label htmlFor={airline} className="text-sm">
                                  {airline}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sort By */}
                        <div className="space-y-2">
                          <Label>Sort By</Label>
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="price">Price</SelectItem>
                              <SelectItem value="duration">Duration</SelectItem>
                              <SelectItem value="departure">Departure Time</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>

                {/* Flight Results */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{filteredFlights.length} flights found</h3>
                  </div>

                  {filteredFlights.map((flight) => (
                    <Card key={flight.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Plane className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{flight.airline}</h4>
                              <p className="text-sm text-muted-foreground">
                                {flight.from} → {flight.to}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">${flight.price}</div>
                            <div className="text-sm text-muted-foreground">per person</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{flight.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{flight.stops === 0 ? "Direct" : `${flight.stops} stops`}</span>
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Hotel Tab */}
            <TabsContent value="hotels" className="space-y-6">
              {/* Hotel Search Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-secondary" />
                    Search Hotels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="City or hotel name"
                        value={hotelSearch.location}
                        onChange={(e) => setHotelSearch((prev) => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Check-in Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {hotelSearch.checkIn ? format(hotelSearch.checkIn, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={hotelSearch.checkIn}
                            onSelect={(date) => setHotelSearch((prev) => ({ ...prev, checkIn: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Check-out Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {hotelSearch.checkOut ? format(hotelSearch.checkOut, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={hotelSearch.checkOut}
                            onSelect={(date) => setHotelSearch((prev) => ({ ...prev, checkOut: date }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guests">Guests</Label>
                      <Select
                        value={hotelSearch.guests.toString()}
                        onValueChange={(value) => setHotelSearch((prev) => ({ ...prev, guests: Number.parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rooms">Rooms</Label>
                      <Select
                        value={hotelSearch.rooms.toString()}
                        onValueChange={(value) => setHotelSearch((prev) => ({ ...prev, rooms: Number.parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Room" : "Rooms"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 flex items-end">
                      <Button className="w-full bg-secondary hover:bg-secondary/90">
                        <Search className="mr-2 h-4 w-4" />
                        Search Hotels
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hotel Results */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Filters</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                        <Filter className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    {showFilters && (
                      <CardContent className="space-y-4">
                        {/* Price Range */}
                        <div className="space-y-2">
                          <Label>Price Range (per night)</Label>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={1000}
                            min={0}
                            step={25}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-2">
                          <Label>Amenities</Label>
                          <div className="space-y-2">
                            {amenities.map((amenity) => (
                              <div key={amenity} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={amenity}
                                  checked={selectedAmenities.includes(amenity)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAmenities((prev) => [...prev, amenity])
                                    } else {
                                      setSelectedAmenities((prev) => prev.filter((a) => a !== amenity))
                                    }
                                  }}
                                  className="rounded border-border"
                                />
                                <Label htmlFor={amenity} className="text-sm flex items-center gap-1">
                                  {getAmenityIcon(amenity)}
                                  {amenity}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div className="space-y-2">
                          <Label>Star Rating</Label>
                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => (
                              <div key={stars} className="flex items-center space-x-2">
                                <input type="checkbox" id={`${stars}-stars`} className="rounded border-border" />
                                <Label htmlFor={`${stars}-stars`} className="text-sm flex items-center">
                                  {[...Array(stars)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-current text-secondary" />
                                  ))}
                                  <span className="ml-1">& up</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>

                {/* Hotel Results */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{filteredHotels.length} hotels found</h3>
                  </div>

                  {filteredHotels.map((hotel) => (
                    <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                          <div className="aspect-video md:aspect-square relative overflow-hidden rounded-l-lg">
                            <img
                              src={hotel.image || "/placeholder.svg"}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="md:col-span-2 p-6">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">{hotel.name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">{hotel.location}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-secondary">${hotel.price}</div>
                                <div className="text-sm text-muted-foreground">per night</div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-3">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "w-4 h-4",
                                      i < Math.floor(hotel.rating)
                                        ? "text-secondary fill-current"
                                        : "text-muted-foreground",
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{hotel.rating}</span>
                              <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {hotel.amenities.slice(0, 4).map((amenity) => (
                                <Badge key={amenity} variant="secondary" className="text-xs flex items-center gap-1">
                                  {getAmenityIcon(amenity)}
                                  {amenity}
                                </Badge>
                              ))}
                              {hotel.amenities.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{hotel.amenities.length - 4} more
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button size="sm" className="bg-secondary hover:bg-secondary/90">
                                Book Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  )
}
