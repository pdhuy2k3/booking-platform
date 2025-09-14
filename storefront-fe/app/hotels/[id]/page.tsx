import { hotelService } from "@/modules/hotel/service"
import type { HotelDetails } from "@/modules/hotel/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

interface Props {
  params: { id: string }
}

export default async function HotelDetailsPage({ params }: Props) {
  try {
    const h: HotelDetails = await hotelService.get(params.id)
    return (
      <div className="w-full h-full">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>{h.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">{h.address}, {h.city}, {h.country}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Star Rating</div>
                  <div>{h.starRating}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Available Rooms</div>
                  <div>{h.availableRooms}</div>
                </div>
              </div>
              <div className="text-sm">{h.description}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch {
    return notFound()
  }
}

