import { flightService } from "@/modules/flight/service"
import type { FlightDetails } from "@/modules/flight/type"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { format } from "date-fns"

interface Props {
  params: { id: string }
}

export default async function FlightDetailsPage({ params }: Props) {
  const id = params.id
  try {
    const f: FlightDetails = await flightService.get(id)
    return (
      <div className="w-full h-full">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Flight #{f.flightId} — {f.airline}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">{f.flightNumber}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Origin</div>
                  <div className="text-lg font-semibold">{f.origin}</div>
                  <div className="text-sm">Depart: {f.departureTime}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Destination</div>
                  <div className="text-lg font-semibold">{f.destination}</div>
                  <div className="text-sm">Arrive: {f.arrivalTime}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Stops</div>
                  <div>0</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cabin</div>
                  <div>{f.seatClass ?? "ECONOMY"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="font-semibold">{f.currency} {f.price}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (e) {
    return notFound()
  }
}
