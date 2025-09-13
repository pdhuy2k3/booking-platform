"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Search, MoreHorizontal, Eye, Edit, Plus, Trash2, DollarSign, Plane, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { FlightFareService } from "@/services/flight-fare.service"
import { FlightScheduleService } from "@/services/flight-schedule-service"
import { FlightFareFormDialog } from "@/components/admin/flight/fare-form-dialog"
import { useToast } from "@/hooks/use-toast"
import type { FlightFare, FlightSchedule, PaginatedResponse, FlightFareCreateRequest, FlightFareUpdateRequest } from "@/types/api"

export default function AdminFlightFares() {
  const [flightFares, setFlightFares] = useState<PaginatedResponse<FlightFare> | null>(null)
  const [flightSchedules, setFlightSchedules] = useState<FlightSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSchedules, setLoadingSchedules] = useState(false)
  const [scheduleIdFilter, setScheduleIdFilter] = useState("")
  const [fareClassFilter, setFareClassFilter] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedFare, setSelectedFare] = useState<FlightFare | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [filterScheduleComboOpen, setFilterScheduleComboOpen] = useState(false)
  const [fareClassComboOpen, setFareClassComboOpen] = useState(false)

  // Form states for legacy compatibility
  const [formData, setFormData] = useState<FlightFareCreateRequest>({
    scheduleId: "",
    fareClass: "ECONOMY",
    price: 0,
    availableSeats: 0,
  })
  const [editFormData, setEditFormData] = useState<FlightFareUpdateRequest>({})

  const { toast } = useToast()

  // Helper function to get suggested seat count based on schedule and fare class
  const getSuggestedSeatCount = (scheduleId: string, fareClass: string): number => {
    const schedule = flightSchedules.find(s => s.scheduleId === scheduleId)
    if (!schedule?.aircraft) return 0
    
    const aircraft = schedule.aircraft
    switch (fareClass) {
      case 'FIRST':
        return aircraft.capacityFirst || 0
      case 'BUSINESS':
        return aircraft.capacityBusiness || 0
      case 'PREMIUM_ECONOMY':
        return Math.floor((aircraft.capacityEconomy || 0) * 0.3) // 30% of economy
      case 'ECONOMY':
        return aircraft.capacityEconomy || 0
      default:
        return 0
    }
  }

  useEffect(() => {
    loadFlightFares()
  }, [scheduleIdFilter, fareClassFilter, currentPage])

  useEffect(() => {
    loadFlightSchedules()
  }, [])


  const loadFlightSchedules = async () => {
    try {
      setLoadingSchedules(true)
      const data = await FlightScheduleService.getFlightSchedules({
        page: 0,
        size: 100, // Get first 100 schedules for dropdown
        status: "SCHEDULED" // Only show scheduled flights for fare creation
      })
      setFlightSchedules(data.content)
    } catch (error) {
      console.error("Failed to load flight schedules:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách lịch trình chuyến bay",
        variant: "destructive",
      })
    } finally {
      setLoadingSchedules(false)
    }
  }

  const loadFlightFares = async () => {
    try {
      setLoading(true)
      const data = await FlightFareService.getFlightFares({
        scheduleId: scheduleIdFilter || undefined,
        fareClass: fareClassFilter || undefined,
        page: currentPage,
        size: 10,
      })
      setFlightFares(data)
    } catch (error) {
      console.error("Failed to load flight fares:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giá vé",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditFare = (fare: FlightFare) => {
    setSelectedFare(fare)
    setEditFormData({
      fareClass: fare.fareClass,
      price: fare.price,
      availableSeats: fare.availableSeats,
    })
    setEditDialogOpen(true)
  }

  const handleDeleteFare = (fare: FlightFare) => {
    setSelectedFare(fare)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedFare) return

    try {
      await FlightFareService.deleteFlightFare(selectedFare.fareId)
      toast({
        title: "Thành công",
        description: "Đã xóa giá vé thành công",
      })
      setDeleteDialogOpen(false)
      setSelectedFare(null)
      loadFlightFares()
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa giá vé",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      scheduleId: "",
      fareClass: "ECONOMY",
      price: 0,
      availableSeats: 0,
    })
  }

  const getFareClassBadge = (fareClass: string) => {
    switch (fareClass) {
      case "ECONOMY":
        return <Badge className="bg-blue-100 text-blue-800">Phổ thông</Badge>
      case "PREMIUM_ECONOMY":
        return <Badge className="bg-purple-100 text-purple-800">Phổ thông đặc biệt</Badge>
      case "BUSINESS":
        return <Badge className="bg-green-100 text-green-800">Thương gia</Badge>
      case "FIRST":
        return <Badge className="bg-yellow-100 text-yellow-800">Hạng nhất</Badge>
      default:
        return <Badge>{fareClass}</Badge>
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý giá vé máy bay</h2>
          <p className="text-muted-foreground">
            Quản lý giá vé cho các chuyến bay theo hạng ghế
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giá vé</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.totalElements || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Phổ thông</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.content.filter(f => f.fareClass === "ECONOMY").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thương gia</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.content.filter(f => f.fareClass === "BUSINESS").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hạng nhất</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {flightFares?.content.filter(f => f.fareClass === "FIRST").length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách giá vé</CardTitle>
            <CardDescription>
              Quản lý giá vé cho các chuyến bay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="space-y-2">
                  <Popover open={filterScheduleComboOpen} onOpenChange={setFilterScheduleComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={filterScheduleComboOpen}
                        className="w-[300px] justify-between"
                      >
                        {scheduleIdFilter
                          ? (() => {
                              const schedule = flightSchedules.find(s => s.scheduleId === scheduleIdFilter);
                              return schedule ? (
                                <div className="flex flex-col text-left">
                                  <span className="font-medium">
                                    {schedule.flight?.flightNumber || `Flight ${schedule.flightId}`}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {schedule.flight ? (
                                      `${schedule.flight.departureAirport?.iataCode} → ${schedule.flight.arrivalAirport?.iataCode}`
                                    ) : (
                                      `Schedule ${schedule.scheduleId.slice(0, 8)}...`
                                    )}
                                    {" • "}
                                    {FlightScheduleService.formatScheduleTime(schedule.departureTime)}
                                  </span>
                                </div>
                              ) : "Chọn lịch trình chuyến bay";
                            })()
                          : "Chọn lịch trình chuyến bay"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm lịch trình..." />
                        <CommandEmpty>Không tìm thấy lịch trình.</CommandEmpty>
                        <CommandGroup>
                          {flightSchedules.map((schedule) => (
                            <CommandItem
                              key={schedule.scheduleId}
                              value={`${schedule.flight?.flightNumber} ${schedule.flight?.departureAirport?.iataCode} ${schedule.flight?.arrivalAirport?.iataCode} ${schedule.scheduleId}`}
                              onSelect={() => {
                                setScheduleIdFilter(schedule.scheduleId);
                                setFilterScheduleComboOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  scheduleIdFilter === schedule.scheduleId ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col text-left">
                                <span className="font-medium">
                                  {schedule.flight?.flightNumber || `Flight ${schedule.flightId}`}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {schedule.flight ? (
                                    `${schedule.flight.departureAirport?.iataCode} → ${schedule.flight.arrivalAirport?.iataCode}`
                                  ) : (
                                    `Schedule ${schedule.scheduleId.slice(0, 8)}...`
                                  )}
                                  {" • "}
                                  {FlightScheduleService.formatScheduleTime(schedule.departureTime)}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {scheduleIdFilter && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setScheduleIdFilter("")}
                      className="w-full"
                    >
                      Hiển thị tất cả lịch trình
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Popover open={fareClassComboOpen} onOpenChange={setFareClassComboOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={fareClassComboOpen}
                        className="w-[200px] justify-between"
                      >
                        {fareClassFilter
                          ? (() => {
                              const classNames = {
                                "ECONOMY": "Phổ thông",
                                "PREMIUM_ECONOMY": "Phổ thông đặc biệt",
                                "BUSINESS": "Thương gia",
                                "FIRST": "Hạng nhất"
                              };
                              return classNames[fareClassFilter as keyof typeof classNames] || fareClassFilter;
                            })()
                          : "Chọn hạng ghế"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm hạng ghế..." />
                        <CommandEmpty>Không tìm thấy hạng ghế.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="economy phổ thông"
                            onSelect={() => {
                              setFareClassFilter("ECONOMY");
                              setFareClassComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                fareClassFilter === "ECONOMY" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Phổ thông
                          </CommandItem>
                          <CommandItem
                            value="premium economy phổ thông đặc biệt"
                            onSelect={() => {
                              setFareClassFilter("PREMIUM_ECONOMY");
                              setFareClassComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                fareClassFilter === "PREMIUM_ECONOMY" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Phổ thông đặc biệt
                          </CommandItem>
                          <CommandItem
                            value="business thương gia"
                            onSelect={() => {
                              setFareClassFilter("BUSINESS");
                              setFareClassComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                fareClassFilter === "BUSINESS" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Thương gia
                          </CommandItem>
                          <CommandItem
                            value="first hạng nhất"
                            onSelect={() => {
                              setFareClassFilter("FIRST");
                              setFareClassComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                fareClassFilter === "FIRST" ? "opacity-100" : "opacity-0"
                              )}
                            />
                            Hạng nhất
                          </CommandItem>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {fareClassFilter && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFareClassFilter("")}
                      className="w-full"
                    >
                      Hiển thị tất cả hạng ghế
                    </Button>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm giá vé
              </Button>
            </div>

            {/* Flight Fares Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giá vé</TableHead>
                    <TableHead>Chuyến bay</TableHead>
                    <TableHead>Lịch trình</TableHead>
                    <TableHead>Hạng ghế</TableHead>
                    <TableHead>Giá vé</TableHead>
                    <TableHead>Ghế trống</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : flightFares?.content?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    flightFares?.content?.map((fare) => {
                      const schedule = flightSchedules.find(s => s.scheduleId === fare.scheduleId)
                      return (
                        <TableRow key={fare.fareId}>
                          <TableCell className="font-medium">{fare.fareId.slice(0, 8)}...</TableCell>
                          <TableCell>
                            {schedule?.flight ? (
                              <div className="flex flex-col">
                                <span className="font-medium">{schedule.flight.flightNumber}</span>
                                <span className="text-sm text-muted-foreground">
                                  {schedule.flight.airlineName || 'N/A'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {schedule ? (
                              <div className="flex flex-col">
                                <span className="text-sm">
                                  {schedule.flight ? (
                                    `${schedule.flight.departureAirport?.iataCode} → ${schedule.flight.arrivalAirport?.iataCode}`
                                  ) : (
                                    `Schedule ${schedule.scheduleId.slice(0, 8)}...`
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {FlightScheduleService.formatScheduleTime(schedule.departureTime)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">{fare.scheduleId.slice(0, 8)}...</span>
                            )}
                          </TableCell>
                          <TableCell>{getFareClassBadge(fare.fareClass)}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            {formatPrice(fare.price)}
                          </TableCell>
                          <TableCell>{fare.availableSeats}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditFare(fare)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFare(fare)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {flightFares && flightFares.totalPages > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Trước
                </Button>
                <div className="text-sm text-muted-foreground">
                  Trang {currentPage + 1} / {flightFares.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(flightFares.totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= flightFares.totalPages - 1}
                >
                  Sau
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Flight Fare Dialog */}
      <FlightFareFormDialog
        isOpen={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false)
          resetForm()
        }}
        flightSchedules={flightSchedules}
        onSuccess={() => {
          setCreateDialogOpen(false)
          resetForm()
          loadFlightFares()
        }}
      />

      {/* Edit Flight Fare Dialog */}
      <FlightFareFormDialog
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedFare(null)
        }}
        flightSchedules={flightSchedules}
        initialData={selectedFare || undefined}
        onSuccess={() => {
          setEditDialogOpen(false)
          setSelectedFare(null)
          loadFlightFares()
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa giá vé này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
