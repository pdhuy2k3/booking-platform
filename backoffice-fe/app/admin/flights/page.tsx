"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { AdminLayout } from "@/components/admin/admin-layout"
import { FlightService } from "@/services/flight-service"
import { AirlineService } from "@/services/airline-service"
import { AirportService } from "@/services/airport-service"
import { FlightStats } from "@/components/admin/flight/flight-stats"
import { FlightTable } from "@/components/admin/flight/flight-table"
import { FlightFormDialog } from "@/components/admin/flight/flight-form-dialog"
import { FlightViewDialog } from "@/components/admin/flight/flight-view-dialog"
import type { Flight, PaginatedResponse, Airline, Airport } from "@/types/api"

interface FlightFormData {
  flightNumber: string
  airlineId: string
  departureAirportId: string
  arrivalAirportId: string
  aircraftType: string
  basePrice: string
  baseDurationMinutes: string
  status: string
  isActive: boolean
}

const initialFlightForm: FlightFormData = {
  flightNumber: '',
  airlineId: '',
  departureAirportId: '',
  arrivalAirportId: '',
  aircraftType: '',
  basePrice: '',
  baseDurationMinutes: '',
  status: 'ACTIVE',
  isActive: true
}

export default function AdminFlights() {
  // State management
  const [flights, setFlights] = useState<PaginatedResponse<Flight> | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Selected flight for actions
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [submitting, setSubmitting] = useState(false)

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

  // Form state for add flight
  const [addForm, setAddForm] = useState<FlightFormData>(initialFlightForm)
  // Form state for edit flight
  const [editForm, setEditForm] = useState<FlightFormData>(initialFlightForm)

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
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
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
      setAirlines([])
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
      setAirports([])
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
      setHasMoreAirlines(airlinePage < data.totalPages)
      setAirlinePage(prev => prev + 1)
    } catch (error) {
      console.error("Failed to load more airlines:", error)
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
      setHasMoreAirports(airportPage < data.totalPages)
      setAirportPage(prev => prev + 1)
    } catch (error) {
      console.error("Failed to load more airports:", error)
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
    }
  }

  // Reset add form
  const resetAddForm = () => {
    setAddForm(initialFlightForm)
  }

  // Populate edit form with selected flight data
  const populateEditForm = (flight: Flight) => {
    const editFormData = {
      flightNumber: flight.flightNumber || '',
      airlineId: flight.airline?.id?.toString() || '',
      departureAirportId: flight.departureAirport?.id?.toString() || '',
      arrivalAirportId: flight.arrivalAirport?.id?.toString() || '',
      aircraftType: flight.aircraftType || '',
      basePrice: flight.basePrice?.toString() || '',
      baseDurationMinutes: flight.baseDurationMinutes?.toString() || '',
      status: flight.status || 'ACTIVE',
      isActive: flight.isActive ?? true
    }
    
    setEditForm(editFormData)
    
    // Ensure the selected airline and airports are available in the lists (only if they exist)
    if (flight.airline && flight.airline.id && !airlines.some(a => a.id === flight.airline!.id)) {
      setAirlines(prev => [...prev, flight.airline!])
    }
    if (flight.departureAirport && flight.departureAirport.id && !airports.some(a => a.id === flight.departureAirport!.id)) {
      setAirports(prev => [...prev, flight.departureAirport!])
    }
    if (flight.arrivalAirport && flight.arrivalAirport.id && !airports.some(a => a.id === flight.arrivalAirport!.id)) {
      setAirports(prev => [...prev, flight.arrivalAirport!])
    }
  }

  // Handle add flight
  const handleAddFlight = async () => {
    try {
      // Basic validation
      if (!addForm.flightNumber.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập mã chuyến bay.",
          variant: "destructive",
        })
        return
      }
      if (!addForm.airlineId || !addForm.departureAirportId || !addForm.arrivalAirportId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn đầy đủ thông tin.",
          variant: "destructive",
        })
        return
      }
      if (addForm.departureAirportId === addForm.arrivalAirportId) {
        toast({
          title: "Lỗi",
          description: "Sân bay đi và đến không thể giống nhau.",
          variant: "destructive",
        })
        return
      }

      setSubmitting(true)

      const newFlight = {
        flightNumber: addForm.flightNumber.trim(),
        airlineId: parseInt(addForm.airlineId),
        departureAirportId: parseInt(addForm.departureAirportId),
        arrivalAirportId: parseInt(addForm.arrivalAirportId),
        aircraftType: addForm.aircraftType.trim() || undefined,
        basePrice: addForm.basePrice ? parseFloat(addForm.basePrice) : undefined,
        baseDurationMinutes: addForm.baseDurationMinutes ? parseInt(addForm.baseDurationMinutes) : undefined,
        status: addForm.status,
      }

      await FlightService.createFlight(newFlight)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được thêm thành công.",
      })

      setIsAddDialogOpen(false)
      resetAddForm()
      loadFlights()
    } catch (error: any) {
      console.error("Error adding flight:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm chuyến bay. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle edit flight
  const handleEditFlight = async () => {
    if (!selectedFlight) return

    try {
      // Basic validation similar to add
      if (!editForm.flightNumber.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập mã chuyến bay.",
          variant: "destructive",
        })
        return
      }

      setSubmitting(true)

      const updatedFlight = {
        flightNumber: editForm.flightNumber.trim(),
        airlineId: parseInt(editForm.airlineId),
        departureAirportId: parseInt(editForm.departureAirportId),
        arrivalAirportId: parseInt(editForm.arrivalAirportId),
        aircraftType: editForm.aircraftType.trim() || undefined,
        basePrice: editForm.basePrice ? parseFloat(editForm.basePrice) : undefined,
        baseDurationMinutes: editForm.baseDurationMinutes ? parseInt(editForm.baseDurationMinutes) : undefined,
        status: editForm.status,
      }

      await FlightService.updateFlight(selectedFlight.id, updatedFlight)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được cập nhật thành công.",
      })

      setIsEditDialogOpen(false)
      setSelectedFlight(null)
      loadFlights()
    } catch (error: any) {
      console.error("Error updating flight:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật chuyến bay. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle delete flight
  const handleDeleteFlight = async () => {
    if (!selectedFlight) return

    try {
      setSubmitting(true)
      await FlightService.deleteFlight(selectedFlight.id)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được xóa thành công.",
      })

      setIsDeleteDialogOpen(false)
      setSelectedFlight(null)
      loadFlights()
    } catch (error: any) {
      console.error("Error deleting flight:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa chuyến bay. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    resetAddForm()
    loadFormData()
    setIsAddDialogOpen(true)
  }

  // Handle opening edit dialog
  const handleOpenEditDialog = async (flight: Flight) => {
    setSelectedFlight(flight)
    setIsEditDialogOpen(true)
    
    // Load form data first, then populate the form
    await loadFormData()
    populateEditForm(flight)
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Chuyến bay</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả chuyến bay trong hệ thống</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto"
          onClick={handleOpenAddDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm chuyến bay
        </Button>
      </div>

      <FlightStats flights={flights} formatPrice={formatPrice} />

      <FlightTable
        flights={flights}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onViewFlight={(flight) => {
          setSelectedFlight(flight)
          setIsViewDialogOpen(true)
        }}
        onEditFlight={handleOpenEditDialog}
        onDeleteFlight={(flight) => {
          setSelectedFlight(flight)
          setIsDeleteDialogOpen(true)
        }}
        formatPrice={formatPrice}
      />

      {/* Add Flight Dialog */}
      <FlightFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Thêm chuyến bay mới"
        description="Nhập thông tin chuyến bay mới vào hệ thống"
        form={addForm}
        onFormChange={setAddForm}
        airlines={airlines}
        airports={airports}
        loadingFormData={loadingFormData}
        submitting={submitting}
        onSubmit={handleAddFlight}
        submitLabel="Thêm chuyến bay"
        onAirlineSearch={handleAirlineSearch}
        onAirportSearch={handleAirportSearch}
        onLoadMoreAirlines={loadMoreAirlines}
        onLoadMoreAirports={loadMoreAirports}
        hasMoreAirlines={hasMoreAirlines}
        hasMoreAirports={hasMoreAirports}
        loadingMoreAirlines={loadingMoreAirlines}
        loadingMoreAirports={loadingMoreAirports}
        airlineSearchTerm={airlineSearchTerm}
        airportSearchTerm={airportSearchTerm}
      />

      {/* Edit Flight Dialog */}
      <FlightFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa chuyến bay"
        description={`Cập nhật thông tin chuyến bay ${selectedFlight?.flightNumber}`}
        form={editForm}
        onFormChange={setEditForm}
        airlines={airlines}
        airports={airports}
        loadingFormData={loadingFormData}
        submitting={submitting}
        onSubmit={handleEditFlight}
        submitLabel="Lưu thay đổi"
        onAirlineSearch={handleAirlineSearch}
        onAirportSearch={handleAirportSearch}
        onLoadMoreAirlines={loadMoreAirlines}
        onLoadMoreAirports={loadMoreAirports}
        hasMoreAirlines={hasMoreAirlines}
        hasMoreAirports={hasMoreAirports}
        loadingMoreAirlines={loadingMoreAirlines}
        loadingMoreAirports={loadingMoreAirports}
        airlineSearchTerm={airlineSearchTerm}
        airportSearchTerm={airportSearchTerm}
      />

      {/* View Flight Dialog */}
      <FlightViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        flight={selectedFlight}
        formatPrice={formatPrice}
      />

      {/* Delete Flight Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chuyến bay</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuyến bay <strong>{selectedFlight?.flightNumber}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
              onClick={handleDeleteFlight}
            >
              {submitting ? "Đang xóa..." : "Xóa chuyến bay"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
