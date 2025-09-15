
import type { FlightDetails, FlightSearchParams, FlightSearchResponse } from "../type"
import { apiClient } from '@/lib/api-client';

export const flightService = {
  search(params: FlightSearchParams) {
    // Backend expects: origin, destination, departureDate, returnDate?, passengers, seatClass, page, limit
    // return apiFetch<FlightSearchResponse>(`/flights/storefront/search`, {
    //   method: "GET",
    //   query: params as Record<string, unknown>,
    // })
    return apiClient.get<FlightSearchResponse>(`/flights/storefront/search`, {
      params

    } )
  },
  get(id: string) {
    // Backend: GET /flights/storefront/{flightId}
    // return apiFetch<FlightDetails>(`/flights/storefront/${encodeURIComponent(id)}`)
    return apiClient.get<FlightDetails>(`/flights/storefront/${encodeURIComponent(id)}`)
  },
  // New method to fetch initial flight data with city information
  getInitialData() {
    return apiClient.get<any>(`/flights/storefront/flights`, {
      params: {
        page: 0,
        limit: 20
      }
    })
  },
  // New method to fetch city data from tinhthanhpho.com API
  async getCities(search: string) {
    // In a real implementation, this would call the tinhthanhpho.com API
    // For now, we'll return mock data
    return Promise.resolve([
      { code: 'HAN', name: 'Hanoi', type: 'Thành phố' },
      { code: 'SGN', name: 'Ho Chi Minh City', type: 'Thành phố' },
      { code: 'DAD', name: 'Da Nang', type: 'Thành phố' },
      { code: 'CXR', name: 'Nha Trang', type: 'Thành phố' },
      { code: 'VCA', name: 'Can Tho', type: 'Thành phố' },
      { code: 'HPH', name: 'Hai Phong', type: 'Thành phố' },
      { code: 'VII', name: 'Vinh', type: 'Thành phố' },
      { code: 'HUI', name: 'Hue', type: 'Thành phố' },
    ].filter(city => 
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.code.toLowerCase().includes(search.toLowerCase())
    ));
  }
}

export type { FlightSearchParams, FlightSearchResponse, FlightDetails }
