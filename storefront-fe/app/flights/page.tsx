"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, Plane, Clock, Star, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { flightService } from "@/modules/flight/service"
import type { FareClass } from "@/modules/flight/type"
import { format } from "date-fns"
import { FlightCardSkeleton } from "@/modules/flight/component/FlightCardSkeleton"
import { CityComboBox } from "@/modules/flight/component/CityComboBox"

interface City {
  code: string;
  name: string;
  type: string;
}

export default function FlightsPage() {
  const router = useRouter()
  const [priceRange, setPriceRange] = useState([0, 5000000])
  const [durationRange, setDurationRange] = useState([0, 24])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("departure")

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

  // Defaults for initial auto-search (can be overridden via env)
  const DEFAULT_ORIGIN = process.env.NEXT_PUBLIC_DEFAULT_ORIGIN || "HAN"
  const DEFAULT_DESTINATION = process.env.NEXT_PUBLIC_DEFAULT_DESTINATION || "SGN"
  const DEFAULT_DEPARTURE_DAYS_AHEAD = parseInt(
    process.env.NEXT_PUBLIC_DEFAULT_DEPARTURE_DAYS_AHEAD || "7",
    10,
  )

  const handleViewDetails = (flight: any) => {
    router.push(`/flights/${encodeURIComponent(flight.id)}`)
  }

  function pushQuery(nextPage: number) {
    const params = new URLSearchParams()
    if (origin?.code) params.set("origin", origin.code)
    if (destination?.code) params.set("destination", destination.code)
    if (departDate) params.set("departureDate", departDate)
    if (returnDate) params.set("returnDate", returnDate)
    if (passengers) params.set("passengers", passengers)
    if (seatClass) params.set("seatClass", seatClass)
    params.set("page", String(nextPage))
    params.set("limit", String(limit))
    router.replace(`/flights?${params.toString()}`)
  }

  async function handleSearch(nextPage?: number) {
    setLoading(true)
    setError(null)
    try {
      const usePage = nextPage ?? page
      const res = await flightService.search({
        origin: origin?.code || "",
        destination: destination?.code || "",
        departureDate: departDate,
        returnDate: returnDate || undefined,
        passengers: parseInt(passengers || "1", 10) || 1,
        seatClass,
        sortBy,
        page: usePage,
        limit,
      })
      const ui = (res.flights || []).map((f) => ({
        id: f.flightId,
        airline: f.airline,
        logo: "/airplane-generic.png",
        departure: {
          time: f.departureTime || "--:--",
          airport: f.origin,
          city: f.origin,
        },
        arrival: {
          time: f.arrivalTime || "--:--",
          airport: f.destination,
          city: f.destination,
        },
        duration: f.duration || "",
        stops: "Non-stop",
        price: f.price,
        class: f.seatClass || "ECONOMY",
        rating: 4.5,
      }))
      setFlightResults(ui)
      setHasMore(Boolean(res.hasMore))
      setPage(usePage)
      pushQuery(usePage)
      // Persist last successful search to restore on first load
      try {
        localStorage.setItem(
          "flight:lastSearch",
          JSON.stringify({
            origin: origin?.code,
            destination: destination?.code,
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

  // Initialize from query
  useEffect(() => {
    if (!searchParams) return
    const o = searchParams.get("origin") || ""
    const d = searchParams.get("destination") || ""
    const dep = searchParams.get("departureDate") || ""
    const ret = searchParams.get("returnDate") || ""
    const pas = searchParams.get("passengers") || "1"
    const cls = (searchParams.get("seatClass") as FareClass) || "ECONOMY"
    const pg = parseInt(searchParams.get("page") || "1", 10)
    // For now, we'll just set the codes, in a real app we'd fetch the full city objects
    if (o) setOrigin({ code: o, name: o, type: "City" })
    if (d) setDestination({ code: d, name: d, type: "City" })
    setDepartDate(dep)
    setReturnDate(ret)
    setPassengers(pas)
    setSeatClass(cls)
    setPage(isNaN(pg) ? 1 : pg)
    if (o && d && dep) {
      void handleSearch(isNaN(pg) ? 1 : pg)
      return
    }

    // No query provided: try last search from localStorage
    try {
      const raw = localStorage.getItem("flight:lastSearch")
      if (raw) {
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
          // Defer to ensure state is applied
          setTimeout(() => void handleSearch(last.page && last.page > 0 ? last.page : 1), 0)
          return
        }
      }
    } catch {
      // ignore storage errors
    }

    // Fallback to sensible defaults and auto-search
    const today = new Date()
    const depart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + DEFAULT_DEPARTURE_DAYS_AHEAD)
    const depStr = format(depart, "yyyy-MM-dd")
    setOrigin({ code: DEFAULT_ORIGIN, name: DEFAULT_ORIGIN, type: "City" })
    setDestination({ code: DEFAULT_DESTINATION, name: DEFAULT_DESTINATION, type: "City" })
    setDepartDate(depStr)
    setReturnDate("")
    setPassengers("1")
    setSeatClass("ECONOMY")
    setPage(1)
    setTimeout(() => void handleSearch(1), 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search Flights</h1>
          <p className="text-muted-foreground">Find the perfect flight for your journey</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Flight Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <CityComboBox
                  value={origin}
                  onValueChange={setOrigin}
                  placeholder="Select departure city..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <CityComboBox
                  value={destination}
                  onValueChange={setDestination}
                  placeholder="Select destination city..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Departure</label>
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
                <label className="text-sm font-medium">Return</label>
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
                <label className="text-sm font-medium">Passengers</label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="1 Adult" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Adult</SelectItem>
                    <SelectItem value="2">2 Adults</SelectItem>
                    <SelectItem value="3">3 Adults</SelectItem>
                    <SelectItem value="4">4 Adults</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={seatClass} onValueChange={(v) => setSeatClass(v as FareClass)}>
                  <SelectTrigger>
                    <SelectValue placeholder="ECONOMY" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECONOMY">Economy</SelectItem>
                    <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="FIRST">First Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={() => handleSearch()} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Searching..." : "Search Flights"}
                </Button>
              </div>
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
                  <label className="text-sm font-medium mb-3 block">Price Range (VND)</label>
                  <Slider 
                    value={priceRange} 
                    onValueChange={setPriceRange} 
                    max={5000000} 
                    step={100000} 
                    className="mb-2" 
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0].toLocaleString()}</span>
                    <span>{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Flight Duration (hours)</label>
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
                  <label className="text-sm font-medium mb-3 block">Airlines</label>
                  <Select onValueChange={(value) => {
                    if (!selectedAirlines.includes(value)) {
                      setSelectedAirlines([...selectedAirlines, value])
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select airlines..." />
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
              <h2 className="text-xl font-semibold">Flight Results</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">{flightResults.length} flights found</span>
                <Select value={sortBy} onValueChange={(value) => {
                  setSortBy(value)
                  // Trigger search with new sort
                  setTimeout(() => void handleSearch(), 0)
                }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by Departure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Page {page}</div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="bg-transparent" 
                    onClick={prevPage} 
                    disabled={loading || page === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-transparent" 
                    onClick={nextPage} 
                    disabled={loading || !hasMore}
                  >
                    Next
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
                          <img src={flight.logo || "/placeholder.svg"} alt={flight.airline} className="w-8 h-8" />
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
                        <div className="text-2xl font-bold text-primary">
                          {flight.price.toLocaleString()} VND
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{flight.rating}</span>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full">Book Now</Button>
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => handleViewDetails(flight)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!loading && flightResults.length === 0 && !error && (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">No flights yet. Try a search above.</CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}