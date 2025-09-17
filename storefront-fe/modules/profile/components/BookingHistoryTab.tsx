"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plane, Building2, MapPin, Clock, CheckCircle, XCircle } from "lucide-react"

interface Booking {
  id: string
  type: "flight" | "hotel" | "transport"
  title: string
  destination: string
  date: string
  status: "confirmed" | "pending" | "cancelled"
  amount: number
  bookingReference: string
}

export function BookingHistoryTab() {
  const [bookings] = useState<Booking[]>([
    {
      id: "1",
      type: "flight",
      title: "New York to Paris",
      destination: "Paris, France",
      date: "2024-03-15",
      status: "confirmed",
      amount: 1250,
      bookingReference: "TRV-FL-001",
    },
    {
      id: "2",
      type: "hotel",
      title: "Grand Hotel Paris",
      destination: "Paris, France",
      date: "2024-03-15",
      status: "confirmed",
      amount: 450,
      bookingReference: "TRV-HT-002",
    },
    {
      id: "3",
      type: "transport",
      title: "Airport Transfer",
      destination: "CDG Airport to Hotel",
      date: "2024-03-15",
      status: "pending",
      amount: 80,
      bookingReference: "TRV-TR-003",
    },
    {
      id: "4",
      type: "flight",
      title: "Paris to London",
      destination: "London, UK",
      date: "2024-03-20",
      status: "cancelled",
      amount: 320,
      bookingReference: "TRV-FL-004",
    },
  ])

  const getBookingIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="h-5 w-5" />
      case "hotel":
        return <Building2 className="h-5 w-5" />
      case "transport":
        return <MapPin className="h-5 w-5" />
      default:
        return <Calendar className="h-5 w-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-400"
      case "pending":
        return "bg-yellow-500/10 text-yellow-400"
      case "cancelled":
        return "bg-red-500/10 text-red-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Booking History</CardTitle>
          <CardDescription>View and manage your travel bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Bookings Yet</h3>
              <p className="text-gray-400 mb-4">Start planning your next trip to see your bookings here</p>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <Plane className="h-4 w-4 mr-2" />
                Start Planning
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-cyan-400">
                      {getBookingIcon(booking.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium">{booking.title}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{booking.destination}</p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(booking.date)} • {booking.bookingReference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{formatAmount(booking.amount)}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        View Details
                      </Button>
                      {booking.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 hover:bg-red-500/10 text-red-400"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
