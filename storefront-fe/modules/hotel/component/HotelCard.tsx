import { Card, CardContent } from "@/components/ui/card"
import type { HotelSearchResult } from "../type"

type Props = {
  hotel: Pick<HotelSearchResult, "id" | "name" | "address" | "minPrice" | "currency">
  onSelect?: (id: string) => void
}

export function HotelCard({ hotel, onSelect }: Props) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">{hotel.name}</div>
          <div className="text-sm text-muted-foreground">{hotel.address}</div>
        </div>
        <button className="text-primary text-sm" onClick={() => onSelect?.(hotel.id.toString())}>
          {hotel.currency} {hotel.minPrice}/night
        </button>
      </CardContent>
    </Card>
  )
}

