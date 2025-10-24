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
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    size: number;
  };
  loading: boolean
  onPageChange: (page: number) => void
  onEdit: (flight: Flight) => void
  onView: (flight: Flight) => void
  onDelete: (flight: Flight) => void
  getStatusBadge: (status: string) => React.JSX.Element
}

export function FlightTable({
  flights,
  pagination,
  loading,
  onPageChange,
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
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <TableRow>
          <TableCell colSpan={7} className="px-0 py-4">
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-gray-700">
                Hiển thị {pagination.currentPage * pagination.size + 1} -{" "}
                {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)} của{" "}
                {pagination.totalElements} kết quả
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  className={`px-3 py-1 rounded-md text-sm ${
                    pagination.currentPage === 0
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Trước
                </button>
                
                <div className="flex space-x-1">
                  {(() => {
                    // Calculate which page numbers to show
                    const pageNumbers = [];
                    const totalPages = pagination.totalPages;
                    const currentPage = pagination.currentPage;
                    
                    if (totalPages <= 5) {
                      // Show all pages if total pages <= 5
                      for (let i = 0; i < totalPages; i++) {
                        pageNumbers.push(i);
                      }
                    } else {
                      // Show up to 5 pages with current page centered when possible
                      if (currentPage < 3) {
                        // Near the beginning - show first 5 pages
                        for (let i = 0; i < 5; i++) {
                          pageNumbers.push(i);
                        }
                      } else if (currentPage >= totalPages - 3) {
                        // Near the end - show last 5 pages
                        for (let i = totalPages - 5; i < totalPages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        // In the middle - show 5 pages centered on current page
                        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                          pageNumbers.push(i);
                        }
                      }
                    }
                    
                    return pageNumbers.map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          pageNum === currentPage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    ));
                  })()}
                </div>
                
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages - 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    pagination.currentPage === pagination.totalPages - 1
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}