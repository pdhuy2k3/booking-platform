"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, Plane, Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookingModalProps {
  item: any
  onClose: () => void
}

export function BookingModal({ item, onClose }: BookingModalProps) {
  const isOpen = !!item

  const renderFlightDetails = (flight: any) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
            <Plane className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{flight.airline}</h3>
            <p className="text-muted-foreground">
              {flight.from} → {flight.to}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">${flight.price}</div>
          <div className="text-muted-foreground">per person</div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Flight Details</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Duration</div>
                <div className="text-sm text-muted-foreground">{flight.duration}</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Stops</div>
                <div className="text-sm text-muted-foreground">
                  {flight.stops === 0 ? "Direct flight" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Schedule</h4>
          <div className="space-y-3">
            <div>
              <div className="font-medium">Departure</div>
              <div className="text-sm text-muted-foreground">{new Date(flight.departure).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-medium">Arrival</div>
              <div className="text-sm text-muted-foreground">{new Date(flight.arrival).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Booking Options</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="font-medium">Economy</div>
            <div className="text-2xl font-bold text-primary">${flight.price}</div>
            <div className="text-sm text-muted-foreground">Standard seat</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-medium">Premium</div>
            <div className="text-2xl font-bold text-primary">${flight.price + 200}</div>
            <div className="text-sm text-muted-foreground">Extra legroom</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="font-medium">Business</div>
            <div className="text-2xl font-bold text-primary">${flight.price + 800}</div>
            <div className="text-sm text-muted-foreground">Premium service</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHotelDetails = (hotel: any) => (
    <div className="space-y-6">
      <div className="aspect-video relative overflow-hidden rounded-lg">
        <Image
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">{hotel.name}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{hotel.location}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">${hotel.price}</div>
          <div className="text-muted-foreground">per night</div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-5 h-5",
                i < Math.floor(hotel.rating) ? "text-secondary fill-current" : "text-muted-foreground",
              )}
            />
          ))}
        </div>
        <span className="font-medium">{hotel.rating}</span>
        <span className="text-muted-foreground">({hotel.reviews} reviews)</span>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Amenities</h4>
        <div className="grid grid-cols-2 gap-4">
          {hotel.amenities.map((amenity: string) => (
            <div key={amenity} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Room Options</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Standard Room</div>
              <div className="text-sm text-muted-foreground">1 Queen bed • 25 m²</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">${hotel.price}</div>
              <div className="text-sm text-muted-foreground">per night</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Deluxe Room</div>
              <div className="text-sm text-muted-foreground">1 King bed • 35 m²</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">${hotel.price + 50}</div>
              <div className="text-sm text-muted-foreground">per night</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item?.type === "flight" ? "Flight Details" : "Hotel Details"}</DialogTitle>
        </DialogHeader>

        <div className="mt-6">{item?.type === "flight" ? renderFlightDetails(item) : renderHotelDetails(item)}</div>

        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-secondary hover:bg-secondary/90">Book Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
