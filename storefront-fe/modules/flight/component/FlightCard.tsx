import { Card, CardContent } from "@/components/ui/card"
import type { Flight } from "../type"

type Props = {
  flight: Pick<Flight, "id" | "airline" | "origin" | "destination" | "price" | "currency" | "airlineLogo"> // Add airlineLogo
  onSelect?: (id: string) => void
}

export function FlightCard({ flight, onSelect }: Props) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {flight.airlineLogo && (
            <div className="relative w-8 h-8">
              <Image 
                src={flight.airlineLogo} 
                alt={flight.airline} 
                fill 
                className="object-contain rounded" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/airplane-generic.png";
                }}
              />
            </div>
          )}
          <div>
            <div className="font-semibold">{flight.airline}</div>
            <div className="text-sm text-muted-foreground">
              {flight.origin} → {flight.destination}
            </div>
          </div>
        </div>
        <button className="text-primary text-sm" onClick={() => onSelect?.(flight.id)}>
          {flight.currency} {flight.price}
        </button>
      </CardContent>
    </Card>
  )
}

