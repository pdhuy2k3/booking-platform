import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star } from "lucide-react"
import type { HotelSearchResult } from "../type"
import { formatPrice } from "@/lib/currency"

type Props = {
  hotel: {
    id: string
    name: string
    image: string
    location: string
    rating: number
    reviews: number
    price: number
    originalPrice: number
    amenities: string[]
    description: string
  }
  onViewDetails?: (hotel: any) => void
  onBookNow?: (hotel: any) => void
  showPrice?: boolean
  bookingDisabled?: boolean
  onPromptSearch?: () => void
}

export function HotelCard({ hotel, onViewDetails, onBookNow, showPrice = true, bookingDisabled = false, onPromptSearch }: Props) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <div className="relative w-full h-48 md:h-full">
              <Image
                src={hotel.image || "/placeholder.svg"}
                alt={hotel.name}
                fill
                className="object-cover rounded-l-lg"
                unoptimized
              />
            </div>
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
                  <span className="text-sm text-muted-foreground">({hotel.reviews} đánh giá)</span>
                </div>
              </div>
              <div className="text-right">
                {showPrice ? (
                  <>
                    <div className="text-sm text-muted-foreground line-through">{formatPrice(hotel.originalPrice)}</div>
                    <div className="text-2xl font-bold text-primary">{formatPrice(hotel.price)}</div>
                    <div className="text-sm text-muted-foreground">mỗi đêm</div>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={onPromptSearch}>
                    Nhập thông tin để xem giá
                  </Button>
                )}
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{hotel.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {hotel.amenities.map((amenity: string) => (
                <Badge key={amenity} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                className="flex-1"
                disabled={bookingDisabled}
                onClick={() => {
                  if (bookingDisabled) {
                    onPromptSearch?.()
                    return
                  }
                  onBookNow?.(hotel)
                }}
              >
                Đặt ngay
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onViewDetails?.(hotel)}>
                Xem chi tiết
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
