import { apiFetch } from "@/lib/api"
import type { HotelDetails, HotelSearchParams, HotelSearchResponse } from "../type"

export const hotelService = {
  search(params: HotelSearchParams) {
    return apiFetch<HotelSearchResponse>(`/hotels/storefront/search`, {
      method: "GET",
      query: params as Record<string, unknown>,
    })
  },
  get(id: string | number) {
    return apiFetch<HotelDetails>(`/hotels/storefront/${encodeURIComponent(String(id))}`)
  },
}

export type { HotelSearchParams, HotelSearchResponse, HotelDetails }
