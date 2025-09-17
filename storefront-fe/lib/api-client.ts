import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"

class ApiClient {
  private client: AxiosInstance
  private BASE_URL: string

  constructor() {
    this.BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8086"

    this.client = axios.create({
      baseURL: `${this.BASE_URL.replace(/\/$/, "")}/api`,
      timeout: 30000,

    })

  }



  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    // Ensure URL starts with /api for gateway routing
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    // Ensure URL starts with /api for gateway routing
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config)
    return response.data
  }

}

export const apiClient = new ApiClient()