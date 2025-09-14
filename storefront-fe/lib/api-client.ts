import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { getSession } from "next-auth/react"
import { type Session } from "next-auth"
import { type Booking, type CreateBookingPayload, type Hotel, type HotelSearchParams } from "./types"

// Type for query parameters
export type Query = Record<string, unknown | undefined>

class ApiClient {
  private client: AxiosInstance
  private gatewayUrl: string

  constructor() {
    // Use storefront-gateway as API Gateway
    this.gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_BASE_URL || "http://localhost:8086"
    
    this.client = axios.create({
      baseURL: this.gatewayUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add access token
    this.client.interceptors.request.use(
      async (config) => {
        // Get the session to retrieve the access token
        const session = await getSession()
        if ((session as Session & { accessToken?: string })?.accessToken) {
          config.headers.Authorization = `Bearer ${(session as Session & { accessToken?: string }).accessToken}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          window.location.href = "/api/auth/signin"
        }
        if (error.response?.status === 403) {
          // Access denied - redirect to unauthorized page
          window.location.href = "/unauthorized"
        }
        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Ensure URL starts with /api for gateway routing
    const gatewayUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : `/${url}`}`
    const response: AxiosResponse<T> = await this.client.get(gatewayUrl, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Ensure URL starts with /api for gateway routing
    const gatewayUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : `/${url}`}`
    const response: AxiosResponse<T> = await this.client.post(gatewayUrl, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Ensure URL starts with /api for gateway routing
    const gatewayUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : `/${url}`}`
    const response: AxiosResponse<T> = await this.client.put(gatewayUrl, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Ensure URL starts with /api for gateway routing
    const gatewayUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : `/${url}`}`
    const response: AxiosResponse<T> = await this.client.delete(gatewayUrl, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Ensure URL starts with /api for gateway routing
    const gatewayUrl = url.startsWith('/api') ? url : `/api${url.startsWith('/') ? url : `/${url}`}`
    const response: AxiosResponse<T> = await this.client.patch(gatewayUrl, data, config)
    return response.data
  }

  // Backward compatibility method to replace apiFetch
  async apiFetch<T>(path: string, init?: { method?: string; query?: Query; body?: string }): Promise<T> {
    const { method = "GET", query, body } = init || {}
    
    const config: AxiosRequestConfig = {
      params: query,
    }
    
    if (body) {
      config.data = JSON.parse(body)
    }
    
    // Ensure path starts with /api for gateway routing
    const gatewayPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`
    
    switch (method.toUpperCase()) {
      case "GET":
        return this.get<T>(gatewayPath, config)
      case "POST":
        return this.post<T>(gatewayPath, config.data, config)
      case "PUT":
        return this.put<T>(gatewayPath, config.data, config)
      case "DELETE":
        return this.delete<T>(gatewayPath, config)
      case "PATCH":
        return this.patch<T>(gatewayPath, config.data, config)
      default:
        return this.get<T>(gatewayPath, config)
    }
  }

  // Hotels
  async searchHotels(params: HotelSearchParams): Promise<Hotel[]> {
    return this.get<Hotel[]>(`/api/hotels/search`, { params })
  }

  async getHotel(id: string): Promise<Hotel> {
    return this.get<Hotel>(`/api/hotels/${encodeURIComponent(id)}`)
  }

  // Bookings
  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    return this.post<Booking>(`/api/bookings`, payload)
  }
}

export const apiClient = new ApiClient()