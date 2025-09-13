import { useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { FlightService } from "@/services/flight-service"
import { AirlineService } from "@/services/airline-service"
import { AirportService } from "@/services/airport-service"
import type { Flight, PaginatedResponse, Airline, Airport } from "@/types/api"

export const useFlightData = () => {
  const [flights, setFlights] = useState<PaginatedResponse<Flight> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Form data for add/edit with infinite scroll support
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [loadingFormData, setLoadingFormData] = useState(false)
  
  // Infinite scroll states for airlines
  const [airlinePage, setAirlinePage] = useState(0)
  const [hasMoreAirlines, setHasMoreAirlines] = useState(true)
  const [loadingMoreAirlines, setLoadingMoreAirlines] = useState(false)
  const [airlineSearchTerm, setAirlineSearchTerm] = useState('')
  
  // Infinite scroll states for airports
  const [airportPage, setAirportPage] = useState(0)
  const [hasMoreAirports, setHasMoreAirports] = useState(true)
  const [loadingMoreAirports, setLoadingMoreAirports] = useState(false)
  const [airportSearchTerm, setAirportSearchTerm] = useState('')

  useEffect(() => {
    loadFlights()
  }, [searchTerm])

  const loadFlights = async () => {
    try {
      setLoading(true)
      const data = await FlightService.getFlights({
        search: searchTerm || undefined,
        page: 0,
        size: 20,
      })
      setFlights(data)
    } catch (error) {
      console.error("Failed to load flights:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách chuyến bay. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load initial form data
  const loadFormData = async () => {
    try {
      setLoadingFormData(true)
      // Reset pagination states
      setAirlinePage(0)
      setAirportPage(0)
      setHasMoreAirlines(true)
      setHasMoreAirports(true)
      setAirlineSearchTerm('')
      setAirportSearchTerm('')
      
      // Load initial data
      await Promise.all([
        loadInitialAirlines(),
        loadInitialAirports()
      ])
    } catch (error) {
      console.error("Failed to load form data:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu form. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoadingFormData(false)
    }
  }

  // Load initial airlines
  const loadInitialAirlines = async () => {
    try {
      const data = await AirlineService.getAirlines({
        page: 0,
        size: 20,
        search: airlineSearchTerm || undefined
      })
      setAirlines(data.content)
      setHasMoreAirlines(data.totalPages > 1)
      setAirlinePage(1)
    } catch (error) {
      console.error("Failed to load airlines:", error)
      setAirlines([]) // Clear airlines on error
    }
  }

  // Load initial airports
  const loadInitialAirports = async () => {
    try {
      const data = await AirportService.getAirports({
        page: 0,
        size: 20,
        search: airportSearchTerm || undefined
      })
      setAirports(data.content)
      setHasMoreAirports(data.totalPages > 1)
      setAirportPage(1)
    } catch (error) {
      console.error("Failed to load airports:", error)
      setAirports([]) // Clear airports on error
    }
  }

  // Load more airlines for infinite scroll
  const loadMoreAirlines = async () => {
    if (loadingMoreAirlines || !hasMoreAirlines) return

    try {
      setLoadingMoreAirlines(true)
      const data = await AirlineService.getAirlines({
        page: airlinePage,
        size: 20,
        search: airlineSearchTerm || undefined
      })
      
      setAirlines(prev => [...prev, ...data.content])
      setHasMoreAirlines(airlinePage < data.totalPages - 1)
      setAirlinePage(prev => prev + 1)
    } catch (error) {
      console.error("Failed to load more airlines:", error)
      // Don't update the airlines list on error, just stop loading
    } finally {
      setLoadingMoreAirlines(false)
    }
  }

  // Load more airports for infinite scroll
  const loadMoreAirports = async () => {
    if (loadingMoreAirports || !hasMoreAirports) return

    try {
      setLoadingMoreAirports(true)
      const data = await AirportService.getAirports({
        page: airportPage,
        size: 20,
        search: airportSearchTerm || undefined
      })
      
      setAirports(prev => [...prev, ...data.content])
      setHasMoreAirports(airportPage < data.totalPages - 1)
      setAirportPage(prev => prev + 1)
    } catch (error) {
      console.error("Failed to load more airports:", error)
      // Don't update the airports list on error, just stop loading
    } finally {
      setLoadingMoreAirports(false)
    }
  }

  // Handle airline search
  const handleAirlineSearch = async (searchTerm: string) => {
    setAirlineSearchTerm(searchTerm)
    setAirlinePage(0)
    setHasMoreAirlines(true)
    
    try {
      const data = await AirlineService.getAirlines({
        page: 0,
        size: 20,
        search: searchTerm || undefined
      })
      setAirlines(data.content)
      setHasMoreAirlines(data.totalPages > 1)
      setAirlinePage(1)
    } catch (error) {
      console.error("Failed to search airlines:", error)
      setAirlines([]) // Clear airlines on error
    }
  }

  // Handle airport search
  const handleAirportSearch = async (searchTerm: string) => {
    setAirportSearchTerm(searchTerm)
    setAirportPage(0)
    setHasMoreAirports(true)
    
    try {
      const data = await AirportService.getAirports({
        page: 0,
        size: 20,
        search: searchTerm || undefined
      })
      setAirports(data.content)
      setHasMoreAirports(data.totalPages > 1)
      setAirportPage(1)
    } catch (error) {
      console.error("Failed to search airports:", error)
      setAirports([]) // Clear airports on error
    }
  }

  return {
    // Flight data
    flights,
    loading,
    loadFlights,
    
    // Search
    searchTerm,
    setSearchTerm,
    
    // Form data
    airlines,
    airports,
    loadingFormData,
    loadFormData,
    
    // Infinite scroll for airlines
    airlinePage,
    hasMoreAirlines,
    loadingMoreAirlines,
    airlineSearchTerm,
    loadMoreAirlines,
    handleAirlineSearch,
    
    // Infinite scroll for airports
    airportPage,
    hasMoreAirports,
    loadingMoreAirports,
    airportSearchTerm,
    loadMoreAirports,
    handleAirportSearch
  }
}