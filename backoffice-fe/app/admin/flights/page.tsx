"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import {
  InfiniteScrollSelect,
  InfiniteScrollSelectContent,
  InfiniteScrollSelectItem,
  InfiniteScrollSelectTrigger,
  InfiniteScrollSelectValue,
} from "@/components/ui/infinite-scroll-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, Plane, Eye, MoreHorizontal } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { AdminLayout } from "@/components/admin/admin-layout"
import { MediaSelector } from "@/components/ui/media-selector"
import { FlightService } from "@/services/flight-service"
import { AirlineService } from "@/services/airline-service"
import { AirportService } from "@/services/airport-service"
import type { Flight, PaginatedResponse, Airline, Airport } from "@/types/api"

export default function AdminFlights() {
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
  const [addForm, setAddForm] = useState({
    flightNumber: '',
    airlineId: '',
    departureAirportId: '',
    arrivalAirportId: '',
    aircraftType: '',
    basePrice: '',
    baseDurationMinutes: '',
    status: 'ACTIVE',
    isActive: true
  })

  // Form state for edit flight
  const [editForm, setEditForm] = useState({
    flightNumber: '',
    airlineId: '',
    departureAirportId: '',
    arrivalAirportId: '',
    aircraftType: '',
    basePrice: '',
    baseDurationMinutes: '',
    status: 'ACTIVE',
    isActive: true
  })

  // Image state management
  const [newFlightImages, setNewFlightImages] = useState<string[]>([])
  const [editingFlightImages, setEditingFlightImages] = useState<string[]>([])

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      case "DELAYED":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm hoãn</Badge>
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "ON_TIME":
        return <Badge className="bg-blue-100 text-blue-800">Đúng giờ</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Không xác định</Badge>
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
    setAddForm({
      flightNumber: '',
      airlineId: '',
      departureAirportId: '',
      arrivalAirportId: '',
      aircraftType: '',
      basePrice: '',
      baseDurationMinutes: '',
      status: 'ACTIVE',
      isActive: true
    })
    setNewFlightImages([]) // Reset flight images
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
    setEditingFlightImages(flight.images || []) // Set current flight images
    
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
      if (!addForm.airlineId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn hãng hàng không.",
          variant: "destructive",
        })
        return
      }
      if (!addForm.departureAirportId || !addForm.arrivalAirportId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn sân bay đi và đến.",
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
        mediaPublicIds: newFlightImages // Include media public IDs
      }

      await FlightService.createFlight(newFlight)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được thêm thành công.",
      })

      setIsAddDialogOpen(false)
      resetAddForm()
      loadFlights() // Reload the flights list
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
      // Basic validation
      if (!editForm.flightNumber.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng nhập mã chuyến bay.",
          variant: "destructive",
        })
        return
      }
      if (!editForm.airlineId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn hãng hàng không.",
          variant: "destructive",
        })
        return
      }
      if (!editForm.departureAirportId || !editForm.arrivalAirportId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn sân bay đi và đến.",
          variant: "destructive",
        })
        return
      }
      if (editForm.departureAirportId === editForm.arrivalAirportId) {
        toast({
          title: "Lỗi",
          description: "Sân bay đi và đến không thể giống nhau.",
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
        mediaPublicIds: editingFlightImages // Include media public IDs
      }

      await FlightService.updateFlight(selectedFlight.id, updatedFlight)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được cập nhật thành công.",
      })

      setIsEditDialogOpen(false)
      setSelectedFlight(null)
      setEditingFlightImages([]) // Clear editing images
      loadFlights() // Reload the flights list
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
      loadFlights() // Reload the flights list
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

  // Note: These stats will need to be implemented once backend provides seat information
  // For now, using placeholder values since the new Flight interface doesn't have seat data
  const totalFlights = flights?.totalElements || 0
  const activeFlights = flights?.content.filter(f => f.status === 'ACTIVE').length || 0

  return (
    <AdminLayout>
      {/* Header - Stack on mobile */}
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Thêm chuyến bay mới</DialogTitle>
              <DialogDescription>Nhập thông tin chuyến bay mới vào hệ thống</DialogDescription>
            </DialogHeader>
            {loadingFormData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="add-flightNumber">Mã chuyến bay *</Label>
                  <Input 
                    id="add-flightNumber" 
                    placeholder="VN001"
                    value={addForm.flightNumber}
                    onChange={(e) => setAddForm(prev => ({...prev, flightNumber: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-aircraftType">Loại máy bay</Label>
                  <Input 
                    id="add-aircraftType" 
                    placeholder="Boeing 777"
                    value={addForm.aircraftType}
                    onChange={(e) => setAddForm(prev => ({...prev, aircraftType: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-airline">Hãng hàng không *</Label>
                  <InfiniteScrollSelect value={addForm.airlineId} onValueChange={(value) => setAddForm(prev => ({...prev, airlineId: value}))}>
                    <InfiniteScrollSelectTrigger>
                      <InfiniteScrollSelectValue placeholder="Chọn hãng hàng không" />
                    </InfiniteScrollSelectTrigger>
                    <InfiniteScrollSelectContent
                      searchPlaceholder="Tìm hãng hàng không..."
                      onSearchChange={handleAirlineSearch}
                      onLoadMore={loadMoreAirlines}
                      hasMore={hasMoreAirlines}
                      loading={loadingMoreAirlines}
                      searchValue={airlineSearchTerm}
                    >
                      {airlines.map((airline) => (
                        <InfiniteScrollSelectItem key={airline.id} value={airline.id.toString()}>
                          {airline.name} ({airline.code})
                        </InfiniteScrollSelectItem>
                      ))}
                    </InfiniteScrollSelectContent>
                  </InfiniteScrollSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-basePrice">Giá cơ bản (VND)</Label>
                  <Input 
                    id="add-basePrice" 
                    type="number"
                    placeholder="2500000"
                    value={addForm.basePrice}
                    onChange={(e) => setAddForm(prev => ({...prev, basePrice: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-departureAirport">Sân bay đi *</Label>
                  <InfiniteScrollSelect value={addForm.departureAirportId} onValueChange={(value) => setAddForm(prev => ({...prev, departureAirportId: value}))}>
                    <InfiniteScrollSelectTrigger>
                      <InfiniteScrollSelectValue placeholder="Chọn sân bay đi" />
                    </InfiniteScrollSelectTrigger>
                    <InfiniteScrollSelectContent
                      searchPlaceholder="Tìm sân bay đi..."
                      onSearchChange={handleAirportSearch}
                      onLoadMore={loadMoreAirports}
                      hasMore={hasMoreAirports}
                      loading={loadingMoreAirports}
                      searchValue={airportSearchTerm}
                    >
                      {airports.map((airport) => (
                        <InfiniteScrollSelectItem key={airport.id} value={airport.id.toString()}>
                          {airport.code} - {airport.name}
                        </InfiniteScrollSelectItem>
                      ))}
                    </InfiniteScrollSelectContent>
                  </InfiniteScrollSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-arrivalAirport">Sân bay đến *</Label>
                  <InfiniteScrollSelect value={addForm.arrivalAirportId} onValueChange={(value) => setAddForm(prev => ({...prev, arrivalAirportId: value}))}>
                    <InfiniteScrollSelectTrigger>
                      <InfiniteScrollSelectValue placeholder="Chọn sân bay đến" />
                    </InfiniteScrollSelectTrigger>
                    <InfiniteScrollSelectContent
                      searchPlaceholder="Tìm sân bay đến..."
                      onSearchChange={handleAirportSearch}
                      onLoadMore={loadMoreAirports}
                      hasMore={hasMoreAirports}
                      loading={loadingMoreAirports}
                      searchValue={airportSearchTerm}
                    >
                      {airports.map((airport) => (
                        <InfiniteScrollSelectItem key={airport.id} value={airport.id.toString()}>
                          {airport.code} - {airport.name}
                        </InfiniteScrollSelectItem>
                      ))}
                    </InfiniteScrollSelectContent>
                  </InfiniteScrollSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-baseDuration">Thời gian bay (phút)</Label>
                  <Input 
                    id="add-baseDuration" 
                    type="number"
                    placeholder="120"
                    value={addForm.baseDurationMinutes}
                    onChange={(e) => setAddForm(prev => ({...prev, baseDurationMinutes: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-status">Trạng thái chuyến bay</Label>
                  <Select value={addForm.status} onValueChange={(value) => setAddForm(prev => ({...prev, status: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="ON_TIME">Đúng giờ</SelectItem>
                      <SelectItem value="DELAYED">Tạm hoãn</SelectItem>
                      <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flight-images">Hình ảnh chuyến bay</Label>
                  <MediaSelector
                    onChange={setNewFlightImages}
                    maxSelection={10}
                    folder="flights"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsAddDialogOpen(false)
                setNewFlightImages([])
              }}>
                Hủy
              </Button>
              <Button 
                disabled={submitting || loadingFormData}
                onClick={handleAddFlight}
              >
                {submitting ? "Đang thêm..." : "Thêm chuyến bay"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - Better responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chuyến bay</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights?.totalElements || 0}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuyến bay hoạt động</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlights}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuyến bay hủy</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flights?.content.filter(f => f.status === 'CANCELLED').length || 0}</div>
            <p className="text-xs text-muted-foreground">Đã hủy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trung bình</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flights?.content.length ? 
                formatPrice(flights.content.reduce((sum, f) => sum + (f.basePrice || 0), 0) / flights.content.length) : 
                '0 ₫'
              }
            </div>
            <p className="text-xs text-muted-foreground">Giá vé trung bình</p>
          </CardContent>
        </Card>
      </div>

      {/* Flights Table - Add horizontal scroll on mobile */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách chuyến bay</CardTitle>
              <CardDescription className="text-sm">Quản lý tất cả chuyến bay trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm chuyến bay..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã chuyến bay</TableHead>
                  <TableHead>Hãng hàng không</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Thời gian bay</TableHead>
                  <TableHead>Loại máy bay</TableHead>
                  <TableHead>Giá cơ bản</TableHead>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : flights?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  flights?.content.map((flight) => (
                    <TableRow key={flight.id}>
                      <TableCell className="font-medium">{flight.flightNumber}</TableCell>
                      <TableCell>{flight.airline?.name || 'Chưa có thông tin'}</TableCell>
                      <TableCell>
                        {flight.departureAirport?.code && flight.arrivalAirport?.code 
                          ? `${flight.departureAirport.code} → ${flight.arrivalAirport.code}`
                          : 'Chưa có thông tin'
                        }
                      </TableCell>
                      <TableCell>
                        {flight.baseDurationMinutes ? `${Math.floor(flight.baseDurationMinutes / 60)}h ${flight.baseDurationMinutes % 60}m` : 'N/A'}
                      </TableCell>
                      <TableCell>{flight.aircraftType || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{flight.basePrice ? formatPrice(flight.basePrice) : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={flight.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {flight.isActive ? 'Có' : 'Không'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(flight.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedFlight(flight)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleOpenEditDialog(flight)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => {
                                setSelectedFlight(flight)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Flight Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết chuyến bay</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của chuyến bay {selectedFlight?.flightNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedFlight && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="font-semibold">Mã chuyến bay</Label>
                <div className="text-sm">{selectedFlight.flightNumber}</div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Hãng hàng không</Label>
                <div className="text-sm">{selectedFlight.airline?.name || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Sân bay đi</Label>
                <div className="text-sm">
                  {selectedFlight.departureAirport?.code} - {selectedFlight.departureAirport?.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Sân bay đến</Label>
                <div className="text-sm">
                  {selectedFlight.arrivalAirport?.code} - {selectedFlight.arrivalAirport?.name}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Thời gian bay</Label>
                <div className="text-sm">
                  {selectedFlight.baseDurationMinutes
                    ? `${Math.floor(selectedFlight.baseDurationMinutes / 60)}h ${selectedFlight.baseDurationMinutes % 60}m`
                    : 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Loại máy bay</Label>
                <div className="text-sm">{selectedFlight.aircraftType || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Giá cơ bản</Label>
                <div className="text-sm font-medium">
                  {selectedFlight.basePrice ? formatPrice(selectedFlight.basePrice) : 'N/A'}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Trạng thái hoạt động</Label>
                <div>{selectedFlight.isActive ? getStatusBadge('ACTIVE') : getStatusBadge('CANCELLED')}</div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="font-semibold">Trạng thái chuyến bay</Label>
                <div>{getStatusBadge(selectedFlight.status)}</div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Flight Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chuyến bay</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chuyến bay {selectedFlight?.flightNumber}
            </DialogDescription>
          </DialogHeader>
          {loadingFormData ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Đang tải dữ liệu...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-flightNumber">Mã chuyến bay *</Label>
                <Input
                  id="edit-flightNumber"
                  placeholder="VN001"
                  value={editForm.flightNumber}
                  onChange={(e) => setEditForm(prev => ({...prev, flightNumber: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-aircraftType">Loại máy bay</Label>
                <Input
                  id="edit-aircraftType"
                  placeholder="Boeing 777"
                  value={editForm.aircraftType}
                  onChange={(e) => setEditForm(prev => ({...prev, aircraftType: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-airline">Hãng hàng không *</Label>
                <InfiniteScrollSelect value={editForm.airlineId} onValueChange={(value) => setEditForm(prev => ({...prev, airlineId: value}))}>
                  <InfiniteScrollSelectTrigger>
                    <InfiniteScrollSelectValue placeholder="Chọn hãng hàng không" />
                  </InfiniteScrollSelectTrigger>
                  <InfiniteScrollSelectContent
                    searchPlaceholder="Tìm hãng hàng không..."
                    onSearchChange={handleAirlineSearch}
                    onLoadMore={loadMoreAirlines}
                    hasMore={hasMoreAirlines}
                    loading={loadingMoreAirlines}
                    searchValue={airlineSearchTerm}
                  >
                    {airlines.map((airline) => (
                      <InfiniteScrollSelectItem key={airline.id} value={airline.id.toString()}>
                        {airline.name} ({airline.code})
                      </InfiniteScrollSelectItem>
                    ))}
                  </InfiniteScrollSelectContent>
                </InfiniteScrollSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-basePrice">Giá cơ bản (VND)</Label>
                <Input
                  id="edit-basePrice"
                  type="number"
                  placeholder="2500000"
                  value={editForm.basePrice}
                  onChange={(e) => setEditForm(prev => ({...prev, basePrice: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-departureAirport">Sân bay đi *</Label>
                <InfiniteScrollSelect value={editForm.departureAirportId} onValueChange={(value) => setEditForm(prev => ({...prev, departureAirportId: value}))}>
                  <InfiniteScrollSelectTrigger>
                    <InfiniteScrollSelectValue placeholder="Chọn sân bay đi" />
                  </InfiniteScrollSelectTrigger>
                  <InfiniteScrollSelectContent
                    searchPlaceholder="Tìm sân bay đi..."
                    onSearchChange={handleAirportSearch}
                    onLoadMore={loadMoreAirports}
                    hasMore={hasMoreAirports}
                    loading={loadingMoreAirports}
                    searchValue={airportSearchTerm}
                  >
                    {airports.map((airport) => (
                      <InfiniteScrollSelectItem key={airport.id} value={airport.id.toString()}>
                        {airport.code} - {airport.name}
                      </InfiniteScrollSelectItem>
                    ))}
                  </InfiniteScrollSelectContent>
                </InfiniteScrollSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-arrivalAirport">Sân bay đến *</Label>
                <InfiniteScrollSelect value={editForm.arrivalAirportId} onValueChange={(value) => setEditForm(prev => ({...prev, arrivalAirportId: value}))}>
                  <InfiniteScrollSelectTrigger>
                    <InfiniteScrollSelectValue placeholder="Chọn sân bay đến" />
                  </InfiniteScrollSelectTrigger>
                  <InfiniteScrollSelectContent
                    searchPlaceholder="Tìm sân bay đến..."
                    onSearchChange={handleAirportSearch}
                    onLoadMore={loadMoreAirports}
                    hasMore={hasMoreAirports}
                    loading={loadingMoreAirports}
                    searchValue={airportSearchTerm}
                  >
                    {airports.map((airport) => (
                      <InfiniteScrollSelectItem key={airport.id} value={airport.id.toString()}>
                        {airport.code} - {airport.name}
                      </InfiniteScrollSelectItem>
                    ))}
                  </InfiniteScrollSelectContent>
                </InfiniteScrollSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-baseDuration">Thời gian bay (phút)</Label>
                <Input
                  id="edit-baseDuration"
                  type="number"
                  placeholder="120"
                  value={editForm.baseDurationMinutes}
                  onChange={(e) => setEditForm(prev => ({...prev, baseDurationMinutes: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Trạng thái chuyến bay</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({...prev, status: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="ON_TIME">Đúng giờ</SelectItem>
                    <SelectItem value="DELAYED">Tạm hoãn</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-flight-images">Hình ảnh chuyến bay</Label>
                <MediaSelector
                  value={editingFlightImages}
                  onChange={setEditingFlightImages}
                  maxSelection={10}
                  folder="flights"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              setEditingFlightImages([])
            }}>
              Hủy
            </Button>
            <Button
              disabled={submitting || loadingFormData}
              onClick={handleEditFlight}
            >
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
