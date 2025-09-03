"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Edit, Trash2 } from "lucide-react"
import type { Airport, PaginatedResponse } from "@/types/api"

interface AirportTableProps {
  airports: PaginatedResponse<Airport> | null
  loading: boolean
  searchTerm: string
  cityFilter: string
  countryFilter: string
  onSearchChange: (term: string) => void
  onCityFilterChange: (city: string) => void
  onCountryFilterChange: (country: string) => void
  onEditAirport: (airport: Airport) => void
  onDeleteAirport: (airport: Airport) => void
  onClearFilters: () => void
}

export function AirportTable({
  airports,
  loading,
  searchTerm,
  cityFilter,
  countryFilter,
  onSearchChange,
  onCityFilterChange,
  onCountryFilterChange,
  onEditAirport,
  onDeleteAirport,
  onClearFilters
}: AirportTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg lg:text-xl">Danh sách sân bay</CardTitle>
            <CardDescription className="text-sm">Quản lý tất cả sân bay trong hệ thống</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm sân bay..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Input
              placeholder="Lọc theo thành phố..."
              value={cityFilter}
              onChange={(e) => onCityFilterChange(e.target.value)}
              className="w-full sm:w-48"
            />
            <Input
              placeholder="Lọc theo quốc gia..."
              value={countryFilter}
              onChange={(e) => onCountryFilterChange(e.target.value)}
              className="w-full sm:w-48"
            />
            {(searchTerm || cityFilter || countryFilter) && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Mã IATA</TableHead>
                <TableHead>Tên sân bay</TableHead>
                <TableHead>Thành phố</TableHead>
                <TableHead>Quốc gia</TableHead>
                <TableHead>Múi giờ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : airports?.content.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                airports?.content.map((airport) => (
                  <TableRow key={airport.id}>
                    <TableCell className="font-medium">{airport.code}</TableCell>
                    <TableCell>{airport.name}</TableCell>
                    <TableCell>{airport.city}</TableCell>
                    <TableCell>{airport.country}</TableCell>
                    <TableCell>{airport.timezone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={airport.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {airport.isActive ? 'Hoạt động' : 'Tạm ngừng'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(airport.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEditAirport(airport)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => onDeleteAirport(airport)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
