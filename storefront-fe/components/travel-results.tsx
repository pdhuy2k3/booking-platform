"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Star, Plane, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface TravelResultsProps {
  results: any[]
  onItemSelect: (item: any) => void
}

export function TravelResults({ results, onItemSelect }: TravelResultsProps) {
  const [sortBy, setSortBy] = useState("price")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredResults = results.filter((item) => item.price >= priceRange[0] && item.price <= priceRange[1])

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price":
        return a.price - b.price
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "duration":
        return a.duration?.localeCompare(b.duration || "") || 0
      default:
        return 0
    }
  })

  const totalPages = Math.ceil(sortedResults.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResults = sortedResults.slice(startIndex, startIndex + itemsPerPage)

  const renderFlightCard = (flight: any) => (
    <Card
      key={flight.id}
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onItemSelect(flight)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{flight.airline}</h3>
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

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{flight.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {flight.stops === 0 ? "Direct" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Departs: {new Date(flight.departure).toLocaleString()}</div>
          <Button size="sm" className="bg-secondary hover:bg-secondary/90">
            Select Flight
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderHotelCard = (hotel: any) => (
    <Card
      key={hotel.id}
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onItemSelect(hotel)}
    >
      <CardContent className="p-0">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img src={hotel.image || "/placeholder.svg"} alt={hotel.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{hotel.name}</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">${hotel.price}</div>
              <div className="text-sm text-muted-foreground">per night</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{hotel.location}</span>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(hotel.rating) ? "text-secondary fill-current" : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{hotel.rating}</span>
            <span className="text-sm text-muted-foreground">({hotel.reviews} reviews)</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {hotel.amenities.slice(0, 3).map((amenity: string) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {hotel.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{hotel.amenities.length - 3} more
              </Badge>
            )}
          </div>

          <Button className="w-full bg-secondary hover:bg-secondary/90">Select Hotel</Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Travel Results</h2>
            <p className="text-muted-foreground">{sortedResults.length} options found</p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 p-4 bg-card rounded-lg border">
          <div className="flex items-center space-x-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Price Range</label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={2000}
                min={0}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {paginatedResults.map((item) => (item.type === "flight" ? renderFlightCard(item) : renderHotelCard(item)))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedResults.length)} of{" "}
              {sortedResults.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-8"
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
