
import type { HotelDetails, HotelSearchParams, HotelSearchResponse } from "../type"
import { apiClient } from '@/lib/api-client';

export const hotelService = {
  search(params: HotelSearchParams) {
    // return apiFetch<HotelSearchResponse>(`/hotels/storefront/search`, {
    //   method: "GET",
    //   query: params as Record<string, unknown>,
    // })
    return apiClient.get<HotelSearchResponse>('/hotels/storefront/search', { params })
  },
  get(id: string | number) {
    // return apiFetch<HotelDetails>(`/hotels/storefront/${encodeURIComponent(String(id))}`)
    return apiClient.get<HotelDetails>(`/hotels/storefront/${encodeURIComponent(String(id))}`,{

    })
  },
}

export type { HotelSearchParams, HotelSearchResponse, HotelDetails }
