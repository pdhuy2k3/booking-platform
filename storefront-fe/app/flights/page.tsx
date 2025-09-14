"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plane, Clock, Star, MapPin, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { flightService } from "@/modules/flight/service"
import type { FareClass } from "@/modules/flight/type"
import { format } from "date-fns"

export default function FlightsPage() {
  const router = useRouter()
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [durationRange, setDurationRange] = useState([0, 24])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([])

  // Search form state
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [departDate, setDepartDate] = useState("") // YYYY-MM-DD
  const [returnDate, setReturnDate] = useState("") // YYYY-MM-DD
  const [passengers, setPassengers] = useState("1")
  const [seatClass, setSeatClass] = useState<FareClass>("ECONOMY")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [hasMore, setHasMore] = useState(false)

  const airlines = ["Delta", "American Airlines", "United", "Southwest", "JetBlue", "Alaska Airlines"]

  const [flightResults, setFlightResults] = useState<any[]>([])

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) => (prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]))
  }

  const handleViewDetails = (flight: any) => {
    router.push(`/flights/${encodeURIComponent(flight.id)}`)
  }

  async function handleSearch() {
    setLoading(true)
    setError(null)
    try {
      const res = await flightService.search({
        origin,
        destination,
        departureDate: departDate,
        returnDate: returnDate || undefined,
        passengers: parseInt(passengers || "1", 10) || 1,
        seatClass,
        page,
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
    } catch (e: any) {
      setError(e?.message || "Failed to load flights")
    } finally {
      setLoading(false)
    }
  }

  function nextPage() {
    if (hasMore) {
      setPage((p) => p + 1)
      // Trigger search with updated page
      void handleSearch()
    }
  }

  function prevPage() {
    if (page > 1) {
      setPage((p) => p - 1)
      void handleSearch()
    }
  }

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
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Departure city" className="pl-10" value={origin} onChange={(e) => setOrigin(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Destination city" className="pl-10" value={destination} onChange={(e) => setDestination(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Departure</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={departDate} onChange={(e) => setDepartDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Return</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-10" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
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
                <Button className="w-full" onClick={handleSearch} disabled={loading}>
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
                  <label className="text-sm font-medium mb-3 block">Price Range</label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={2000} step={50} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Flight Duration (hours)</label>
                  <Slider value={durationRange} onValueChange={setDurationRange} max={24} step={1} className="mb-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{durationRange[0]}h</span>
                    <span>{durationRange[1]}h</span>
                  </div>
                </div>

                {/* Airlines */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Airlines</label>
                  <div className="space-y-2">
                    {airlines.map((airline) => (
                      <label key={airline} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAirlines.includes(airline)}
                          onChange={() => toggleAirline(airline)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{airline}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stops */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Stops</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">Non-stop</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">1 Stop</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-sm">2+ Stops</span>
                    </label>
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
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by Price" />
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
                  <Button variant="outline" className="bg-transparent" onClick={prevPage} disabled={loading || page === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" className="bg-transparent" onClick={nextPage} disabled={loading || !hasMore}>
                    Next
                  </Button>
                </div>
              </div>
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
                        <div className="text-2xl font-bold text-primary">${flight.price}</div>
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
