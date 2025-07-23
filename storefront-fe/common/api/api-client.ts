import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BFF_BASE_URL || "http://storefront",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      withCredentials: true, // Important for OIDC cookies and session management
    })

    this.setupInterceptors()
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
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config)
    return response.data
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
