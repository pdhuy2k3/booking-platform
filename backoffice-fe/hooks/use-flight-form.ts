import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { FlightService } from "@/services/flight-service"
import type { Flight } from "@/types/api"

interface FlightFormData {
  flightNumber: string
  airlineId: string
  departureAirportId: string
  arrivalAirportId: string
  aircraftType: string
  status: string
  isActive: boolean
}

interface UseFlightFormProps {
  onFlightAdded?: () => void
  onFlightUpdated?: () => void
  onFlightDeleted?: () => void
}

export const useFlightForm = ({ onFlightAdded, onFlightUpdated, onFlightDeleted }: UseFlightFormProps = {}) => {
  // Form state for add flight
  const [addForm, setAddForm] = useState<FlightFormData>({
    flightNumber: '',
    airlineId: '',
    departureAirportId: '',
    arrivalAirportId: '',
    aircraftType: '',
    status: 'ACTIVE',
    isActive: true
  })

  // Form state for edit flight
  const [editForm, setEditForm] = useState<FlightFormData>({
    flightNumber: '',
    airlineId: '',
    departureAirportId: '',
    arrivalAirportId: '',
    aircraftType: '',
    status: 'ACTIVE',
    isActive: true
  })

  const [submitting, setSubmitting] = useState(false)

  // Reset add form
  const resetAddForm = () => {
    setAddForm({
      flightNumber: '',
      airlineId: '',
      departureAirportId: '',
      arrivalAirportId: '',
      aircraftType: '',
      status: 'ACTIVE',
      isActive: true
    })
  }

  // Populate edit form with selected flight data
  const populateEditForm = (flight: Flight) => {
    const editFormData = {
      flightNumber: flight.flightNumber || '',
      airlineId: flight.airlineId?.toString() || flight.airline?.airlineId?.toString() || '',
      departureAirportId: flight.departureAirportId?.toString() || flight.departureAirport?.airportId?.toString() || '',
      arrivalAirportId: flight.arrivalAirportId?.toString() || flight.arrivalAirport?.airportId?.toString() || '',
      aircraftType: flight.aircraftType || '',
      status: flight.status || 'ACTIVE',
      isActive: flight.isActive ?? true
    }
    
    setEditForm(editFormData)
  }

  // Validate flight form
  const validateFlightForm = (form: FlightFormData) => {
    // Basic validation
    if (!form.flightNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã chuyến bay.",
        variant: "destructive",
      })
      return false
    }
    
    if (!form.airlineId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn hãng hàng không.",
        variant: "destructive",
      })
      return false
    }
    
    if (!form.departureAirportId || !form.arrivalAirportId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn sân bay đi và đến.",
        variant: "destructive",
      })
      return false
    }
    
    if (form.departureAirportId === form.arrivalAirportId) {
      toast({
        title: "Lỗi",
        description: "Sân bay đi và đến không thể giống nhau.",
        variant: "destructive",
      })
      return false
    }
    
    return true
  }

  // Handle add flight
  const handleAddFlight = async () => {
    if (!validateFlightForm(addForm)) {
      return
    }

    try {
      setSubmitting(true)

      const newFlight = {
        flightNumber: addForm.flightNumber.trim(),
        airlineId: parseInt(addForm.airlineId),
        departureAirportId: parseInt(addForm.departureAirportId),
        arrivalAirportId: parseInt(addForm.arrivalAirportId),
        aircraftType: addForm.aircraftType.trim() || undefined,
        status: addForm.status,
      }

      await FlightService.createFlight(newFlight)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được thêm thành công.",
      })

      resetAddForm()
      onFlightAdded?.()
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
  const handleEditFlight = async (selectedFlight: Flight | null) => {
    if (!selectedFlight) return
    
    if (!validateFlightForm(editForm)) {
      return
    }

    try {
      setSubmitting(true)

      const updatedFlight = {
        flightNumber: editForm.flightNumber.trim(),
        airlineId: parseInt(editForm.airlineId),
        departureAirportId: parseInt(editForm.departureAirportId),
        arrivalAirportId: parseInt(editForm.arrivalAirportId),
        aircraftType: editForm.aircraftType.trim() || undefined,
        status: editForm.status,
      }

      await FlightService.updateFlight(selectedFlight.flightId || selectedFlight.id!, updatedFlight)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được cập nhật thành công.",
      })

      onFlightUpdated?.()
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
  const handleDeleteFlight = async (selectedFlight: Flight | null) => {
    if (!selectedFlight) return

    try {
      setSubmitting(true)
      await FlightService.deleteFlight(selectedFlight.flightId || selectedFlight.id!)
      
      toast({
        title: "Thành công",
        description: "Chuyến bay đã được xóa thành công.",
      })

      onFlightDeleted?.()
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

  return {
    // Form states
    addForm,
    setAddForm,
    editForm,
    setEditForm,
    
    // Form handlers
    resetAddForm,
    populateEditForm,
    
    // Submission states
    submitting,
    setSubmitting,
    
    // Form handlers
    handleAddFlight,
    handleEditFlight,
    handleDeleteFlight,
    
    // Validation
    validateFlightForm
  }
}