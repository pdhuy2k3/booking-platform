"use client"

import { useState } from "react"
import { Search, Filter, Building2, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import HotelDetailsModal from "@/components/hotel-details-modal"

export default function HotelsPage() {
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [selectedHotel, setSelectedHotel] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const amenities = [
    { name: "Free WiFi", icon: Wifi },
    { name: "Parking", icon: Car },
    { name: "Restaurant", icon: Coffee },
    { name: "Fitness Center", icon: Dumbbell },
    { name: "Pool", icon: Building2 },
    { name: "Spa", icon: Building2 },
  ]

  const hotelResults = [
    {
      id: 1,
      name: "Grand Hotel Paris",
      image: "/placeholder.svg?height=200&width=300",
      location: "Champs-Élysées, Paris",
      rating: 4.8,
      reviews: 1247,
      price: 299,
      originalPrice: 399,
      amenities: ["Free WiFi", "Restaurant", "Fitness Center", "Spa"],
      description: "Luxury hotel in the heart of Paris with stunning city views",
    },
    {
      id: 2,
      name: "Hotel de la Paix",
      image: "/placeholder.svg?height=200&width=300",
      location: "Le Marais, Paris",
      rating: 4.6,
      reviews: 892,
      price: 189,
      originalPrice: 249,
      amenities: ["Free WiFi", "Restaurant", "Parking"],
      description: "Charming boutique hotel in historic Le Marais district",
    },
  ]

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) => (prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]))
  }

  const handleViewDetails = (hotel: any) => {
    setSelectedHotel(hotel)
    setIsModalOpen(true)
  }

  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto p-6 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Hotels</h1>
          <p className="text-muted-foreground">Discover the perfect accommodation for your stay</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Hotel Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="City or hotel name" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Guests</label>
                <Select>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="2 Guests, 1 Room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-1">1 Guest, 1 Room</SelectItem>
                    <SelectItem value="2-1">2 Guests, 1 Room</SelectItem>
                    <SelectItem value="3-1">3 Guests, 1 Room</SelectItem>
                    <SelectItem value="4-1">4 Guests, 1 Room</SelectItem>
                    <SelectItem value="2-2">2 Guests, 2 Rooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="w-full md:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search Hotels
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Price per night</label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={500} step={25} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Star Rating</label>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(rating)}
                          onChange={() => toggleRating(rating)}
                          className="rounded border-gray-300"
                        />
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-sm ml-1">
                            {rating} Star{rating > 1 ? "s" : ""}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Amenities</label>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <label key={amenity.name} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity.name)}
                          onChange={() => toggleAmenity(amenity.name)}
                          className="rounded border-gray-300"
                        />
                        <amenity.icon className="h-4 w-4" />
                        <span className="text-sm">{amenity.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Property Type</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Hotel</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Resort</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Apartment</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Villa</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Hotel Results</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{hotelResults.length} hotels found</span>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Guest Rating</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {hotelResults.map((hotel) => (
                <Card key={hotel.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img
                          src={hotel.image || "/placeholder.svg"}
                          alt={hotel.name}
                          className="w-full h-48 md:h-full object-cover rounded-l-lg"
                        />
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{hotel.name}</h3>
                            <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{hotel.location}</span>
                            </div>
                            <div className="flex items-center space-x-2 mb-3">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(hotel.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{hotel.rating}</span>
                              <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground line-through">${hotel.originalPrice}</div>
                            <div className="text-2xl font-bold text-primary">${hotel.price}</div>
                            <div className="text-sm text-muted-foreground">per night</div>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4">{hotel.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {hotel.amenities.map((amenity) => (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex space-x-3">
                          <Button className="flex-1">Book Now</Button>
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => handleViewDetails(hotel)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <HotelDetailsModal hotel={selectedHotel} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
