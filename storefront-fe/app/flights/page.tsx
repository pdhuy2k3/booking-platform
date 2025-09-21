"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, Plane, Clock, Star, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { flightService } from "@/modules/flight/service"
import type { FareClass, InitialFlightData } from "@/modules/flight/type"
import { format } from "date-fns"
import { FlightCardSkeleton } from "@/modules/flight/component/FlightCardSkeleton"
import { CityComboBox } from "@/modules/flight/component/CityComboBox"
import FlightDetailsModal from "@/modules/flight/component/FlightDetailsModal"
import { FlightDestinationModal } from "@/modules/flight/component/FlightDestinationModal"
import { formatPrice } from "@/lib/currency"
import { useBooking } from "@/contexts/booking-context"

interface City {
  code: string;
  name: string;
  type: string;
}

export default function FlightsPage() {
  const router = useRouter()
  const {
    resetBooking,
    setBookingType,
    updateBookingData,
    setSelectedFlight,
    setStep,
  } = useBooking()
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [durationRange, setDurationRange] = useState([0, 24])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("departure")
  const [hasSearched, setHasSearched] = useState(false)

  // Search form state
  const searchParams = useSearchParams()
  const [origin, setOrigin] = useState<City | null>(null)
  const [destination, setDestination] = useState<City | null>(null)
  const [departDate, setDepartDate] = useState("") // YYYY-MM-DD
  const [returnDate, setReturnDate] = useState("") // YYYY-MM-DD
  const [passengers, setPassengers] = useState("1")
  const [seatClass, setSeatClass] = useState<FareClass>("ECONOMY")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [hasMore, setHasMore] = useState(false)

  const [flightResults, setFlightResults] = useState<any[]>([])
  const [initialData, setInitialData] = useState<InitialFlightData | null>(null)
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false)
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false)
  const searchSectionRef = useRef<HTMLDivElement | null>(null)

  // Defaults for initial auto-search (can be overridden via env)
  const DEFAULT_ORIGIN = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "HAN"
  const DEFAULT_DESTINATION = process.env.NEXT_PUBLIC_DEFAULT_DESTINATION || "SGN"
  const DEFAULT_DEPARTURE_DAYS_AHEAD = parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_DAYS_AHEAD || "7",
    10,
  )

  const resolveDateTime = (rawDateTime?: string | null, date?: string, time?: string) => {
    if (rawDateTime) {
      const parsed = new Date(rawDateTime)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }
    }

    if (date && time) {
      const trimmed = time.trim()
      const normalized = trimmed.length === 5 ? `${trimmed}:00` : trimmed
      const composed = `${date}T${normalized}`
      const parsed = new Date(composed)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }
    }

    return undefined
  }

  const getDisplayTime = (iso?: string, fallback?: string) => {
    if (iso) {
      const parsed = new Date(iso)
      if (!Number.isNaN(parsed.getTime())) {
        return format(parsed, 'HH:mm')
      }
    }
    return fallback || '--:--'
  }

  const mapFlightToUi = (flight: any, searchDate?: string) => {
    const departureDateTime = resolveDateTime(flight.departureDateTime, searchDate, flight.departureTime)
    const arrivalDateTime = resolveDateTime(flight.arrivalDateTime, searchDate, flight.arrivalTime)

    return {
      id: flight.flightId,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: departureDateTime || flight.departureTime,
      arrivalTime: arrivalDateTime || flight.arrivalTime,
      departureDateTime,
      arrivalDateTime,
      currency: flight.currency || 'VND',
      seatClass: flight.seatClass || 'ECONOMY',
      logo: flight.airlineLogo || '/airplane-generic.png',
      departure: {
        time: getDisplayTime(departureDateTime, flight.departureTime),
        airport: flight.origin,
        city: flight.origin,
      },
      arrival: {
        time: getDisplayTime(arrivalDateTime, flight.arrivalTime),
        airport: flight.destination,
        city: flight.destination,
      },
      duration: flight.duration || '',
      stops: flight.stops && flight.stops > 0 ? `${flight.stops} stop${flight.stops === 1 ? '' : 's'}` : 'Non-stop',
      price: flight.price,
      class: flight.seatClass || 'ECONOMY',
      rating: 4.5,
      raw: flight,
    }
  }
  const handleViewDetails = (flight: any) => {
    setSelectedFlightId(flight.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFlightId(null)
  }

  const handleOriginSelect = (city: City) => {
    setOrigin(city)
  }

  const handleDestinationSelect = (city: City) => {
    setDestination(city)
  }

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleBookFlight = (flight: any) => {
    if (!hasSearched) {
      scrollToSearch()
      return
    }

    const flightData = flight?.raw || flight
    const flightId = flightData?.flightId || flight?.id

    if (!flightData || !flightId) {
      console.error('Unable to start booking flow: missing flight details')
      return
    }

    const departureDateTime = resolveDateTime(flightData.departureDateTime, departDate, flightData.departureTime)
    const arrivalDateTime = resolveDateTime(flightData.arrivalDateTime, departDate, flightData.arrivalTime)
    const airlineLogo = flight?.logo || flightData.airlineLogo

    resetBooking()
    setBookingType('flight')
    setSelectedFlight({
      id: flightId,
      flightNumber: flightData.flightNumber,
      airline: flightData.airline,
      origin: flightData.origin,
      destination: flightData.destination,
      departureTime: departureDateTime || flightData.departureTime,
      arrivalTime: arrivalDateTime || flightData.arrivalTime,
      duration: flightData.duration,
      price: flightData.price,
      currency: flightData.currency || 'VND',
      seatClass: flightData.seatClass,
      logo: airlineLogo,
    })
    updateBookingData({
      bookingType: 'FLIGHT',
      totalAmount: 0,
      currency: flightData.currency || 'VND',
      productDetails: undefined,
    })
    setStep('passengers')
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
      const res = await flightService.search({
        origin: "",
        destination: "",
        departureDate: "",
        returnDate: undefined,
        passengers: 1,
        seatClass: "ECONOMY",
        sortBy: "departure",
        page: 1,
        limit,
      })
      setInitialData(res as InitialFlightData)
      
      // Convert initial flights to UI format
      const ui = (res.flights || []).map((f: any) => mapFlightToUi(f))
      setFlightResults(ui)
      setHasMore(Boolean(res.hasMore))
    } catch (e: any) {
      setError(e?.message || "Failed to load initial flight data")
    } finally {
      setLoading(false)
      isLoadingInitialData.current = false
    }
  }

  function pushQuery(nextPage: number) {
    const params = new URLSearchParams()
    if (origin?.name) params.set("origin", origin.name)
    if (destination?.name) params.set("destination", destination.name)
    if (departDate) params.set("departureDate", departDate)
    if (returnDate) params.set("returnDate", returnDate)
    if (passengers) params.set("passengers", passengers)
    if (seatClass) params.set("seatClass", seatClass)
    params.set("page", String(nextPage))
    params.set("limit", String(limit))
    router.replace(`/flights?${params.toString()}`)
  }

  async function handleSearch(nextPage?: number) {
    if (!origin || !destination || !departDate) {
      setError('Vui lòng chọn điểm đi, điểm đến và ngày khởi hành để xem giá')
      scrollToSearch()
      return
    }

    if (origin.code === destination.code) {
      setError('Điểm đi và điểm đến không được trùng nhau')
      scrollToSearch()
      return
    }

    const passengerCount = parseInt(passengers || '0', 10)
    if (!Number.isFinite(passengerCount) || passengerCount <= 0) {
      setError('Vui lòng chọn số lượng hành khách hợp lệ')
      scrollToSearch()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const usePage = nextPage ?? page
      const res = await flightService.search({
        origin: origin?.name || "",
        destination: destination?.name || "",
        departureDate: departDate,
        returnDate: returnDate || undefined,
        passengers: parseInt(passengers || "1", 10) || 1,
        seatClass,
        sortBy,
        page: usePage,
        limit,
      })
      const ui = (res.flights || []).map((f: any) => mapFlightToUi(f, departDate))
      setFlightResults(ui)
      setHasMore(Boolean(res.hasMore))
      setPage(usePage)
      setHasSearched(true)
      pushQuery(usePage)
      // Persist last successful search to restore on first load
      try {
        localStorage.setItem(
          "flight:lastSearch",
          JSON.stringify({
            origin: origin?.name,
            destination: destination?.name,
            departDate,
            returnDate,
            passengers,
            seatClass,
            page: usePage,
            limit,
          }),
        )
      } catch {
        // ignore storage errors
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load flights")
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

  // Initialize from query and load initial data
  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (!searchParams || !isMounted) return

      const o = searchParams.get("origin") || ""
      const d = searchParams.get("destination") || ""
      const dep = searchParams.get("departureDate") || ""
      const ret = searchParams.get("returnDate") || ""
      const pas = searchParams.get("passengers") || "1"
      const cls = (searchParams.get("seatClass") as FareClass) || "ECONOMY"
      const pg = parseInt(searchParams.get("page") || "1", 10)

      // Check if we have search parameters
      const hasSearchParams = Boolean(o && d && dep)

      if (hasSearchParams) {
        setOrigin({ code: o, name: o, type: "City" })
        setDestination({ code: d, name: d, type: "City" })
        setDepartDate(dep)
        setReturnDate(ret)
        setPassengers(pas)
        setSeatClass(cls)
        setPage(isNaN(pg) ? 1 : pg)
        if (isMounted) {
          void handleSearch(isNaN(pg) ? 1 : pg)
        }
        return
      }

      // No search parameters: try last search from localStorage
      try {
        const raw = localStorage.getItem("flight:lastSearch")
        if (raw && isMounted) {
          const last = JSON.parse(raw) as {
            origin: string
            destination: string
            departDate: string
            returnDate?: string
            passengers: string
            seatClass: FareClass
            page?: number
          }
          if (last?.origin && last?.destination && last?.departDate) {
            setOrigin({ code: last.origin, name: last.origin, type: "City" })
            setDestination({ code: last.destination, name: last.destination, type: "City" })
            setDepartDate(last.departDate)
            setReturnDate(last.returnDate || "")
            setPassengers(last.passengers || "1")
            setSeatClass(last.seatClass || "ECONOMY")
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

      if (flightResults.length === 0 && !loading && !initialData && isMounted) {
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Tìm kiếm chuyến bay</h1>
          <p className="text-muted-foreground">Tìm chuyến bay giá tốt nhất cho hành trình của bạn</p>
        </div>

        {/* Search Form */}
        <div ref={searchSectionRef}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Tìm kiếm chuyến bay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Đi từ</label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setIsOriginModalOpen(true)}
                >
                  {origin ? (
                    <span className="truncate">
                      {origin.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Chọn thành phố khởi hành...</span>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Đến</label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setIsDestinationModalOpen(true)}
                >
                  {destination ? (
                    <span className="truncate">
                      {destination.name}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Chọn thành phố đến...</span>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày đi</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-10" 
                    value={departDate} 
                    onChange={(e) => setDepartDate(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày về</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-10" 
                    value={returnDate} 
                    onChange={(e) => setReturnDate(e.target.value)} 
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hành khách</label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="1 Người lớn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Người lớn</SelectItem>
                    <SelectItem value="2">2 Người lớn</SelectItem>
                    <SelectItem value="3">3 Người lớn</SelectItem>
                    <SelectItem value="4">4 Người lớn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hạng ghế</label>
                <Select value={seatClass} onValueChange={(v) => setSeatClass(v as FareClass)}>
                  <SelectTrigger>
                    <SelectValue placeholder="PHỔ THÔNG" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECONOMY">Phổ thông</SelectItem>
                    <SelectItem value="PREMIUM_ECONOMY">Phổ thông đặc biệt</SelectItem>
                    <SelectItem value="BUSINESS">Thương gia</SelectItem>
                    <SelectItem value="FIRST">Hạng nhất</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={() => handleSearch()} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Đang tìm kiếm..." : "Tìm chuyến bay"}
                </Button>
              </div>
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
                  <label className="text-sm font-medium mb-3 block">Khoảng giá (VND)</label>
                  <Slider 
                    value={priceRange} 
                    onValueChange={setPriceRange} 
                    max={5000000} 
                    step={100000} 
                    className="mb-2" 
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Thời gian bay (giờ)</label>
                  <Slider 
                    value={durationRange} 
                    onValueChange={setDurationRange} 
                    max={24} 
                    step={1} 
                    className="mb-2" 
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{durationRange[0]}h</span>
                    <span>{durationRange[1]}h</span>
                  </div>
                </div>

                {/* Airlines */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Hãng hàng không</label>
                  <Select onValueChange={(value) => {
                    if (!selectedAirlines.includes(value)) {
                      setSelectedAirlines([...selectedAirlines, value])
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hãng hàng không..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vietnam-airlines">Vietnam Airlines</SelectItem>
                      <SelectItem value="vietjet">VietJet Air</SelectItem>
                      <SelectItem value="bamboo">Bamboo Airways</SelectItem>
                      <SelectItem value="jetstar">Jetstar Pacific</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedAirlines.map((airline) => (
                      <div 
                        key={airline} 
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center"
                      >
                        {airline}
                        <button 
                          className="ml-1"
                          onClick={() => setSelectedAirlines(selectedAirlines.filter(a => a !== airline))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
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
                  {initialData ? `${initialData.totalCount || flightResults.length} chuyến bay` : `${flightResults.length} chuyến bay`}
                </span>
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value)
                  // Trigger search with new sort
                  setTimeout(() => void handleSearch(), 0)
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sắp xếp theo giờ đi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Giá: Thấp đến cao</SelectItem>
                    <SelectItem value="price-high">Giá: Cao đến thấp</SelectItem>
                    <SelectItem value="duration">Thời gian bay</SelectItem>
                    <SelectItem value="departure">Giờ khởi hành</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Trang {page}</div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="bg-transparent" 
                    onClick={prevPage} 
                    disabled={loading || page === 1}
                  >
                    Trước
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-transparent" 
                    onClick={nextPage} 
                    disabled={loading || !hasMore}
                  >
                    Tiếp
                  </Button>
                </div>
              </div>
              {loading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <FlightCardSkeleton key={i} />
                  ))}
                </div>
              )}
              {error && (
                <Card>
                  <CardContent className="p-4 text-sm text-destructive-foreground">{error}</CardContent>
                </Card>
              )}
              {flightResults.map((flight) => (
                <Card key={flight.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={flight.logo || "/placeholder.svg"}
                            alt={flight.airline}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                            unoptimized
                          />
                          <div>
                            <div className="font-medium">{flight.airline}</div>
                            <div className="text-sm text-muted-foreground">{flight.class}</div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-8">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{flight.departure.time}</div>
                            <div className="text-sm text-muted-foreground">{flight.departure.airport}</div>
                            <div className="text-xs text-muted-foreground">{flight.departure.city}</div>
                          </div>

                          <div className="flex flex-col items-center">
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{flight.duration}</span>
                            </div>
                            <div className="w-16 h-px bg-border my-2"></div>
                            <div className="text-xs text-muted-foreground">{flight.stops}</div>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-semibold">{flight.arrival.time}</div>
                            <div className="text-sm text-muted-foreground">{flight.arrival.airport}</div>
                            <div className="text-xs text-muted-foreground">{flight.arrival.city}</div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        {hasSearched ? (
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-primary">{formatPrice(flight.price)}</div>
                            <div className="text-sm text-muted-foreground">Giá mỗi hành khách</div>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full" onClick={scrollToSearch}>
                            Nhập thông tin để xem giá
                          </Button>
                        )}
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{flight.rating}</span>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full" disabled={!hasSearched} onClick={() => handleBookFlight(flight)}>
                            Đặt ngay
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => handleViewDetails(flight)}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!loading && flightResults.length === 0 && !error && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">
                    {initialData ? "Hiện tại không có chuyến bay nào." : "Chưa có chuyến bay nào. Hãy thử tìm kiếm ở trên."}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flight Details Modal */}
      <FlightDetailsModal
        flightId={selectedFlightId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Origin Selection Modal */}
      <FlightDestinationModal
        isOpen={isOriginModalOpen}
        onClose={() => setIsOriginModalOpen(false)}
        onSelect={handleOriginSelect}
        title="Chọn điểm khởi hành"
        placeholder="Tìm kiếm thành phố khởi hành..."
      />

      {/* Destination Selection Modal */}
      <FlightDestinationModal
        isOpen={isDestinationModalOpen}
        onClose={() => setIsDestinationModalOpen(false)}
        onSelect={handleDestinationSelect}
        title="Chọn điểm đến"
        placeholder="Tìm kiếm thành phố đến..."
      />
    </div>
  )
}

