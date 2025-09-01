"use client"

import { X, Plane, Clock, Star, Wifi, Coffee, Tv, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FlightDetailsModalProps {
  flight: {
    id: number
    airline: string
    logo: string
    departure: { time: string; airport: string; city: string }
    arrival: { time: string; airport: string; city: string }
    duration: string
    stops: string
    price: number
    class: string
    rating: number
  }
  isOpen: boolean
  onClose: () => void
}

export default function FlightDetailsModal({ flight, isOpen, onClose }: FlightDetailsModalProps) {
  if (!isOpen) return null

  const amenities = [
    { icon: Wifi, label: "Wi-Fi" },
    { icon: Coffee, label: "Refreshments" },
    { icon: Tv, label: "Entertainment" },
    { icon: Utensils, label: "Meal Service" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[90%] h-[90%] bg-background rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <img src={flight.logo || "/placeholder.svg"} alt={flight.airline} className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">{flight.airline}</h2>
              <p className="text-muted-foreground">{flight.class} Class</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10">
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100%-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Flight Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Flight Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{flight.departure.time}</div>
                      <div className="text-lg font-medium text-muted-foreground">{flight.departure.airport}</div>
                      <div className="text-sm text-muted-foreground">{flight.departure.city}</div>
                    </div>

                    <div className="flex flex-col items-center px-8">
                      <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">{flight.duration}</span>
                      </div>
                      <div className="w-32 h-px bg-border relative">
                        <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary bg-background" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">{flight.stops}</div>
                    </div>

                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{flight.arrival.time}</div>
                      <div className="text-lg font-medium text-muted-foreground">{flight.arrival.airport}</div>
                      <div className="text-sm text-muted-foreground">{flight.arrival.city}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Flight Number:</span>
                      <span className="ml-2 font-medium">DL 123</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Aircraft:</span>
                      <span className="ml-2 font-medium">Boeing 777-300ER</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Baggage:</span>
                      <span className="ml-2 font-medium">1 checked bag included</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center ml-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1 font-medium">{flight.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Amenities & Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                        <amenity.icon className="h-8 w-8 text-primary mb-2" />
                        <span className="text-sm font-medium">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fare Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Fare Rules & Policies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Free cancellation up to 24 hours before departure. Cancellation fees may apply after this period.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Change Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Changes allowed with a fee of $200 plus fare difference. Same-day changes available for $75.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Baggage Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      1 carry-on bag and 1 personal item included. First checked bag included for this fare.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-0">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">${flight.price}</div>
                    <div className="text-sm text-muted-foreground">per person</div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Fare:</span>
                      <span>${flight.price - 150}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxes & Fees:</span>
                      <span>$150</span>
                    </div>
                    <div className="border-t border-border pt-2 flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${flight.price}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-full justify-center">
                      {flight.class} Class
                    </Badge>
                    <Badge variant="outline" className="w-full justify-center">
                      Refundable
                    </Badge>
                  </div>

                  <Button className="w-full" size="lg">
                    Book This Flight
                  </Button>

                  <div className="text-xs text-muted-foreground text-center">
                    Price may change based on availability
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
