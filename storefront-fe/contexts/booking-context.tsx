"use client"

import React, { createContext, useContext, useReducer, useState, useEffect, useCallback } from 'react'
import { bookingService, type StorefrontBookingRequest, type StorefrontBookingResponse } from '@/modules/booking/service'
import { useToast } from '@/hooks/use-toast'

// Types
type BookingStep = 'selection' | 'passengers' | 'review' | 'payment' | 'confirmation' | 'error'
type BookingType = 'flight' | 'hotel' | 'both'

interface SelectedFlight {
  id: string
  flightNumber?: string
  airline: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration?: string
  price: number
  currency: string
  seatClass?: string
  logo?: string
}

interface SelectedHotel {
  id: string
  name: string
  address: string
  city: string
  country: string
  rating?: number
  roomId: string
  roomType: string
  roomName: string
  price: number
  currency: string
  amenities: string[]
  image?: string
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  rooms?: number
  nights?: number
}

interface BookingState {
  step: BookingStep
  bookingType: BookingType | null
  bookingData: Partial<StorefrontBookingRequest>
  bookingResponse: StorefrontBookingResponse | null
  isLoading: boolean
  error: string | null
  selectedFlight: SelectedFlight | null
  selectedHotel: SelectedHotel | null
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
}

// Initial state
const initialState: BookingState = {
  step: 'selection',
  bookingType: null,
  bookingData: {},
  bookingResponse: null,
  isLoading: false,
  error: null,
  selectedFlight: null,
  selectedHotel: null
}

// Actions
type BookingAction =
  | { type: 'SET_BOOKING_TYPE'; payload: BookingType }
  | { type: 'UPDATE_BOOKING_DATA'; payload: Partial<StorefrontBookingRequest> }
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_BOOKING_RESPONSE'; payload: StorefrontBookingResponse }
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

  const createBooking = useCallback(async () => {
    if (!state.bookingData.bookingType || !state.bookingData.productDetails) {
      dispatch({ type: 'SET_ERROR', payload: 'Missing required booking information' })
      return
    }

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
      dispatch({ type: 'SET_STEP', payload: 'confirmation' })
      
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
  }, [state.bookingData, toast])

  const resetBooking = useCallback(() => {
    dispatch({ type: 'RESET_BOOKING' })
  }, [])

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
    setSelectedHotel
  }

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

