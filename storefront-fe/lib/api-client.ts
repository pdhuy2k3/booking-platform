import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"

// Standardized API Response interface matching backend ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T | null
  errorCode?: string
  timestamp: string
  metadata?: any
  requestId?: string
}
let baseURL: string

if (typeof window !== 'undefined') {
  // In browser: use current origin (which will be the BFF URL)
  baseURL = window.location.origin
} else {
  // Server-side: use environment variable or fallback
  baseURL = process.env.NEXT_PUBLIC_BFF_BASE_URL || "https://api-bookingsmart.huypd.dev"
}
class ApiClient {
  private client: AxiosInstance
  
  constructor() {
    this.client = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      withCredentials: true, // Important for OIDC cookies and session management
    })

    this.setupInterceptors()
  }

  // Helper method to extract data from standardized API response
  private extractData<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'API request failed')
    }
    return response.data as T
  }

  // Helper method to check if response is in new format
  private isStandardizedResponse(data: any): data is ApiResponse<any> {
    return data && typeof data === 'object' &&
           typeof data.success === 'boolean' &&
           typeof data.message === 'string' &&
           'data' in data
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Log request in development (now using real APIs)
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚀 Real API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
          if (config.data) {
            console.log('📤 Request Data:', config.data)
          }
          if (config.params) {
            console.log('🔍 Request Params:', config.params)
          }
        }

        // Add timestamp to prevent caching issues
        if (config.method === 'get') {
          config.params = { ...config.params, _t: Date.now() }
        }

        return config
      },
      (error) => {
        console.error('❌ Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development (now showing real data)
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Real API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
          console.log('📥 Real Data:', response.data)
        }

        // Handle standardized API responses
        if (this.isStandardizedResponse(response.data)) {
          if (!response.data.success) {
            // Convert API error to axios error for consistent error handling
            const error = new Error(response.data.message || 'API request failed')
            ;(error as any).response = {
              ...response,
              data: response.data,
              status: response.status
            }
            ;(error as any).code = response.data.errorCode
            throw error
          }
        }

        return response
      },
      (error) => {
        // Enhanced error handling
        console.error('❌ API Error:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data
        })

        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          console.warn('🔐 Unauthorized access, redirecting to login...')
          window.location.href = "/login"
        } else if (error.response?.status === 403) {
          console.warn('🚫 Forbidden access')
        } else if (error.response?.status >= 500) {
          console.error('🔥 Server error occurred')
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T | ApiResponse<T>> = await this.client.get(url, config)

    // Handle both old and new response formats for backward compatibility
    if (this.isStandardizedResponse(response.data)) {
      return this.extractData(response.data as ApiResponse<T>)
    }
    return response.data as T
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T | ApiResponse<T>> = await this.client.post(url, data, config)

    // Handle both old and new response formats for backward compatibility
    if (this.isStandardizedResponse(response.data)) {
      return this.extractData(response.data as ApiResponse<T>)
    }
    return response.data as T
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T | ApiResponse<T>> = await this.client.put(url, data, config)

    // Handle both old and new response formats for backward compatibility
    if (this.isStandardizedResponse(response.data)) {
      return this.extractData(response.data as ApiResponse<T>)
    }
    return response.data as T
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T | ApiResponse<T>> = await this.client.delete(url, config)

    // Handle both old and new response formats for backward compatibility
    if (this.isStandardizedResponse(response.data)) {
      return this.extractData(response.data as ApiResponse<T>)
    }
    return response.data as T
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T | ApiResponse<T>> = await this.client.patch(url, data, config)

    // Handle both old and new response formats for backward compatibility
    if (this.isStandardizedResponse(response.data)) {
      return this.extractData(response.data as ApiResponse<T>)
    }
    return response.data as T
  }

  // Utility method for building query parameters
  buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    return searchParams.toString()
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/actuator/health')
  }

  // Get base URL for debugging
  getBaseURL(): string {
    return this.client.defaults.baseURL || ''
  }
}

export const apiClient = new ApiClient()

// Export types for better TypeScript support
export type { AxiosRequestConfig, AxiosResponse } from 'axios'
