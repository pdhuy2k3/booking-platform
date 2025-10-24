"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, MoreHorizontal, Eye, Edit, Trash2, Settings, Star } from "lucide-react"
import type { Hotel, PaginatedResponse } from "@/types/api"

interface HotelTableProps {
  hotels: PaginatedResponse<Hotel> | null
  loading: boolean
  searchTerm: string
  cityFilter: string
  onSearchChange: (term: string) => void
  onCityFilterChange: (city: string) => void
  onPageChange: (page: number) => void // New callback for pagination
  onViewHotel: (hotel: Hotel) => void
  onEditHotel: (hotel: Hotel) => void
  onDeleteHotel: (id: number) => void
  onNavigateToDetails: (hotelId: number) => void
  formatPrice: (price: number) => string
}

export function HotelTable({
  hotels,
  loading,
  searchTerm,
  cityFilter,
  onSearchChange,
  onCityFilterChange,
  onPageChange,
  onViewHotel,
  onEditHotel,
  onDeleteHotel,
  onNavigateToDetails,
  formatPrice
}: HotelTableProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const renderHotelImage = (hotel: Hotel) => {
    // Get the first image if available
    const firstImage = hotel.media && hotel.media.length > 0 ? hotel.media[0] : null
    
    if (firstImage) {
      // Use the media service to generate an optimized Cloudinary URL
      // The mediaService expects the full path format /api/media/{publicId}
      const imageUrl = firstImage.secureUrl
      
      return (
        <img 
          src={imageUrl} 
          alt={hotel.name} 
          className="w-16 h-10 object-cover rounded-md"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='40' viewBox='0 0 64 40'%3E%3Crect width='64' height='40' fill='%23e5e7eb'/%3E%3C/svg%3E"
          }}
        />
      )
    }
    
    // Fallback placeholder
    return <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-10" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg lg:text-xl">Danh sách khách sạn</CardTitle>
            <CardDescription className="text-sm">Quản lý tất cả khách sạn trong hệ thống</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khách sạn..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={cityFilter} onValueChange={onCityFilterChange}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                <SelectItem value="TP.HCM">TP.HCM</SelectItem>
                <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                <SelectItem value="Nha Trang">Nha Trang</SelectItem>
                <SelectItem value="Hải Phòng">Hải Phòng</SelectItem>
                <SelectItem value="Cần Thơ">Cần Thơ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Khách sạn</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Số phòng</TableHead>
                <TableHead>Giá từ</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : hotels?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                hotels?.content.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {renderHotelImage(hotel)}
                        <div>
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-sm text-gray-500">ID: {hotel.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{hotel.address}</div>
                        <div className="text-sm text-gray-500">
                          {hotel.city}, {hotel.country}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderStars(hotel.starRating || 0)}
                        <span className="text-sm text-gray-600 ml-1">({hotel.starRating || 0})</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{hotel.availableRooms || 0}</TableCell>
                    <TableCell className="font-medium">
                      {hotel.minPrice ? formatPrice(hotel.minPrice) : "Liên hệ"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewHotel(hotel)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditHotel(hotel)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onNavigateToDetails(hotel.id)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Quản lý phòng
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDeleteHotel(hotel.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa khách sạn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        {hotels && hotels.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-gray-700">
              Hiển thị {hotels.number * hotels.size + 1} -{" "}
              {Math.min((hotels.number + 1) * hotels.size, hotels.totalElements)} của{" "}
              {hotels.totalElements} kết quả
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(hotels.number - 1)}
                disabled={hotels.number === 0}
                className={`px-3 py-1 rounded-md text-sm ${
                  hotels.number === 0
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
                  const totalPages = hotels.totalPages;
                  const currentPage = hotels.number;
                  
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
                onClick={() => onPageChange(hotels.number + 1)}
                disabled={hotels.number === hotels.totalPages - 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  hotels.number === hotels.totalPages - 1
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
