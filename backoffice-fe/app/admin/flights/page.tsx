"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Search, Plus, Plane } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { FlightTable } from "@/components/admin/flight/flight-table"
import { FlightStats } from "@/components/admin/flight/flight-stats"
import { FlightFormDialog } from "@/components/admin/flight/flight-form-dialog"
import { FlightViewDialog } from "@/components/admin/flight/flight-view-dialog"
import { useFlightData } from "@/hooks/use-flight-data"
import { useFlightForm } from "@/hooks/use-flight-form"
import type { Flight } from "@/types/api"

export default function AdminFlights() {
  const {
    flights,
    flightStatistics,
    loading,
    loadingStatistics,
    loadFlights,
    searchTerm,
    setSearchTerm,
    currentPage,
    onPageChange,
    airlines,
    airports,
    loadingFormData,
    loadFormData,
    loadMoreAirlines,
    handleAirlineSearch,
    hasMoreAirlines,
    loadingMoreAirlines,
    airlineSearchTerm,
    loadMoreAirports,
    handleAirportSearch,
    hasMoreAirports,
    loadingMoreAirports,
    airportSearchTerm
  } = useFlightData()

  const {
    addForm,
    setAddForm,
    editForm,
    setEditForm,
    resetAddForm,
    populateEditForm,
    submitting,
    setSubmitting,
    handleAddFlight,
    handleEditFlight,
    handleDeleteFlight
  } = useFlightForm({
    onFlightAdded: () => {
      setIsAddDialogOpen(false)
      loadFlights()
    },
    onFlightUpdated: () => {
      setIsEditDialogOpen(false)
      setSelectedFlight(null)
      loadFlights()
    },
    onFlightDeleted: () => {
      setIsDeleteDialogOpen(false)
      setSelectedFlight(null)
      loadFlights()
    }
  })

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Selected flight for actions
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      case "DELAYED":
        return <Badge className="bg-yellow-100 text-yellow-800">Tạm hoãn</Badge>
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      case "ON_TIME":
        return <Badge className="bg-blue-100 text-blue-800">Đúng giờ</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Không xác định</Badge>
    }
  }

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    resetAddForm()
    loadFormData()
    setIsAddDialogOpen(true)
  }

  // Handle opening edit dialog
  const handleOpenEditDialog = async (flight: Flight) => {
    setSelectedFlight(flight)
    setIsEditDialogOpen(true)
    
    // Load form data first, then populate the form
    await loadFormData()
    populateEditForm(flight)
  }

  return (
    <AdminLayout>
      {/* Header - Stack on mobile */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Quản lý Chuyến bay</h1>
          <p className="text-gray-600 mt-2 text-sm lg:text-base">Quản lý tất cả chuyến bay trong hệ thống</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full lg:w-auto"
          onClick={handleOpenAddDialog}
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm chuyến bay
        </Button>
      </div>

      {/* Stats Cards - Better responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
        {flights?.content && (
          <FlightStats 
            flights={flights} 
            statistics={flightStatistics}
            loadingStatistics={loadingStatistics}
          />
        )}
      </div>

      {/* Flights Table - Add horizontal scroll on mobile */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg lg:text-xl">Danh sách chuyến bay</CardTitle>
              <CardDescription className="text-sm">Quản lý tất cả chuyến bay trong hệ thống</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative w-full lg:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm chuyến bay..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã chuyến bay</TableHead>
                  <TableHead>Hãng hàng không</TableHead>
                  <TableHead>Tuyến đường</TableHead>
                  <TableHead>Thời gian bay</TableHead>
                  <TableHead>Loại máy bay</TableHead>
                  <TableHead>Trạng thái hoạt động</TableHead>
                  <TableHead>Trạng thái chuyến bay</TableHead>
                  <TableHead className="w-[100px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flights?.content && (
                  <FlightTable 
                    flights={flights.content}
                    pagination={{
                      currentPage: flights.number,
                      totalPages: flights.totalPages,
                      totalElements: flights.totalElements,
                      size: flights.size
                    }}
                    loading={loading}
                    onPageChange={onPageChange}
                    onEdit={handleOpenEditDialog}
                    onView={(flight) => {
                      setSelectedFlight(flight)
                      setIsViewDialogOpen(true)
                    }}
                    onDelete={(flight) => {
                      setSelectedFlight(flight)
                      setIsDeleteDialogOpen(true)
                    }}
                    getStatusBadge={getStatusBadge}
                  />

                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Flight Dialog */}
      <FlightFormDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Thêm chuyến bay mới"
        description="Nhập thông tin chuyến bay mới vào hệ thống"
        form={addForm}
        onFormChange={setAddForm}
        airlines={airlines}
        airports={airports}
        loadingFormData={loadingFormData}
        submitting={submitting}
        onSubmit={handleAddFlight}
        submitLabel="Thêm chuyến bay"
        onAirlineSearch={handleAirlineSearch}
        onAirportSearch={handleAirportSearch}
      />

      {/* Edit Flight Dialog */}
      <FlightFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Chỉnh sửa chuyến bay"
        description={`Cập nhật thông tin chuyến bay ${selectedFlight?.flightNumber}`}
        form={editForm}
        onFormChange={setEditForm}
        airlines={airlines}
        airports={airports}
        loadingFormData={loadingFormData}
        submitting={submitting}
        onSubmit={() => handleEditFlight(selectedFlight)}
        submitLabel="Lưu thay đổi"
        onAirlineSearch={handleAirlineSearch}
        onAirportSearch={handleAirportSearch}
      />

      {/* View Flight Details Dialog */}
      <FlightViewDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        flight={selectedFlight}
        getStatusBadge={getStatusBadge}
      />

      {/* Delete Flight Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chuyến bay</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuyến bay <strong>{selectedFlight?.flightNumber}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
              onClick={() => handleDeleteFlight(selectedFlight)}
            >
              {submitting ? "Đang xóa..." : "Xóa chuyến bay"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}