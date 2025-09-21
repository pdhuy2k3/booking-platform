import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { HotelSearchResult } from "../type"
import { formatPrice } from "@/lib/currency"

type Props = {
  hotel: Pick<HotelSearchResult, "hotelId" | "name" | "address" | "pricePerNight" | "currency" | "primaryImage" | "images">
  onSelect?: (id: string) => void
}

export function HotelCardCompact({ hotel, onSelect }: Props) {
  const imageUrl = hotel.primaryImage || hotel.images?.[0] || "/placeholder.svg"

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <Image
              src={imageUrl}
              alt={hotel.name}
              fill
              className="object-cover rounded"
              unoptimized
            />
          </div>
          <div>
            <div className="font-semibold">{hotel.name}</div>
            <div className="text-sm text-muted-foreground">{hotel.address}</div>
          </div>
        </div>
        <button className="text-primary text-sm" onClick={() => onSelect?.(hotel.hotelId.toString())}>
          {formatPrice(hotel.pricePerNight)}/đêm
        </button>
      </CardContent>
    </Card>
  )
}
