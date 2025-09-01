"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plane, Building2, Package } from "lucide-react"

interface BookingFlowProps {
  onStartBooking: (type: "flight" | "hotel" | "both") => void
  isVisible: boolean
}

export function BookingFlow({ onStartBooking, isVisible }: BookingFlowProps) {
  if (!isVisible) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onStartBooking("flight")}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Book Flights</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">Find and book flights to your destination with our AI assistant</p>
          <Button className="w-full bg-primary hover:bg-primary/90">Start Flight Search</Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onStartBooking("hotel")}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary/20 transition-colors">
            <Building2 className="w-8 h-8 text-secondary" />
          </div>
          <CardTitle>Book Hotels</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">Discover and reserve the perfect accommodation for your stay</p>
          <Button className="w-full bg-secondary hover:bg-secondary/90">Start Hotel Search</Button>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onStartBooking("both")}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
            <Package className="w-8 h-8 text-accent" />
          </div>
          <CardTitle>Complete Package</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">Plan your entire trip with flights and hotels in one booking</p>
          <Button className="w-full bg-accent hover:bg-accent/90">Plan Complete Trip</Button>
        </CardContent>
      </Card>
    </div>
  )
}
