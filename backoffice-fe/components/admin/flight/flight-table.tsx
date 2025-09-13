"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import type { Flight } from "@/types/api"
import { getFlightDurationDisplay } from "@/lib/duration-utils"

interface FlightTableProps {
  flights: Flight[]
  loading: boolean
  onEdit: (flight: Flight) => void
  onView: (flight: Flight) => void
  onDelete: (flight: Flight) => void
  getStatusBadge: (status: string) => React.JSX.Element
}

export function FlightTable({
  flights,
  loading,
  onEdit,
  onView,
  onDelete,
  getStatusBadge
}: FlightTableProps) {
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Đang tải...</span>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  if (flights.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
          Không có dữ liệu
        </TableCell>
      </TableRow>
    )
  }

  return (
    <>
      {flights.map((flight) => (
        <TableRow key={flight.id}>
          <TableCell className="font-medium">{flight.flightNumber}</TableCell>
          <TableCell>{flight.airlineName || 'Chưa có thông tin'}</TableCell>
          <TableCell>
            {flight.departureAirportIataCode && flight.arrivalAirportIataCode 
              ? `${flight.departureAirportIataCode} → ${flight.arrivalAirportIataCode}`
              : 'Chưa có thông tin'
            }
          </TableCell>
          <TableCell>
            {getFlightDurationDisplay(flight)}
          </TableCell>
          <TableCell>{flight.aircraftType || 'N/A'}</TableCell>
          <TableCell>
            <Badge className={flight.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {flight.isActive ? 'Có' : 'Không'}
            </Badge>
          </TableCell>
          <TableCell>{getStatusBadge(flight.status || 'UNKNOWN')}</TableCell>
          <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(flight)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(flight)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onDelete(flight)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}