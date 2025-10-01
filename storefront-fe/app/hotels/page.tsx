"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { HotelCardSkeleton } from "@/modules/hotel/component/HotelCardSkeleton"
import { HotelCard } from "@/modules/hotel/component/HotelCard"
import { Search, Filter, Building2, MapPin, Calendar, Users, Star, Wifi, Car, Coffee, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { hotelService } from "@/modules/hotel/service"
import type { InitialHotelData, HotelDetails } from "@/modules/hotel/type"
import HotelDetailsModal from "@/modules/hotel/component/HotelDetailsModal"
import { HotelDestinationModal } from "@/modules/hotel/component/HotelDestinationModal"
import { formatPrice } from "@/lib/currency"
import { useBooking } from "@/contexts/booking-context"

export default function HotelsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    resetBooking,
    setBookingType,
    setSelectedHotel,
    updateBookingData,
    setStep,
  } = useBooking()
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [hasMore, setHasMore] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [initialData, setInitialData] = useState<InitialHotelData | null>(null)
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const searchSectionRef = useRef<HTMLDivElement | null>(null)

  // Defaults for initial auto-search (configurable via env)
  const DEFAULT_DESTINATION = process.env.NEXT_PUBLIC_DEFAULT_HOTEL_DESTINATION || "Ho Chi Minh City"
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
    { name: "WiFi miễn phí", icon: Wifi },
    { name: "Bãi đỗ xe", icon: Car },
    { name: "Nhà hàng", icon: Coffee },
    { name: "Phòng gym", icon: Dumbbell },
    { name: "Hồ bơi", icon: Building2 },
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

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleViewDetails = (hotel: any) => {
    setSelectedHotelId(hotel.id)
    setIsModalOpen(true)
  }

  const handleBookNow = (hotel: any) => {
    if (!hasSearched) {
      scrollToSearch()
      return
    }
    setSelectedHotelId(hotel.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedHotelId(null)
  }

  const handleDestinationSelect = (destination: any) => {
    setDestination(destination.name)
  }

  const handleRoomBooking = ({ hotel, room }: { hotel: HotelDetails; room: any }) => {
    if (!hasSearched) {
      scrollToSearch()
      return
    }
    if (!hotel || !room) {
      console.error('Unable to start booking flow: missing hotel or room details')
      return
    }

    const hotelId = hotel.hotelId || selectedHotelId

    if (!hotelId) {
      console.error('Unable to start booking flow: missing hotel identifier')
      return
    }

    const amenities = Array.isArray(room.features) && room.features.length > 0
      ? room.features
      : Array.isArray(hotel.amenities)
      ? hotel.amenities
      : []

    const roomTypeId = (room as any)?.roomTypeId || room.id || room.roomId
    const roomId = room.roomId || room.id || roomTypeId
    const roomName = room.name || room.roomType || 'Selected Room'
    const roomType = room.roomType || room.name || 'Room'
    const price = Number(room.price ?? room.pricePerNight ?? hotel.pricePerNight) || 0
    const [guestCountRaw, roomCountRaw] = guests.split('-')
    const guestCount = parseInt(guestCountRaw || '0', 10) || undefined
    const roomCount = parseInt(roomCountRaw || '0', 10) || undefined
    const nights = checkInDate && checkOutDate
      ? Math.max(1, Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)))
      : undefined

    resetBooking()
    setBookingType('hotel')
    setSelectedHotel({
      id: hotelId,
      name: hotel.name,
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || '',
      rating: hotel.starRating ?? hotel.rating,
      roomTypeId: roomTypeId ? String(roomTypeId) : '',
      roomId: roomId,
      roomType,
      roomName,
      price,
      currency: hotel.currency || 'VND',
      amenities,
      image: room.image || hotel.primaryImage || hotel.images?.[0],
      checkInDate: checkInDate || undefined,
      checkOutDate: checkOutDate || undefined,
      guests: guestCount,
      rooms: roomCount,
      nights,
    })
    updateBookingData({
      bookingType: 'HOTEL',
      totalAmount: 0,
      currency: hotel.currency || 'VND',
      productDetails: undefined,
    })
    setStep('passengers')
    handleCloseModal()
    router.push('/bookings')
  }

  // Add a ref to track if we're already loading initial data
  const isLoadingInitialData = useRef(false)

  async function loadInitialData() {
    // Prevent multiple simultaneous initial data loads
    if (isLoadingInitialData.current || loading) {
      return
    }
    
    isLoadingInitialData.current = true
    setLoading(true)
    setError(null)
    try {
      // Call search endpoint without any search parameters to get initial data
      const res = await hotelService.search({
        destination: "",
        checkInDate: "",
        checkOutDate: "",
        guests: 2,
        rooms: 1,
        page: 1,
        limit,
      })
      setInitialData(res as InitialHotelData)
      
      // Convert initial hotels to UI format
      const ui = (res.hotels || []).map((h) => ({
        id: h.hotelId,
        name: h.name,
        image: h.primaryImage || h.images?.[0] || "/placeholder.svg",
        location: `${h.city || ""}${h.city ? ", " : ""}Vietnam`,
        rating: h.rating || 0,
        reviews: 0,
        price: h.pricePerNight || 0,
        originalPrice: Math.round((h.pricePerNight || 0) * 1.2),
        amenities: h.amenities || [],
        description: "",
      }))
      setResults(ui)
      setHasMore(Boolean(res.hasMore))
    } catch (e: any) {
      setError(e?.message || "Failed to load initial hotel data")
    } finally {
      setLoading(false)
      isLoadingInitialData.current = false
    }
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
    if (!destination.trim() || !checkInDate || !checkOutDate) {
      setError('Vui lòng chọn điểm đến và ngày nhận/trả phòng để xem giá')
      scrollToSearch()
      return
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      setError('Ngày nhận phòng / trả phòng không hợp lệ')
      scrollToSearch()
      return
    }

    if (checkOut <= checkIn) {
      setError('Ngày trả phòng phải sau ngày nhận phòng')
      scrollToSearch()
      return
    }

    const [guestCountRaw, roomCountRaw] = guests.split('-')
    const guestCount = parseInt(guestCountRaw || '0', 10)
    const roomCount = parseInt(roomCountRaw || '0', 10)
    if (!Number.isFinite(guestCount) || guestCount <= 0 || !Number.isFinite(roomCount) || roomCount <= 0) {
      setError('Vui lòng chọn số khách và số phòng hợp lệ')
      scrollToSearch()
      return
    }

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
        id: h.hotelId,
        name: h.name,
        image: h.primaryImage || h.images?.[0] || "/placeholder.svg",
        location: `${h.city || ""}${h.city ? ", " : ""}Vietnam`,
        rating: h.rating || 0,
        reviews: 0,
        price: h.pricePerNight || 0,
        originalPrice: Math.round((h.pricePerNight || 0) * 1.2),
        amenities: h.amenities || [],
        description: "",
      }))
      setResults(ui)
      setHasMore(Boolean(res.hasMore))
      setPage(usePage)
      setHasSearched(true)
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
    let isMounted = true
    
    const initialize = async () => {
      if (!searchParams || !isMounted) return
      const d = searchParams.get("destination") || ""
      const ci = searchParams.get("checkInDate") || ""
      const co = searchParams.get("checkOutDate") || ""
      const g = searchParams.get("guests") || DEFAULT_GUESTS
      const pg = parseInt(searchParams.get("page") || "1", 10)
      
      // Check if we have search parameters
      const hasSearchParams = Boolean(d && ci && co)

      if (hasSearchParams) {
        setDestination(d)
        setCheckInDate(ci)
        setCheckOutDate(co)
        setGuests(g)
        setPage(isNaN(pg) ? 1 : pg)
        if (isMounted) {
          void handleSearch(isNaN(pg) ? 1 : pg)
        }
        return
      }

      // No search parameters: try last search from localStorage
      try {
        const raw = localStorage.getItem("hotel:lastSearch")
        if (raw && isMounted) {
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
            if (isMounted) {
              void handleSearch(last.page && last.page > 0 ? last.page : 1)
            }
            return
          }
        }
      } catch {
        // ignore storage errors
      }

      // No search parameters and no saved search: load initial data only if we haven't loaded anything yet
      if (results.length === 0 && !loading && !initialData && isMounted) {
        void loadInitialData()
      }
    }

    void initialize()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto p-6 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tìm kiếm khách sạn</h1>
          <p className="text-muted-foreground">Khám phá chỗ ở hoàn hảo cho chuyến đi của bạn</p>
        </div>

        {/* Search Form */}
        <div ref={searchSectionRef}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Tìm kiếm khách sạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Điểm đến</label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setIsDestinationModalOpen(true)}
                >
                  {destination ? (
                    <span className="truncate">{destination}</span>
                  ) : (
                    <span className="text-muted-foreground">Tên thành phố hoặc khách sạn</span>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nhận phòng</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trả phòng</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Khách</label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="2 Khách, 1 Phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-1">1 Khách, 1 Phòng</SelectItem>
                    <SelectItem value="2-1">2 Khách, 1 Phòng</SelectItem>
                    <SelectItem value="3-1">3 Khách, 1 Phòng</SelectItem>
                    <SelectItem value="4-1">4 Khách, 1 Phòng</SelectItem>
                    <SelectItem value="2-2">2 Khách, 2 Phòng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="w-full md:w-auto" onClick={() => handleSearch()} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Đang tìm kiếm..." : "Tìm khách sạn"}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Giá mỗi đêm (VND)</label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={5000000} step={100000} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Xếp hạng sao</label>
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
                            {rating} Sao
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Tiện nghi</label>
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
                  <label className="text-sm font-medium mb-3 block">Loại chỗ ở</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Khách sạn</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Khu nghỉ dưỡng</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Căn hộ</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Biệt thự</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Kết quả tìm kiếm</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {initialData ? `${initialData.totalCount || results.length} khách sạn` : `${results.length} khách sạn`}
                </span>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sắp xếp theo giá" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Giá: Thấp đến cao</SelectItem>
                    <SelectItem value="price-high">Giá: Cao đến thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá khách</SelectItem>
                    <SelectItem value="distance">Khoảng cách</SelectItem>
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
                <div className="text-sm text-muted-foreground">Trang {page}</div>
                <div className="flex gap-2">
                  <Button variant="outline" className="bg-transparent" onClick={prevPage} disabled={loading || page === 1}>
                    Trước
                  </Button>
                  <Button variant="outline" className="bg-transparent" onClick={nextPage} disabled={loading || !hasMore}>
                    Tiếp
                  </Button>
                </div>
              </div>
              {results.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onViewDetails={handleViewDetails}
                  onBookNow={handleBookNow}
                  showPrice={hasSearched}
                  bookingDisabled={!hasSearched}
                  onPromptSearch={scrollToSearch}
                />
              ))}
              {!loading && results.length === 0 && !error && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    {initialData ? "Hiện tại không có khách sạn nào." : "Chưa có khách sạn nào. Hãy thử tìm kiếm ở trên."}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Details Modal */}
      <HotelDetailsModal
        hotelId={selectedHotelId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onBookRoom={handleRoomBooking}
        canBook={hasSearched}
        onPromptSearch={scrollToSearch}
      />

      {/* Destination Selection Modal */}
      <HotelDestinationModal
        isOpen={isDestinationModalOpen}
        onClose={() => setIsDestinationModalOpen(false)}
        onSelect={handleDestinationSelect}
        title="Chọn điểm đến"
        placeholder="Tìm kiếm thành phố hoặc khách sạn..."
      />
    </div>
  )
}
