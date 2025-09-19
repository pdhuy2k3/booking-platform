"use client"

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useBooking } from '@/contexts/booking-context'

interface BookingConfirmationProps {
  onNewBooking: () => void
  onViewBookings: () => void
}

export function BookingConfirmation({ onNewBooking, onViewBookings }: BookingConfirmationProps) {
  const { bookingResponse, bookingStatus } = useBooking()
  const router = useRouter()

  const status = useMemo(() => {
    const value = bookingStatus?.status || bookingResponse?.status || 'PROCESSING'
    return value.toUpperCase()
  }, [bookingResponse?.status, bookingStatus?.status])

  const message = bookingStatus?.message || bookingResponse?.message ||
    (status === 'CONFIRMED'
      ? 'Booking confirmed successfully!'
      : status === 'PENDING'
        ? 'Inventory locked, finalizing your booking.'
        : 'Processing your booking...')

  const estimatedCompletion = bookingStatus?.estimatedCompletion
  const lastUpdated = bookingStatus?.lastUpdated

  const isSuccess = status === 'CONFIRMED' || status === 'PAID'
  const isProcessing = ['VALIDATION_PENDING', 'PENDING', 'PAYMENT_PENDING'].includes(status)
  const isError = status === 'PAYMENT_FAILED' || status === 'VALIDATION_FAILED' || status === 'FAILED' || status === 'ERROR' || status === 'REJECTED'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Confirmation</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="flex justify-center">
          <Badge variant="outline" className="uppercase tracking-wide">
            {status}
          </Badge>
        </div>

        {isProcessing && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Processing Your Booking</h3>
              <p className="text-muted-foreground">{message}</p>
              {estimatedCompletion && (
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated completion: {estimatedCompletion}
                </p>
              )}
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="space-y-4">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">{message}</p>
              {bookingResponse?.bookingReference && (
                <p className="mt-2 font-medium">
                  Booking Reference: {bookingResponse.bookingReference}
                </p>
              )}
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">Updated: {new Date(lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {isError && (
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Booking Failed</h3>
              <p className="text-muted-foreground">
                {message || 'There was an error processing your booking.'}
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">Updated: {new Date(lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {!isProcessing && !isSuccess && !isError && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Updating Booking</h3>
              <p className="text-muted-foreground">{message}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button
            onClick={() => {
              onViewBookings()
              router.push('/dashboard#bookings')
            }}
            variant="outline"
          >
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
