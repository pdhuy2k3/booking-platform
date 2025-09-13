"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FlightScheduleService } from "@/services/flight-schedule-service";
import { AdminFormDialog } from "@/components/admin/shared/admin-form-dialog";
import type { 
  FlightSchedule, 
  FlightScheduleCreateRequest, 
  FlightScheduleUpdateRequest, 
  Flight, 
  Aircraft 
} from "@/types/api";

interface FlightScheduleFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  flights: Flight[];
  aircraft: Aircraft[];
  initialData?: FlightSchedule;
  onSuccess: () => void;
}

export function FlightScheduleFormDialog({
  isOpen,
  onClose,
  flights,
  aircraft,
  initialData,
  onSuccess,
}: FlightScheduleFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [flightOpen, setFlightOpen] = useState(false);
  const [aircraftOpen, setAircraftOpen] = useState(false);
  const [formData, setFormData] = useState({
    flightId: initialData?.flightId?.toString() || "",
    departureTime: initialData?.departureTime ? 
      new Date(initialData.departureTime).toISOString().slice(0, 16) : "",
    arrivalTime: initialData?.arrivalTime ? 
      new Date(initialData.arrivalTime).toISOString().slice(0, 16) : "",
    aircraftId: initialData?.aircraftId?.toString() || "",
    status: initialData?.status || "SCHEDULED",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        flightId: initialData?.flightId?.toString() || "",
        departureTime: initialData?.departureTime ? 
          new Date(initialData.departureTime).toISOString().slice(0, 16) : "",
        arrivalTime: initialData?.arrivalTime ? 
          new Date(initialData.arrivalTime).toISOString().slice(0, 16) : "",
        aircraftId: initialData?.aircraftId?.toString() || "",
        status: initialData?.status || "SCHEDULED",
      });
      setErrors({});
    }
  }, [isOpen, initialData, aircraft]);

  // Auto-calculate arrival time when departure time changes (optional helper)
  useEffect(() => {
    if (formData.departureTime && !formData.arrivalTime) {
      // Only auto-fill if arrival time is empty and user hasn't set it yet
      // This is just a helper - users can still manually set arrival time
      const departure = new Date(formData.departureTime);
      const suggestedArrival = new Date(departure.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours
      setFormData(prev => ({
        ...prev,
        arrivalTime: suggestedArrival.toISOString().slice(0, 16)
      }));
    }
  }, [formData.departureTime]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.flightId) {
      newErrors.flightId = "Flight is required";
    }

    if (!formData.departureTime) {
      newErrors.departureTime = "Departure time is required";
    }

    if (!formData.arrivalTime) {
      newErrors.arrivalTime = "Arrival time is required";
    }

    if (!formData.aircraftId) {
      newErrors.aircraftId = "Aircraft is required";
    }

    // Check if departure time is in the future (for new schedules)
    if (formData.departureTime && !initialData) {
      const departure = new Date(formData.departureTime);
      const now = new Date();
      if (departure <= now) {
        newErrors.departureTime = "Departure time must be in the future";
      }
    }

    // Check if arrival time is after departure time
    if (formData.departureTime && formData.arrivalTime) {
      const departure = new Date(formData.departureTime);
      const arrival = new Date(formData.arrivalTime);
      if (arrival <= departure) {
        newErrors.arrivalTime = "Arrival time must be after departure time";
      }

      // Check reasonable flight duration (30 minutes to 20 hours)
      const durationMinutes = (arrival.getTime() - departure.getTime()) / (1000 * 60);
      if (durationMinutes < 30) {
        newErrors.arrivalTime = "Flight duration must be at least 30 minutes";
      }
      if (durationMinutes > 1200) {
        newErrors.arrivalTime = "Flight duration cannot exceed 20 hours";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        flightId: parseInt(formData.flightId),
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
        aircraftId: parseInt(formData.aircraftId),
        status: formData.status as any,
      };

      if (initialData) {
        // Update existing schedule
        const updateData: FlightScheduleUpdateRequest = {
          departureTime: requestData.departureTime,
          arrivalTime: requestData.arrivalTime,
          aircraftId: requestData.aircraftId,
          status: requestData.status,
        };
        await FlightScheduleService.updateFlightSchedule(initialData.scheduleId, updateData);
        toast.success("Flight schedule updated successfully");
      } else {
        // Create new schedule
        const createData: FlightScheduleCreateRequest = requestData;
        await FlightScheduleService.createFlightSchedule(createData);
        toast.success("Flight schedule created successfully");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving flight schedule:", error);
      
      // Handle specific error messages from the backend
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message?.includes("Aircraft is not available")) {
        toast.error("Aircraft is not available during the selected time slot");
      } else {
        toast.error(initialData ? "Failed to update flight schedule" : "Failed to create flight schedule");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedFlight = flights.find(f => (f.flightId || f.id)?.toString() === formData.flightId);
  const selectedAircraft = aircraft.find(a => a.aircraftId?.toString() === formData.aircraftId);

  const getDurationDisplay = () => {
    if (formData.departureTime && formData.arrivalTime) {
      const departure = new Date(formData.departureTime);
      const arrival = new Date(formData.arrivalTime);
      const durationMinutes = (arrival.getTime() - departure.getTime()) / (1000 * 60);
      return FlightScheduleService.formatDuration(Math.round(durationMinutes));
    }
    return null;
  };

  // Custom fields for the AdminFormDialog
  const customFields = [
    {
      name: "flightSelection",
      label: "Flight *",
      component: (
        <div className="space-y-2">
          <Popover open={flightOpen} onOpenChange={setFlightOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={flightOpen}
                className="w-full justify-between"
              >
                {formData.flightId
                  ? (() => {
                      const flight = flights.find(f => (f.flightId || f.id)?.toString() === formData.flightId);
                      return flight ? (
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{flight.flightNumber}</span>
                          <span className="text-sm text-muted-foreground">
                            {flight.airlineName || "Unknown Airline"} • {flight.departureAirportIataCode || "N/A"} → {flight.arrivalAirportIataCode || "N/A"}
                          </span>
                        </div>
                      ) : "Select a flight";
                    })()
                  : "Select a flight"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search flights..." />
                <CommandEmpty>No flight found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {flights.filter(flight => (flight.flightId || flight.id) != null).map((flight) => (
                    <CommandItem
                      key={flight.flightId || flight.id}
                      value={`${flight.flightNumber} ${flight.airlineName} ${flight.departureAirportIataCode} ${flight.arrivalAirportIataCode}`}
                      onSelect={() => {
                        setFormData(prev => ({ ...prev, flightId: (flight.flightId || flight.id)!.toString() }));
                        setFlightOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.flightId === (flight.id || flight.flightId)?.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{flight.flightNumber}</span>
                        <span className="text-sm text-muted-foreground">
                          {flight.airlineName || "Unknown Airline"} • {flight.departureAirportIataCode || "N/A"} → {flight.arrivalAirportIataCode || "N/A"}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.flightId && <p className="text-sm text-red-500">{errors.flightId}</p>}
        </div>
      ),
      error: errors.flightId
    },
    {
      name: "flightDetails",
      label: "",
      component: selectedFlight ? (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Airline:</span>
                <p className="font-medium">{selectedFlight.airlineName || "Not specified"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Route:</span>
                <p className="font-medium">
                  {selectedFlight.departureAirportIataCode || selectedFlight.departureAirportName || "N/A"} → {selectedFlight.arrivalAirportIataCode || selectedFlight.arrivalAirportName || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Aircraft Type:</span>
                <p className="font-medium">{selectedFlight.aircraftType || "Not specified"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className="font-medium">{selectedFlight.status || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null
    },
    {
      name: "timeFields",
      label: "Schedule Times",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureTime">Departure Time *</Label>
              <div className="relative">
                <Input
                  id="departureTime"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                  className="pr-10"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.departureTime && <p className="text-sm text-red-500">{errors.departureTime}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Arrival Time *</Label>
              <div className="relative">
                <Input
                  id="arrivalTime"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                  className="pr-10"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.arrivalTime && <p className="text-sm text-red-500">{errors.arrivalTime}</p>}
            </div>
          </div>

          {/* Duration Display */}
          {getDurationDisplay() && (
            <div className="text-sm text-muted-foreground">
              <strong>Flight Duration:</strong> {getDurationDisplay()}
            </div>
          )}
        </div>
      )
    },
    {
      name: "aircraftSelection",
      label: "Aircraft *",
      component: (
        <div className="space-y-2">
          <Popover open={aircraftOpen} onOpenChange={setAircraftOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={aircraftOpen}
                className="w-full justify-between"
              >
                {formData.aircraftId
                  ? (() => {
                      const ac = aircraft.find(a => a.aircraftId?.toString() === formData.aircraftId);
                      return ac ? (
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{ac.model}</span>
                          <span className="text-sm text-muted-foreground">
                            {ac.manufacturer} • {ac.registrationNumber}
                            {ac.totalCapacity && ` • ${ac.totalCapacity} seats`}
                          </span>
                        </div>
                      ) : "Select an aircraft";
                    })()
                  : "Select an aircraft"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search aircraft..." />
                <CommandEmpty>No aircraft found.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {aircraft.filter(ac => ac.aircraftId !== undefined && ac.aircraftId !== null).map((ac) => (
                    <CommandItem
                      key={ac.aircraftId}
                      value={`${ac.model} ${ac.manufacturer} ${ac.registrationNumber}`}
                      onSelect={() => {
                        setFormData(prev => ({ ...prev, aircraftId: ac.aircraftId!.toString() }));
                        setAircraftOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.aircraftId === ac.aircraftId?.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{ac.model}</span>
                        <span className="text-sm text-muted-foreground">
                          {ac.manufacturer} • {ac.registrationNumber}
                          {ac.totalCapacity && ` • ${ac.totalCapacity} seats`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.aircraftId && <p className="text-sm text-red-500">{errors.aircraftId}</p>}
        </div>
      ),
      error: errors.aircraftId
    },
    {
      name: "aircraftDetails",
      label: "",
      component: selectedAircraft ? (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Manufacturer:</span>
                <p className="font-medium">{selectedAircraft.manufacturer}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Registration:</span>
                <p className="font-medium">{selectedAircraft.registrationNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Capacity:</span>
                <p className="font-medium">{selectedAircraft.totalCapacity} seats</p>
              </div>
              <div>
                <span className="text-muted-foreground">Configuration:</span>
                <p className="font-medium">
                  {[
                    selectedAircraft.capacityFirst && `${selectedAircraft.capacityFirst}F`,
                    selectedAircraft.capacityBusiness && `${selectedAircraft.capacityBusiness}J`,
                    selectedAircraft.capacityEconomy && `${selectedAircraft.capacityEconomy}Y`
                  ].filter(Boolean).join(" / ") || "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null
    },
    {
      name: "statusSelection",
      label: "Status",
      component: (
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData(prev => ({ 
            ...prev, 
            status: value as "SCHEDULED" | "ACTIVE" | "DELAYED" | "CANCELLED" | "COMPLETED"
          }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DELAYED">Delayed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  ];

  return (
    <AdminFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Flight Schedule" : "Create Flight Schedule"}
      description={initialData ? "Update flight schedule information" : "Create a new flight schedule"}
      customFields={customFields}
      onSubmit={handleSubmit}
      submitLabel={initialData ? "Update Schedule" : "Create Schedule"}
      isSubmitting={loading}
      canSubmit={Object.keys(errors).length === 0 && !!formData.flightId && !!formData.departureTime && !!formData.arrivalTime && !!formData.aircraftId}
    />
  );
}