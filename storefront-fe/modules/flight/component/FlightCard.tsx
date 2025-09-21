import { Card, CardContent } from "@/components/ui/card"
import type { Flight } from "../type"

type Props = {
  flight: Pick<Flight, "id" | "airline" | "origin" | "destination" | "price" | "currency">
  onSelect?: (id: string) => void
}

export function FlightCard({ flight, onSelect }: Props) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">{flight.airline}</div>
          <div className="text-sm text-muted-foreground">
            {flight.origin} → {flight.destination}
          </div>
        </div>
        <button className="text-primary text-sm" onClick={() => onSelect?.(flight.id)}>
          {flight.currency} {flight.price}
        </button>
      </CardContent>
    </Card>
  )
}

