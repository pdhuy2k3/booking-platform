"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HotelCardSkeleton } from "@/modules/hotel/component/HotelCardSkeleton"
import { Search, Filter, Building2, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { hotelService } from "@/modules/hotel/service"

export default function HotelsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [hasMore, setHasMore] = useState(false)
  const [results, setResults] = useState<any[]>([])

  // Defaults for initial auto-search (configurable via env)
  const DEFAULT_DESTINATION = process.env.NEXT_PUBLIC_DEFAULT_HOTEL_DESTINATION || "New York"
  const DEFAULT_CHECKIN_DAYS_AHEAD = parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_HOTEL_CHECKIN_DAYS_AHEAD || "7",
    10,
  )
  const DEFAULT_STAY_NIGHTS = parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_HOTEL_STAY_NIGHTS || "2",
    10,
  )
  const DEFAULT_GUESTS = process.env.NEXT_PUBLIC_DEFAULT_HOTEL_GUESTS || "2-1"

  const amenities = [
    { name: "Free WiFi", icon: Wifi },
    { name: "Parking", icon: Car },
    { name: "Restaurant", icon: Coffee },
    { name: "Fitness Center", icon: Dumbbell },
    { name: "Pool", icon: Building2 },
    { name: "Spa", icon: Building2 },
  ]

  // Search state
  const [destination, setDestination] = useState("")
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [guests, setGuests] = useState("2-1") // format: guests-rooms

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => (prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]))
  }

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) => (prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]))
  }

  const handleViewDetails = (hotel: any) => {
    router.push(`/hotels/${encodeURIComponent(hotel.id)}`)
  }

  function pushQuery(nextPage: number) {
    const params = new URLSearchParams()
    if (destination) params.set("destination", destination)
    if (checkInDate) params.set("checkInDate", checkInDate)
    if (checkOutDate) params.set("checkOutDate", checkOutDate)
    if (guests) params.set("guests", guests)
    params.set("page", String(nextPage))
    params.set("limit", String(limit))
    router.replace(`/hotels?${params.toString()}`)
  }

  async function handleSearch(nextPage?: number) {
    setLoading(true)
    setError(null)
    try {
      const usePage = nextPage ?? page
      const [g, r] = guests.split("-")
      const res = await hotelService.search({
        destination,
        checkInDate,
        checkOutDate,
        guests: parseInt(g || "2", 10),
        rooms: parseInt(r || "1", 10),
        page: usePage,
        limit,
      })
      const ui = (res.hotels || []).map((h) => ({
        id: h.id,
        name: h.name,
        image: "/placeholder.svg",
        location: `${h.city || ""}${h.city ? ", " : ""}${h.country || ""}`,
        rating: h.starRating || 0,
        reviews: 0,
        price: h.minPrice || 0,
        originalPrice: Math.round((h.minPrice || 0) * 1.2),
        amenities: [],
        description: h.description || "",
      }))
      setResults(ui)
      setHasMore(Boolean(res.hasMore))
      setPage(usePage)
      pushQuery(usePage)
      // Persist last successful search
      try {
        localStorage.setItem(
          "hotel:lastSearch",
          JSON.stringify({ destination, checkInDate, checkOutDate, guests, page: usePage, limit }),
        )
      } catch {
        // ignore storage errors
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load hotels")
    } finally {
      setLoading(false)
    }
  }

  function nextPage() {
    if (hasMore) {
      const p = page + 1
      void handleSearch(p)
    }
  }

  function prevPage() {
    if (page > 1) {
      const p = page - 1
      void handleSearch(p)
    }
  }

  // Initialize from query, then localStorage, else defaults
  useEffect(() => {
    if (!searchParams) return
    const d = searchParams.get("destination") || ""
    const ci = searchParams.get("checkInDate") || ""
    const co = searchParams.get("checkOutDate") || ""
    const g = searchParams.get("guests") || DEFAULT_GUESTS
    const pg = parseInt(searchParams.get("page") || "1", 10)
    setDestination(d)
    setCheckInDate(ci)
    setCheckOutDate(co)
    setGuests(g)
    setPage(isNaN(pg) ? 1 : pg)
    if (d && ci && co) {
      void handleSearch(isNaN(pg) ? 1 : pg)
      return
    }

    // Try last search
    try {
      const raw = localStorage.getItem("hotel:lastSearch")
      if (raw) {
        const last = JSON.parse(raw) as {
          destination: string
          checkInDate: string
          checkOutDate: string
          guests: string
          page?: number
        }
        if (last?.destination && last?.checkInDate && last?.checkOutDate) {
          setDestination(last.destination)
          setCheckInDate(last.checkInDate)
          setCheckOutDate(last.checkOutDate)
          setGuests(last.guests || DEFAULT_GUESTS)
          setPage(last.page && last.page > 0 ? last.page : 1)
          setTimeout(() => void handleSearch(last.page && last.page > 0 ? last.page : 1), 0)
          return
        }
      }
    } catch {
      // ignore storage errors
    }

    // Fallback defaults and auto-search
    const today = new Date()
    const checkIn = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DEFAULT_CHECKIN_DAYS_AHEAD)
    const checkOut = new Date(
      checkIn.getFullYear(),
      checkIn.getMonth(),
      checkIn.getDate() + Math.max(1, DEFAULT_STAY_NIGHTS),
    )
    const toYmd = (dt: Date) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`
    setDestination(DEFAULT_DESTINATION)
    setCheckInDate(toYmd(checkIn))
    setCheckOutDate(toYmd(checkOut))
    setGuests(DEFAULT_GUESTS)
    setPage(1)
    setTimeout(() => void handleSearch(1), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
                  <Input placeholder="City or hotel name" className="pl-10" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Guests</label>
                <Select value={guests} onValueChange={setGuests}>
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
              <Button className="w-full md:w-auto" onClick={() => handleSearch()} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search Hotels"}
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
                <span className="text-sm text-muted-foreground">{results.length} hotels found</span>
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
              {loading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <HotelCardSkeleton key={i} />
                  ))}
                </div>
              )}
              {error && (
                <Card>
                  <CardContent className="p-4 text-sm text-destructive-foreground">{error}</CardContent>
                </Card>
              )}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Page {page}</div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-transparent" onClick={prevPage} disabled={loading || page === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" className="bg-transparent" onClick={nextPage} disabled={loading || !hasMore}>
                    Next
                  </Button>
                </div>
              </div>
              {results.map((hotel) => (
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
                          <Button variant="outline" className="flex-1 bg-transparent" onClick={() => handleViewDetails(hotel)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!loading && results.length === 0 && !error && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">No hotels yet. Try a search above.</CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
