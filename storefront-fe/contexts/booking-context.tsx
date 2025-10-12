"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { bookingService, type StorefrontBookingRequest, type StorefrontBookingResponse, type BookingStatusResponse } from '@/modules/booking/service'
import { useToast } from '@/hooks/use-toast'
import type { BookingHistoryItemDto, FlightBookingDetails, HotelBookingDetails, ComboBookingDetails } from '@/modules/booking/types'

// Types
type BookingStep = 'selection' | 'passengers' | 'review' | 'payment' | 'confirmation' | 'error'
type BookingType = 'flight' | 'hotel' | 'both'

interface SelectedFlight {
  id: string
  flightNumber?: string
  airline: string
  origin: string
  destination: string
  originLatitude?: number
  originLongitude?: number
  destinationLatitude?: number
  destinationLongitude?: number
  departureTime: string
  arrivalTime: string
  duration?: string
  price: number
  currency: string
  seatClass?: string
  logo?: string
  scheduleId?: string
  fareId?: string
}

interface SelectedHotel {
  id: string
  name: string
  address: string
  city: string
  country: string
  hotelLatitude?: number
  hotelLongitude?: number
  rating?: number
  roomTypeId: string
  roomId: string
  roomType: string
  roomName: string
  price: number // deprecated: kept for compatibility (represents price per night)
  pricePerNight: number
  totalPrice?: number
  currency: string
  amenities: string[]
  image?: string
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  rooms?: number
  nights?: number
}

interface ResumeBookingPayload {
  booking: BookingHistoryItemDto
  productDetails?: FlightBookingDetails | HotelBookingDetails | ComboBookingDetails | null
}

interface BookingState {
  step: BookingStep
  bookingType: BookingType | null
  bookingData: Partial<StorefrontBookingRequest>
  bookingResponse: StorefrontBookingResponse | null
  isLoading: boolean
  isStatusPolling: boolean
  error: string | null
  selectedFlight: SelectedFlight | null
  selectedHotel: SelectedHotel | null
  bookingStatus: BookingStatusResponse | null
}

interface BookingContextType extends BookingState {
  setBookingType: (type: BookingType) => void
  updateBookingData: (data: Partial<StorefrontBookingRequest>) => void
  nextStep: () => void
  prevStep: () => void
  createBooking: () => Promise<void>
  resetBooking: () => void
  setError: (error: string | null) => void
  setStep: (step: BookingStep) => void
  setSelectedFlight: (flight: SelectedFlight | null) => void
  setSelectedHotel: (hotel: SelectedHotel | null) => void
  refreshBookingStatus: () => Promise<void>
  cancelInFlightBooking: () => Promise<void>
  resumeBooking: (payload: ResumeBookingPayload) => Promise<void>
}

// Initial state
const initialState: BookingState = {
  step: 'selection',
  bookingType: null,
  bookingData: {},
  bookingResponse: null,
  isLoading: false,
  isStatusPolling: false,
  error: null,
  selectedFlight: null,
  selectedHotel: null,
  bookingStatus: null
}

// Actions
type BookingAction =
  | { type: 'SET_BOOKING_TYPE'; payload: BookingType }
  | { type: 'UPDATE_BOOKING_DATA'; payload: Partial<StorefrontBookingRequest> }
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOOKING_RESPONSE'; payload: StorefrontBookingResponse }
  | { type: 'SET_BOOKING_STATUS'; payload: BookingStatusResponse | null }
  | { type: 'SET_STATUS_POLLING'; payload: boolean }
  | { type: 'SET_SELECTED_FLIGHT'; payload: SelectedFlight | null }
  | { type: 'SET_SELECTED_HOTEL'; payload: SelectedHotel | null }
  | { type: 'RESET_BOOKING' }

// Reducer
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_BOOKING_TYPE':
      return {
        ...state,
        bookingType: action.payload
      }
    case 'UPDATE_BOOKING_DATA':
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload
        }
      }
    case 'SET_STEP':
      return {
        ...state,
        step: action.payload
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        step: action.payload ? 'error' : state.step
      }
    case 'SET_BOOKING_RESPONSE':
      return {
        ...state,
        bookingResponse: action.payload
      }
    case 'SET_BOOKING_STATUS':
      return {
        ...state,
        bookingStatus: action.payload
      }
    case 'SET_STATUS_POLLING':
      return {
        ...state,
        isStatusPolling: action.payload
      }
    case 'SET_SELECTED_FLIGHT':
      return {
        ...state,
        selectedFlight: action.payload
      }
    case 'SET_SELECTED_HOTEL':
      return {
        ...state,
        selectedHotel: action.payload
      }
    case 'RESET_BOOKING':
      return initialState
    default:
      return state
  }
}

// Context
const BookingContext = createContext<BookingContextType | undefined>(undefined)

// Provider
export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)
  const { toast } = useToast()
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null)

  const setBookingType = useCallback((type: BookingType) => {
    dispatch({ type: 'SET_BOOKING_TYPE', payload: type })
  }, [])

  const updateBookingData = useCallback((data: Partial<StorefrontBookingRequest>) => {
    dispatch({ type: 'UPDATE_BOOKING_DATA', payload: data })
  }, [])

  const setStep = useCallback((step: BookingStep) => {
    dispatch({ type: 'SET_STEP', payload: step })
  }, [])

  const setSelectedFlight = useCallback((flight: SelectedFlight | null) => {
    dispatch({ type: 'SET_SELECTED_FLIGHT', payload: flight })
  }, [])

  const setSelectedHotel = useCallback((hotel: SelectedHotel | null) => {
    dispatch({ type: 'SET_SELECTED_HOTEL', payload: hotel })
  }, [])

  const nextStep = useCallback(() => {
    const steps: BookingStep[] = ['selection', 'passengers', 'review', 'payment', 'confirmation']
    const currentIndex = steps.indexOf(state.step)
    if (currentIndex < steps.length - 1) {
      dispatch({ type: 'SET_STEP', payload: steps[currentIndex + 1] as BookingStep })
    }
  }, [state.step])

  const prevStep = useCallback(() => {
    const steps: BookingStep[] = ['selection', 'passengers', 'review', 'payment', 'confirmation']
    const currentIndex = steps.indexOf(state.step)
    if (currentIndex > 0) {
      dispatch({ type: 'SET_STEP', payload: steps[currentIndex - 1] as BookingStep })
    }
  }, [state.step])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const stopStatusPolling = useCallback(() => {
    if (statusPollingRef.current) {
      clearTimeout(statusPollingRef.current)
      statusPollingRef.current = null
    }
    dispatch({ type: 'SET_STATUS_POLLING', payload: false })
  }, [])

  const pollBookingStatus = useCallback(async (bookingIdParam?: string) => {
    const bookingId = bookingIdParam || state.bookingResponse?.bookingId
    if (!bookingId) return

    dispatch({ type: 'SET_STATUS_POLLING', payload: true })

    try {
      const statusResponse = await bookingService.getStatus(bookingId)
      dispatch({ type: 'SET_BOOKING_STATUS', payload: statusResponse })

      const pendingStatuses = new Set(['VALIDATION_PENDING', 'PENDING', 'PAYMENT_PENDING'])
      const successStatuses = new Set(['CONFIRMED', 'PAID'])
      const failureStatuses = new Set(['FAILED', 'PAYMENT_FAILED', 'CANCELLED', 'CANCELED', 'VALIDATION_FAILED', 'REJECTED'])

      if (successStatuses.has(statusResponse.status)) {
        stopStatusPolling()
        dispatch({ type: 'SET_STEP', payload: 'confirmation' })
      } else if (failureStatuses.has(statusResponse.status)) {
        stopStatusPolling()
        dispatch({ type: 'SET_ERROR', payload: statusResponse.message || 'Booking failed. Please try again.' })
      } else if (pendingStatuses.has(statusResponse.status)) {
        if (statusPollingRef.current) {
          clearTimeout(statusPollingRef.current)
        }
        statusPollingRef.current = setTimeout(() => {
          void pollBookingStatus(bookingId)
        }, 5000)
      } else {
        // Unknown status - stop polling to avoid infinite loop
        stopStatusPolling()
      }
    } catch (error) {
      console.error('Booking status polling error:', error)
      stopStatusPolling()
      dispatch({ type: 'SET_ERROR', payload: 'Unable to retrieve booking status. Please try again.' })
    }
  }, [state.bookingResponse?.bookingId, stopStatusPolling])

  const refreshBookingStatus = useCallback(async () => {
    await pollBookingStatus()
  }, [pollBookingStatus])

  const createBooking = useCallback(async () => {
    if (!state.bookingData.bookingType || !state.bookingData.productDetails) {
      dispatch({ type: 'SET_ERROR', payload: 'Missing required booking information' })
      return
    }

    stopStatusPolling()
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const request: StorefrontBookingRequest = {
        bookingType: state.bookingData.bookingType,
        totalAmount: state.bookingData.totalAmount || 0,
        currency: state.bookingData.currency || 'VND',
        productDetails: state.bookingData.productDetails,
        notes: state.bookingData.notes
      }

      const response = await bookingService.create(request)
      
      if (response.error) {
        throw new Error(response.error)
      }

      dispatch({ type: 'SET_BOOKING_RESPONSE', payload: response })
      dispatch({ type: 'SET_BOOKING_STATUS', payload: null })
      dispatch({ type: 'SET_STEP', payload: 'payment' })
      if (response.bookingId) {
        if (statusPollingRef.current) {
          clearTimeout(statusPollingRef.current)
        }
        void pollBookingStatus(response.bookingId)
      }
      
      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created.",
      })
    } catch (error: any) {
      console.error('Booking creation error:', error)
      const errorMessage = error.message || 'Failed to create booking. Please try again.'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.bookingData, toast, pollBookingStatus, stopStatusPolling])

  const resetBooking = useCallback(() => {
    stopStatusPolling()
    stopStatusPolling()
    dispatch({ type: 'RESET_BOOKING' })
  }, [stopStatusPolling])

  const cancelInFlightBooking = useCallback(async () => {
    const bookingId = state.bookingResponse?.bookingId
    if (!bookingId) {
      resetBooking()
      return
    }

    try {
      await bookingService.cancel(bookingId, 'User cancelled before completion')
      await pollBookingStatus(bookingId)
    } catch (error) {
      console.error('Booking cancellation error:', error)
    } finally {
      resetBooking()
    }
  }, [pollBookingStatus, resetBooking, state.bookingResponse?.bookingId])

  const resumeBooking = useCallback(async (payload: ResumeBookingPayload) => {
    const booking = payload.booking
    if (!booking) {
      return
    }

    const parseProductDetails = (json?: string | null) => {
      if (!json) return null
      try {
        return JSON.parse(json)
      } catch (error) {
        console.warn('Failed to parse stored booking product details', error)
        return null
      }
    }

    const parsedDetails = payload.productDetails ?? parseProductDetails(booking.productDetailsJson)
    const totalAmount = typeof booking.totalAmount === 'string'
      ? Number(booking.totalAmount)
      : Number(booking.totalAmount ?? 0)
    const currency = booking.currency ?? 'VND'

    dispatch({ type: 'RESET_BOOKING' })

    const contextType: BookingType = booking.bookingType === 'COMBO'
      ? 'both'
      : booking.bookingType === 'FLIGHT'
        ? 'flight'
        : 'hotel'

    setBookingType(contextType)
    updateBookingData({
      bookingType: booking.bookingType,
      totalAmount,
      currency,
      productDetails: parsedDetails ?? undefined,
    })

    if (booking.bookingType === 'FLIGHT' || booking.bookingType === 'COMBO') {
      const flightDetails = booking.bookingType === 'COMBO'
        ? (parsedDetails as ComboBookingDetails | null)?.flightDetails
        : (parsedDetails as FlightBookingDetails | null)

      if (flightDetails) {
        setSelectedFlight({
          id: flightDetails.flightId,
          flightNumber: flightDetails.flightNumber,
          airline: flightDetails.airline,
          origin: flightDetails.originAirport,
          destination: flightDetails.destinationAirport,
          originLatitude: flightDetails.originLatitude,
          originLongitude: flightDetails.originLongitude,
          destinationLatitude: flightDetails.destinationLatitude,
          destinationLongitude: flightDetails.destinationLongitude,
          departureTime: flightDetails.departureDateTime,
          arrivalTime: flightDetails.arrivalDateTime,
          duration: undefined,
          price: flightDetails.totalFlightPrice,
          currency,
          seatClass: flightDetails.seatClass,
          scheduleId: flightDetails.scheduleId,
          fareId: flightDetails.fareId,
        })
      } else {
        setSelectedFlight(null)
      }
    } else {
      setSelectedFlight(null)
    }

    if (booking.bookingType === 'HOTEL' || booking.bookingType === 'COMBO') {
      const hotelDetails = booking.bookingType === 'COMBO'
        ? (parsedDetails as ComboBookingDetails | null)?.hotelDetails
        : (parsedDetails as HotelBookingDetails | null)

      if (hotelDetails) {
        setSelectedHotel({
          id: hotelDetails.hotelId,
          name: hotelDetails.hotelName,
          address: hotelDetails.hotelAddress,
          city: hotelDetails.city,
          country: hotelDetails.country,
          hotelLatitude: hotelDetails.hotelLatitude,
          hotelLongitude: hotelDetails.hotelLongitude,
          rating: hotelDetails.starRating,
          roomTypeId: String(hotelDetails.roomTypeId ?? ''),
          roomId: hotelDetails.roomId ?? '',
          roomType: hotelDetails.roomType,
          roomName: hotelDetails.roomName,
          price: hotelDetails.pricePerNight,
          pricePerNight: hotelDetails.pricePerNight,
          totalPrice: hotelDetails.totalRoomPrice,
          currency,
          amenities: hotelDetails.amenities ?? [],
          image: undefined,
          checkInDate: hotelDetails.checkInDate,
          checkOutDate: hotelDetails.checkOutDate,
          guests: hotelDetails.numberOfGuests,
          rooms: hotelDetails.numberOfRooms,
          nights: hotelDetails.numberOfNights,
        })
      } else {
        setSelectedHotel(null)
      }
    } else {
      setSelectedHotel(null)
    }

    const response: StorefrontBookingResponse = {
      bookingId: booking.bookingId,
      bookingReference: booking.bookingReference,
      sagaId: booking.sagaId ?? booking.bookingId,
      status: booking.status,
    }

    dispatch({ type: 'SET_BOOKING_RESPONSE', payload: response })
    dispatch({ type: 'SET_BOOKING_STATUS', payload: null })

    // Set the correct step based on booking status
    const nextStep = booking.status === 'PAYMENT_PENDING' ? 'payment' : 'review'
    setStep(nextStep as BookingStep)

    if (booking.bookingId) {
      await pollBookingStatus(booking.bookingId)
    }
  }, [pollBookingStatus, setBookingType, setSelectedFlight, setSelectedHotel, setStep, updateBookingData, stopStatusPolling])

  const value = {
    ...state,
    setBookingType,
    updateBookingData,
    nextStep,
    prevStep,
    createBooking,
    resetBooking,
    setError,
    setStep,
    setSelectedFlight,
    setSelectedHotel,
    refreshBookingStatus,
    cancelInFlightBooking,
    resumeBooking,
  }

  useEffect(() => {
    return () => {
      if (statusPollingRef.current) {
        clearTimeout(statusPollingRef.current)
      }
    }
  }, [])

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

// Hook
export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
