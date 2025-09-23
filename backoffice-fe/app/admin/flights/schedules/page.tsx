"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Calendar,
  Clock,
  Plane,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { FlightScheduleService, type FlightScheduleListParams } from "@/services/flight-schedule-service";
import { FlightService } from "@/services/flight-service";
import { AircraftService } from "@/services/aircraft-service";
import type { FlightSchedule, Flight, Aircraft } from "@/types/api";
import { FlightScheduleFormDialog } from "@/components/admin/flight/schedule-form-dialog";
import { FlightDataGeneratorDialog } from "@/components/dialogs/FlightDataGeneratorDialog";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function FlightSchedulesPage() {
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [flightFilter, setFlightFilter] = useState<string>("");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDataGeneratorOpen, setIsDataGeneratorOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<FlightSchedule | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params: FlightScheduleListParams = {
        page: currentPage,
        size: pageSize,
      };

      if (flightFilter) {
        params.flightId = parseInt(flightFilter);
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (dateFilter) {
        params.date = dateFilter;
      }

      const response = await FlightScheduleService.getFlightSchedules(params);
      setSchedules(response.content);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch flight schedules");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch flights and aircraft for dropdowns
      const [flightsData, aircraftData] = await Promise.all([
        FlightService.getFlights({ page: 0, size: 100, includeRelated: true }),
        AircraftService.getAircraft({ page: 0, size: 100 })
      ]);
      
      setFlights(flightsData.content);
      setAircraft(aircraftData.content);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to fetch form data");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [currentPage, pageSize, flightFilter, statusFilter, dateFilter]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this flight schedule?")) {
      return;
    }

    try {
      await FlightScheduleService.deleteFlightSchedule(scheduleId);
      toast.success("Flight schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete flight schedule");
    }
  };

  const handleEdit = (schedule: FlightSchedule) => {
    setSelectedSchedule(schedule);
    setIsEditDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedSchedule(null);
    fetchSchedules();
  };

  const clearFilters = () => {
    setFlightFilter("");
    setStatusFilter("");
    setDateFilter("");
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalElements / pageSize);

  return (
    <>
      <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flight Schedules</h1>
          <p className="text-muted-foreground">
            Manage flight schedules and timetables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDataGeneratorOpen(true)}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Generate Data
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalElements}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schedules.filter(s => s.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {schedules.filter(s => s.status === 'SCHEDULED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {schedules.filter(s => s.status === 'DELAYED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Flight</label>
              <div className="space-y-2">
                <Select value={flightFilter} onValueChange={setFlightFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a flight" />
                  </SelectTrigger>
                  <SelectContent>
                    {flights.map((flight) => (
                      <SelectItem key={flight.id || flight.flightId} value={(flight.id || flight.flightId)?.toString() || ''}>
                        {flight.flightNumber} - {flight.departureAirport?.iataCode} → {flight.arrivalAirport?.iataCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {flightFilter && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setFlightFilter("")}
                    className="w-full"
                  >
                    Show All Flights
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <div className="space-y-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DELAYED">Delayed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {statusFilter && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setStatusFilter("")}
                    className="w-full"
                  >
                    Show All Statuses
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  placeholder="Select date"
                />
                {dateFilter && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDateFilter("")}
                    className="w-full"
                  >
                    Clear Date
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Schedules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No flight schedules found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Departure</TableHead>
                    <TableHead>Arrival</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Aircraft</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.scheduleId}>
                      <TableCell className="font-medium">
                        {schedule.flight?.flightNumber || `Flight ${schedule.flightId}`}
                      </TableCell>
                      <TableCell>
                        {schedule.flight ? (
                          <span>
                            {schedule.flight.departureAirport?.iataCode} → {schedule.flight.arrivalAirport?.iataCode}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {FlightScheduleService.formatScheduleTime(schedule.departureTime)}
                      </TableCell>
                      <TableCell>
                        {FlightScheduleService.formatScheduleTime(schedule.arrivalTime)}
                      </TableCell>
                      <TableCell>
                        {schedule.durationMinutes ? 
                          FlightScheduleService.formatDuration(schedule.durationMinutes) : 
                          "-"
                        }
                      </TableCell>
                      <TableCell>
                        {schedule.aircraftType || schedule.aircraft?.model || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge className={FlightScheduleService.getStatusBadgeColor(schedule.status)}>
                          {schedule.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule.scheduleId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <FlightScheduleFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        flights={flights}
        aircraft={aircraft}
        onSuccess={handleFormSuccess}
      />

      {/* Edit Dialog */}
      <FlightScheduleFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedSchedule(null);
        }}
        flights={flights}
        aircraft={aircraft}
        initialData={selectedSchedule || undefined}
        onSuccess={handleFormSuccess}
      />

      {/* Data Generator Dialog */}
      <FlightDataGeneratorDialog
        isOpen={isDataGeneratorOpen}
        onClose={() => setIsDataGeneratorOpen(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
      </AdminLayout>
    </>
  );
}

