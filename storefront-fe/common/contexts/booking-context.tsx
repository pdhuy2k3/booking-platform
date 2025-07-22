"use client"

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { BookingFlowState, BookingStep, BookingType, FlightSearchRequest, HotelSearchRequest, FlightSearchResult, HotelSearchResult, RoomInfo, PassengerInfo } from '@/modules/booking/types'

// Initial state
const initialState: BookingFlowState = {
  step: "SEARCH" as BookingStep,
  bookingType: "FLIGHT" as BookingType,
  totalAmount: 0,
  currency: "VND"
}

// Action types
type BookingAction = 
  | { type: 'SET_BOOKING_TYPE'; payload: BookingType }
  | { type: 'SET_STEP'; payload: BookingStep }
  | { type: 'SET_FLIGHT_SEARCH'; payload: FlightSearchRequest }
  | { type: 'SET_HOTEL_SEARCH'; payload: HotelSearchRequest }
  | { type: 'SET_SELECTED_FLIGHT'; payload: FlightSearchResult }
  | { type: 'SET_SELECTED_HOTEL'; payload: HotelSearchResult }
  | { type: 'SET_SELECTED_ROOM'; payload: RoomInfo }
  | { type: 'SET_PASSENGERS'; payload: PassengerInfo[] }
  | { type: 'SET_TOTAL_AMOUNT'; payload: number }
  | { type: 'RESET_BOOKING' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }

// Reducer
function bookingReducer(state: BookingFlowState, action: BookingAction): BookingFlowState {
  switch (action.type) {
    case 'SET_BOOKING_TYPE':
      return { ...state, bookingType: action.payload }
    
    case 'SET_STEP':
      return { ...state, step: action.payload }
    
    case 'SET_FLIGHT_SEARCH':
      return { ...state, flightSearch: action.payload }
    
    case 'SET_HOTEL_SEARCH':
      return { ...state, hotelSearch: action.payload }
    
    case 'SET_SELECTED_FLIGHT':
      return { 
        ...state, 
        selectedFlight: action.payload,
        totalAmount: state.bookingType === "COMBO" 
          ? state.totalAmount + action.payload.price 
          : action.payload.price
      }
    
    case 'SET_SELECTED_HOTEL':
      return { ...state, selectedHotel: action.payload }
    
    case 'SET_SELECTED_ROOM':
      const nights = state.hotelSearch ? 
        Math.ceil((new Date(state.hotelSearch.checkOutDate).getTime() - new Date(state.hotelSearch.checkInDate).getTime()) / (1000 * 60 * 60 * 24)) : 1
      const hotelTotal = action.payload.pricePerNight * nights * (state.hotelSearch?.rooms || 1)
      
      return { 
        ...state, 
        selectedRoom: action.payload,
        totalAmount: state.bookingType === "COMBO" 
          ? (state.selectedFlight?.price || 0) + hotelTotal
          : hotelTotal
      }
    
    case 'SET_PASSENGERS':
      return { ...state, passengers: action.payload }
    
    case 'SET_TOTAL_AMOUNT':
      return { ...state, totalAmount: action.payload }
    
    case 'NEXT_STEP':
      const steps: BookingStep[] = [BookingStep.SEARCH, BookingStep.SELECT, BookingStep.DETAILS, BookingStep.PAYMENT, BookingStep.CONFIRMATION]
      const currentIndex = steps.indexOf(state.step)
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1)
      return { ...state, step: steps[nextIndex] }
    
    case 'PREV_STEP':
      const prevSteps: BookingStep[] = [BookingStep.SEARCH, BookingStep.SELECT, BookingStep.DETAILS, BookingStep.PAYMENT, BookingStep.CONFIRMATION]
      const prevCurrentIndex = prevSteps.indexOf(state.step)
      const prevIndex = Math.max(prevCurrentIndex - 1, 0)
      return { ...state, step: prevSteps[prevIndex] }
    
    case 'RESET_BOOKING':
      return initialState
    
    default:
      return state
  }
}

// Context
interface BookingContextType {
  state: BookingFlowState
  dispatch: React.Dispatch<BookingAction>
  // Helper functions
  setBookingType: (type: BookingType) => void
  setStep: (step: BookingStep) => void
  nextStep: () => void
  prevStep: () => void
  resetBooking: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

// Provider component
interface BookingProviderProps {
  children: ReactNode
}

export function BookingProvider({ children }: BookingProviderProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const contextValue: BookingContextType = {
    state,
    dispatch,
    setBookingType: (type: BookingType) => dispatch({ type: 'SET_BOOKING_TYPE', payload: type }),
    setStep: (step: BookingStep) => dispatch({ type: 'SET_STEP', payload: step }),
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    resetBooking: () => dispatch({ type: 'RESET_BOOKING' })
  }

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  )
}

// Hook to use booking context
export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}

// Helper hook for booking validation
export function useBookingValidation() {
  const { state } = useBooking()

  const canProceedToSelect = () => {
    if (state.bookingType === "FLIGHT") {
      return !!state.flightSearch
    }
    if (state.bookingType === "HOTEL") {
      return !!state.hotelSearch
    }
    if (state.bookingType === "COMBO") {
      return !!(state.flightSearch && state.hotelSearch)
    }
    return false
  }

  const canProceedToDetails = () => {
    if (state.bookingType === "FLIGHT") {
      return !!state.selectedFlight
    }
    if (state.bookingType === "HOTEL") {
      return !!(state.selectedHotel && state.selectedRoom)
    }
    if (state.bookingType === "COMBO") {
      return !!(state.selectedFlight && state.selectedHotel && state.selectedRoom)
    }
    return false
  }

  const canProceedToPayment = () => {
    return !!(state.passengers && state.passengers.length > 0 && state.totalAmount > 0)
  }

  return {
    canProceedToSelect,
    canProceedToDetails,
    canProceedToPayment
  }
}
