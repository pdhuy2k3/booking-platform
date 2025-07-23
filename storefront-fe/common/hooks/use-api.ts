import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient, type ApiError, createApiError, isApiError } from '@/lib/api'

// Generic API hook state
export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  success: boolean
}

// Hook options
export interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
  retryAttempts?: number
  retryDelay?: number
}

// Generic API hook
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryAttempts = 0,
    retryDelay = 1000
  } = options

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  })

  const retryCountRef = useRef(0)
  const mountedRef = useRef(true)

  const execute = useCallback(async () => {
    if (!mountedRef.current) return

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }))

    try {
      const result = await apiCall()
      
      if (!mountedRef.current) return

      setState({
        data: result,
        loading: false,
        error: null,
        success: true
      })

      retryCountRef.current = 0
      onSuccess?.(result)
    } catch (err) {
      if (!mountedRef.current) return

      const apiError = isApiError(err) 
        ? err 
        : createApiError(
            err?.response?.status || 500,
            err?.message || 'An unexpected error occurred',
            err?.code,
            err?.response?.data
          )

      // Retry logic
      if (retryCountRef.current < retryAttempts && apiError.status >= 500) {
        retryCountRef.current++
        setTimeout(() => {
          if (mountedRef.current) {
            execute()
          }
        }, retryDelay * retryCountRef.current)
        return
      }

      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false
      })

      onError?.(apiError)
    }
  }, [apiCall, onSuccess, onError, retryAttempts, retryDelay])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    })
    retryCountRef.current = 0
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }

    return () => {
      mountedRef.current = false
    }
  }, [immediate, execute])

  return {
    ...state,
    execute,
    reset,
    retry: execute
  }
}

// Mutation hook for POST/PUT/DELETE operations
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null,
    success: false
  })

  const { onSuccess, onError } = options
  const mountedRef = useRef(true)

  const mutate = useCallback(async (variables: TVariables) => {
    if (!mountedRef.current) return

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false
    }))

    try {
      const result = await mutationFn(variables)
      
      if (!mountedRef.current) return

      setState({
        data: result,
        loading: false,
        error: null,
        success: true
      })

      onSuccess?.(result)
      return result
    } catch (err) {
      if (!mountedRef.current) return

      const apiError = isApiError(err) 
        ? err 
        : createApiError(
            err?.response?.status || 500,
            err?.message || 'An unexpected error occurred',
            err?.code,
            err?.response?.data
          )

      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false
      })

      onError?.(apiError)
      throw apiError
    }
  }, [mutationFn, onSuccess, onError])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false
    })
  }, [])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    ...state,
    mutate,
    reset
  }
}

// Paginated data hook
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{
    data: T[]
    totalCount: number
    page: number
    limit: number
    hasMore: boolean
  }>,
  initialLimit: number = 20,
  options: UseApiOptions = {}
) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(initialLimit)
  const [allData, setAllData] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const {
    data,
    loading,
    error,
    success,
    execute,
    reset: resetApi
  } = useApi(
    () => apiCall(page, limit),
    {
      ...options,
      onSuccess: (result) => {
        if (page === 1) {
          setAllData(result.data)
        } else {
          setAllData(prev => [...prev, ...result.data])
        }
        setHasMore(result.hasMore)
        setTotalCount(result.totalCount)
        options.onSuccess?.(result)
      }
    }
  )

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }, [hasMore, loading])

  const refresh = useCallback(() => {
    setPage(1)
    setAllData([])
    setHasMore(true)
    setTotalCount(0)
    execute()
  }, [execute])

  const reset = useCallback(() => {
    setPage(1)
    setLimit(initialLimit)
    setAllData([])
    setHasMore(true)
    setTotalCount(0)
    resetApi()
  }, [initialLimit, resetApi])

  useEffect(() => {
    execute()
  }, [page, limit, execute])

  return {
    data: allData,
    loading,
    error,
    success,
    hasMore,
    totalCount,
    page,
    limit,
    loadMore,
    refresh,
    reset,
    setLimit
  }
}

// Health check hook
export function useHealthCheck(interval: number = 30000) {
  const { data, loading, error, execute } = useApi(
    () => apiClient.healthCheck(),
    { immediate: true }
  )

  useEffect(() => {
    const intervalId = setInterval(execute, interval)
    return () => clearInterval(intervalId)
  }, [execute, interval])

  return {
    isHealthy: data?.status === 'UP',
    loading,
    error,
    lastCheck: data?.timestamp,
    checkHealth: execute
  }
}

// Debounced API hook for search
export function useDebouncedApi<T>(
  apiCall: (query: string) => Promise<T>,
  delay: number = 300,
  options: UseApiOptions = {}
) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const { data, loading, error, success, execute } = useApi(
    () => apiCall(debouncedQuery),
    { ...options, immediate: false }
  )

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, delay)

    return () => clearTimeout(timer)
  }, [query, delay])

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      execute()
    }
  }, [debouncedQuery, execute])

  return {
    data,
    loading,
    error,
    success,
    query,
    setQuery,
    search: execute
  }
}

// Export all hooks
export default {
  useApi,
  useMutation,
  usePaginatedApi,
  useHealthCheck,
  useDebouncedApi
}
