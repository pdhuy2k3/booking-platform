"use client"

import { useBooking } from "@/common/contexts/booking-context"
import { BookingStep } from "@/modules/booking/types"
import { Search, CheckCircle, User, CreditCard, CheckCircle2 } from "lucide-react"

const steps = [
  {
    step: "SEARCH" as BookingStep,
    label: "Search",
    icon: Search
  },
  {
    step: "SELECT" as BookingStep,
    label: "Select",
    icon: CheckCircle
  },
  {
    step: "DETAILS" as BookingStep,
    label: "Details",
    icon: User
  },
  {
    step: "PAYMENT" as BookingStep,
    label: "Payment",
    icon: CreditCard
  },
  {
    step: "CONFIRMATION" as BookingStep,
    label: "Confirmation",
    icon: CheckCircle2
  }
]

export function BookingProgress() {
  const { state } = useBooking()
  
  const currentStepIndex = steps.findIndex(s => s.step === state.step)

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex
          const isCompleted = index < currentStepIndex
          const isDisabled = index > currentStepIndex
          
          return (
            <div key={step.step} className="flex items-center">
              {/* Step Circle */}
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
                ${isActive 
                  ? 'border-blue-500 bg-blue-500 text-white' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }
              `}>
                <step.icon className="w-5 h-5" />
              </div>
              
              {/* Step Label */}
              <div className={`
                ml-3 text-sm font-medium
                ${isActive 
                  ? 'text-blue-600' 
                  : isCompleted 
                    ? 'text-green-600'
                    : 'text-gray-400'
                }
              `}>
                {step.label}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-0.5 mx-4 transition-all duration-200
                  ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
