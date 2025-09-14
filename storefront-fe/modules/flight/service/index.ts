import { apiFetch } from "@/lib/api"
import type { FlightDetails, FlightSearchParams, FlightSearchResponse } from "../type"

export const flightService = {
  search(params: FlightSearchParams) {
    // Backend expects: origin, destination, departureDate, returnDate?, passengers, seatClass, page, limit
    return apiFetch<FlightSearchResponse>(`/flights/storefront/search`, {
      method: "GET",
      query: params as Record<string, unknown>,
    })
  },
  get(id: string) {
    // Backend: GET /flights/storefront/{flightId}
    return apiFetch<FlightDetails>(`/flights/storefront/${encodeURIComponent(id)}`)
  },
}

export type { FlightSearchParams, FlightSearchResponse, FlightDetails }
