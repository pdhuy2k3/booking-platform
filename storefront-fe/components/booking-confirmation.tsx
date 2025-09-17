"use client"

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"
import { useBooking } from '@/contexts/booking-context'
import { bookingService } from '@/modules/booking/service'

interface BookingConfirmationProps {
  onNewBooking: () => void
  onViewBookings: () => void
}

export function BookingConfirmation({ onNewBooking, onViewBookings }: BookingConfirmationProps) {
  const { bookingResponse } = useBooking()
  const [status, setStatus] = useState<string>('processing')
  const [message, setMessage] = useState<string>('Processing your booking...')
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('')

  useEffect(() => {
    if (bookingResponse?.bookingId) {
      // Start polling for booking status
      const pollStatus = async () => {
        try {
          const bookingId = bookingResponse.bookingId;
          if (bookingId) {
            const statusResponse = await bookingService.getStatus(bookingId)
            setStatus(statusResponse.status)
            setMessage(statusResponse.message || 'Processing your booking...')
            setEstimatedCompletion(statusResponse.estimatedCompletion || '')
            
            // Continue polling if booking is still processing
            if (['VALIDATION_PENDING', 'PENDING', 'PAYMENT_PENDING'].includes(statusResponse.status)) {
              setTimeout(pollStatus, 5000) // Poll every 5 seconds
            }
          }
        } catch (error) {
          console.error('Error polling booking status:', error)
          setStatus('error')
          setMessage('Error checking booking status')
        }
      }
      
      pollStatus()
    }
  }, [bookingResponse?.bookingId])

  const isSuccess = status === 'CONFIRMED' || status === 'PAID'
  const isProcessing = ['VALIDATION_PENDING', 'PENDING', 'PAYMENT_PENDING'].includes(status)
  const isError = status === 'PAYMENT_FAILED' || status === 'VALIDATION_FAILED' || status === 'FAILED' || status === 'error'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Confirmation</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        {isProcessing && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Processing Your Booking</h3>
              <p className="text-muted-foreground">{message}</p>
              {estimatedCompletion && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated completion: {estimatedCompletion}
                </p>
              )}
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your booking has been successfully confirmed.
              </p>
              {bookingResponse?.bookingReference && (
                <p className="mt-2 font-medium">
                  Booking Reference: {bookingResponse.bookingReference}
                </p>
              )}
            </div>
          </>
        )}

        {isError && (
          <div>
            <div className="h-12 w-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-500 font-bold text-xl">!</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Booking Failed</h3>
            <p className="text-muted-foreground">
              {message || 'There was an error processing your booking.'}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button onClick={onViewBookings} variant="outline">
            View My Bookings
          </Button>
          <Button onClick={onNewBooking}>
            Book Another Trip
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}