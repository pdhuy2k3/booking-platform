"use client"

import { useState } from "react"
import Image from "next/image"
import { MapPin, Star, Wifi, Coffee, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/currency"

interface HotelCardProps {
  hotel: {
    id: string
    name: string
    image?: string
    location?: string
    city?: string
    country?: string
    rating?: number
    reviews?: number
    price: number
    originalPrice?: number
    currency?: string
    amenities?: string[]
    description?: string
    starRating?: number
  }
  onViewDetails?: (hotel: any) => void
  onBook?: (hotel: any) => void
  showBookButton?: boolean
  compact?: boolean
  className?: string
}

export const HotelCard = ({
  hotel,
  onViewDetails,
  onBook,
  showBookButton = true,
  compact = false,
  className = "",
}: HotelCardProps) => {
  const [imageError, setImageError] = useState(false)
  const rawRating = hotel.starRating ?? hotel.rating ?? 0
  const displayRating = Math.max(0, Math.min(5, Number(rawRating) || 0))
  const location = hotel.location || `${hotel.city || ""}${hotel.city && hotel.country ? ", " : ""}${hotel.country || ""}`

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase()
    if (lower.includes("wifi")) return <Wifi className="h-4 w-4" />
    if (lower.includes("cafe") || lower.includes("coffee") || lower.includes("nhà hàng")) return <Coffee className="h-4 w-4" />
    if (lower.includes("parking") || lower.includes("xe")) return <Car className="h-4 w-4" />
    return null
  }

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardContent className={`${compact ? 'p-3' : 'p-0'}`}>
        <div className={`flex ${compact ? 'flex-row gap-3' : 'flex-col'}`}>
          {/* Hotel Image */}
          <div className={`relative ${compact ? 'w-32 h-32' : 'w-full h-48'} overflow-hidden ${compact ? 'rounded-md' : 'rounded-t-lg'}`}>
            <Image
              src={imageError ? "/placeholder.svg" : (hotel.image || "/placeholder.svg")}
              alt={hotel.name}
              fill
              className="object-cover"
              onError={() => {
                if (!imageError) {
                  setImageError(true)
                }
              }}
              unoptimized
            />
            {hotel.originalPrice && hotel.originalPrice > hotel.price && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                Giảm giá
              </Badge>
            )}
          </div>

          {/* Hotel Info */}
          <div className={`flex-1 ${compact ? '' : 'p-4'}`}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-lg'} line-clamp-1`}>
                  {hotel.name}
                </h3>
                
                {location && (
                  <div className={`flex items-center gap-1 text-gray-600 ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
                    <MapPin className={`${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    <span className="line-clamp-1">{location}</span>
                  </div>
                )}

                {/* Rating */}
                {displayRating > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${
                            i < displayRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    {hotel.reviews && hotel.reviews > 0 && (
                      <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                        ({hotel.reviews} đánh giá)
                      </span>
                    )}
                  </div>
                )}

                {/* Amenities */}
                {hotel.amenities && hotel.amenities.length > 0 && !compact && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {hotel.amenities.slice(0, 3).map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                      >
                        {getAmenityIcon(amenity)}
                        <span>{amenity}</span>
                      </div>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="text-xs text-gray-600 px-2 py-1">
                        +{hotel.amenities.length - 3} tiện ích
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Price & Actions */}
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  {hotel.originalPrice && hotel.originalPrice > hotel.price && (
                    <p className={`text-gray-400 line-through ${compact ? 'text-xs' : 'text-sm'}`}>
                      {formatCurrency(hotel.originalPrice, hotel.currency || 'VND')}
                    </p>
                  )}
                  <p className={`font-bold text-blue-600 ${compact ? 'text-lg' : 'text-2xl'}`}>
                    {formatCurrency(hotel.price, hotel.currency || 'VND')}
                  </p>
                  <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>/ đêm</p>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  {onViewDetails && (
                    <Button
                      variant="outline"
                      size={compact ? "sm" : "default"}
                      onClick={() => onViewDetails(hotel)}
                      className="w-full"
                    >
                      Chi tiết
                    </Button>
                  )}
                  {showBookButton && onBook && (
                    <Button
                      size={compact ? "sm" : "default"}
                      onClick={() => onBook(hotel)}
                      className="bg-blue-600 hover:bg-blue-700 w-full"
                    >
                      Đặt phòng
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
