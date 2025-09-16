// Common types shared across all modules

export type ID = string

// Standardized API response types
export type DestinationSearchResult = {
  name: string
  type: string
  country: string
  category: string
  iataCode?: string
  relevanceScore?: number
  description?: string
  latitude?: number
  longitude?: number
}

export type SearchResponse<T> = {
  results: T[]
  totalCount: number
  page?: number
  limit?: number
  hasMore?: boolean
  query: string
  metadata?: Record<string, unknown>
  executionTimeMs?: number
}

export type ErrorResponse = {
  errorCode: string
  message: string
  details?: string
  timestamp: string
  path?: string
  metadata?: Record<string, unknown>
}

// Common pagination types
export type PaginationParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type PaginatedResponse<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
  hasNext: boolean
  hasPrevious: boolean
}

// Common search types
export type SearchParams = {
  query?: string
  filters?: Record<string, unknown>
  pagination?: PaginationParams
}

// Common status types
export type Status = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'CANCELLED' | 'COMPLETED'

// Common currency types
export type Currency = 'VND' | 'USD' | 'EUR' | 'GBP'

// Common date range types
export type DateRange = {
  startDate: string // ISO date string
  endDate: string // ISO date string
}

// Common location types
export type Location = {
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
}

// Common media types
export type MediaItem = {
  id: ID
  url: string
  alt?: string
  type: 'image' | 'video'
  size?: number
  width?: number
  height?: number
}

// Common validation types
export type ValidationError = {
  field: string
  message: string
  code?: string
}

export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
}
