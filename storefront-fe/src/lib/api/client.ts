import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL, API_TIMEOUT, ERROR_MESSAGES } from "../utils/constants";

// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("auth_token") 
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (process.env.NODE_ENV === "development") {
      const endTime = new Date();
      const startTime = response.config.metadata?.startTime;
      if (startTime) {
        const duration = endTime.getTime() - startTime.getTime();
        console.log(`API Request to ${response.config.url} took ${duration}ms`);
      }
    }

    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
          break;
        case 403:
          // Forbidden
          console.error("Access forbidden:", data);
          break;
        case 404:
          // Not found
          console.error("Resource not found:", error.config?.url);
          break;
        case 500:
          // Server error
          console.error("Server error:", data);
          break;
        default:
          console.error("API Error:", data);
      }

      return Promise.reject({
        message: data?.message || ERROR_MESSAGES.SERVER_ERROR,
        code: data?.code,
        details: data,
      } as ApiError);
    } else if (error.request) {
      // Network error
      console.error("Network error:", error.request);
      return Promise.reject({
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: "NETWORK_ERROR",
      } as ApiError);
    } else {
      // Other error
      console.error("Request error:", error.message);
      return Promise.reject({
        message: error.message || ERROR_MESSAGES.VALIDATION_ERROR,
        code: "REQUEST_ERROR",
      } as ApiError);
    }
  }
);

// API methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config).then((response) => response.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post(url, data, config).then((response) => response.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put(url, data, config).then((response) => response.data),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch(url, data, config).then((response) => response.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config).then((response) => response.data),
};

export default apiClient;
