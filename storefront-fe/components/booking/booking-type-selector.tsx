"use client"

import { useBooking } from "@/lib/booking-context"
import { BookingType,BookingStep } from "@/types/booking"
import { Plane, Building, Package, Bus, Train } from "lucide-react"

const bookingTypes = [
  {
    type: BookingType.FLIGHT,
    label: "Flight Only",
    icon: Plane,
    description: "Book flights only"
  },
  {
    type: BookingType.HOTEL,
    label: "Hotel Only", 
    icon: Building,
    description: "Book hotels only"
  },
  {
    type: BookingType.COMBO,
    label: "Flight + Hotel",
    icon: Package,
    description: "Book flight and hotel together"
  },
  {
    type: BookingType.BUS,
    label: "Bus",
    icon: Bus,
    description: "Book bus tickets"
  },
  {
    type: BookingType.TRAIN,
    label: "Train",
    icon: Train,
    description: "Book train tickets"
  }
]

export function BookingTypeSelector() {
  const { state, setBookingType, setStep } = useBooking()

  const handleTypeChange = (type: BookingType) => {
    setBookingType(type)
    setStep(BookingStep.SEARCH)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Booking Type</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {bookingTypes.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`
              p-4 rounded-lg border-2 transition-all duration-200 text-center
              ${state.bookingType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }
            `}
          >
            <Icon className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium text-sm">{label}</div>
            <div className="text-xs text-gray-500 mt-1">{description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
