import { Card, CardContent } from "@/components/ui/card"
import type { BookingItem } from "../type"

type Props = {
  items: BookingItem[]
  currency?: string
}

export function BookingSummary({ items, currency = items[0]?.currency || "USD" }: Props) {
  const total = items.reduce((sum, it) => sum + (it.price || 0), 0)
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Booking Summary</div>
        <ul className="space-y-1 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between">
              <span>{it.type} — {it.referenceId}</span>
              <span>{it.currency} {it.price}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>{currency} {total}</span>
        </div>
      </CardContent>
    </Card>
  )
}

