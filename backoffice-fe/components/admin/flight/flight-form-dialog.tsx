"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { AirportService } from "@/services/airport-service"
import type { Airline, Airport } from "@/types/api"

interface FlightFormData {
  flightNumber: string
  airlineId: string
  departureAirportId: string
  arrivalAirportId: string
  aircraftType: string
  status: string
  isActive: boolean
}

interface FlightFormDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  form: FlightFormData
  onFormChange: (form: FlightFormData) => void
  airlines: Airline[]
  airports: Airport[]
  loadingFormData: boolean
  submitting: boolean
  onSubmit: () => void
  submitLabel: string
  // Search handlers
  onAirlineSearch: (term: string) => void
  onAirportSearch: (term: string) => void
  // Optional: separate handlers for departure and arrival airports
  onDepartureAirportSearch?: (term: string) => void
  onArrivalAirportSearch?: (term: string) => void
}

export function FlightFormDialog({
  isOpen,
  onClose,
  title,
  description,
  form,
  onFormChange,
  airlines,
  airports,
  loadingFormData,
  submitting,
  onSubmit,
  submitLabel,
  onAirlineSearch,
  onAirportSearch,
  onDepartureAirportSearch,
  onArrivalAirportSearch
}: FlightFormDialogProps) {
  // States for combobox open/close
  const [airlineOpen, setAirlineOpen] = useState(false);
  const [departureAirportOpen, setDepartureAirportOpen] = useState(false);
  const [arrivalAirportOpen, setArrivalAirportOpen] = useState(false);
  
  // Local state for airports with separate search terms
  const [departureAirports, setDepartureAirports] = useState<Airport[]>([]);
  const [arrivalAirports, setArrivalAirports] = useState<Airport[]>([]);
  const [loadingDepartureAirports, setLoadingDepartureAirports] = useState(false);
  const [loadingArrivalAirports, setLoadingArrivalAirports] = useState(false);
  const [departureSearchTerm, setDepartureSearchTerm] = useState('');
  const [arrivalSearchTerm, setArrivalSearchTerm] = useState('');

  // Load airports when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadInitialAirports();
    }
  }, [isOpen]);

  // Load initial airports (20 items)
  const loadInitialAirports = useCallback(async () => {
    try {
      setLoadingDepartureAirports(true);
      setLoadingArrivalAirports(true);
      
      const data = await AirportService.getAirports({
        page: 0,
        size: 20,
        search: undefined
      });
      
      console.log("Loaded airports data:", data);
      console.log("Airports content:", data.content);
      
      setDepartureAirports(data.content);
      setArrivalAirports(data.content);
    } catch (error) {
      console.error("Failed to load airports:", error);
      setDepartureAirports([]);
      setArrivalAirports([]);
    } finally {
      setLoadingDepartureAirports(false);
      setLoadingArrivalAirports(false);
    }
  }, []);

  // Debounced search for departure airports
  const searchDepartureAirports = useCallback(async (searchTerm: string) => {
    setDepartureSearchTerm(searchTerm);
    setLoadingDepartureAirports(true);
    
    try {
      const data = await AirportService.getAirports({
        page: 0,
        size: 20,
        search: searchTerm || undefined
      });
      console.log("Search departure airports result:", data);
      setDepartureAirports(data.content);
    } catch (error) {
      console.error("Failed to search departure airports:", error);
      setDepartureAirports([]);
    } finally {
      setLoadingDepartureAirports(false);
    }
  }, []);

  // Debounced search for arrival airports
  const searchArrivalAirports = useCallback(async (searchTerm: string) => {
    setArrivalSearchTerm(searchTerm);
    setLoadingArrivalAirports(true);
    
    try {
      const data = await AirportService.getAirports({
        page: 0,
        size: 20,
        search: searchTerm || undefined
      });
      console.log("Search arrival airports result:", data);
      setArrivalAirports(data.content);
    } catch (error) {
      console.error("Failed to search arrival airports:", error);
      setArrivalAirports([]);
    } finally {
      setLoadingArrivalAirports(false);
    }
  }, []);

  // Debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  }, []);

  // Create debounced search functions
  const debouncedSearchDeparture = useCallback(
    debounce(searchDepartureAirports, 300),
    [searchDepartureAirports, debounce]
  );

  const debouncedSearchArrival = useCallback(
    debounce(searchArrivalAirports, 300),
    [searchArrivalAirports, debounce]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {loadingFormData ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flightNumber">Mã chuyến bay *</Label>
              <Input
                id="flightNumber"
                placeholder="VN001"
                value={form.flightNumber}
                onChange={(e) => onFormChange({...form, flightNumber: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aircraftType">Loại máy bay</Label>
              <Input
                id="aircraftType"
                placeholder="Boeing 777"
                value={form.aircraftType}
                onChange={(e) => onFormChange({...form, aircraftType: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airline">Hãng hàng không *</Label>
              <Popover open={airlineOpen} onOpenChange={setAirlineOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={airlineOpen}
                    className="w-full justify-between"
                  >
                    {form.airlineId
                      ? (() => {
                          const airline = airlines.find(a => a.airlineId?.toString() === form.airlineId);
                          return airline ? `${airline.name} (${airline.iataCode})` : "Chọn hãng hàng không";
                        })()
                      : "Chọn hãng hàng không"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Tìm hãng hàng không..." 
                      onValueChange={onAirlineSearch} 
                    />
                    <CommandEmpty>Không tìm thấy hãng hàng không.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {airlines
                        .filter(airline => airline.airlineId != null)
                        .map((airline) => (
                          <CommandItem
                            key={airline.airlineId}
                            value={`${airline.name} ${airline.iataCode}`}
                            onSelect={() => {
                              onFormChange({ ...form, airlineId: airline.airlineId!.toString() });
                              setAirlineOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.airlineId === airline.airlineId?.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {airline.name} ({airline.iataCode})
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureAirport">Sân bay đi *</Label>
              <Popover open={departureAirportOpen} onOpenChange={setDepartureAirportOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={departureAirportOpen}
                    className="w-full justify-between"
                  >
                    {form.departureAirportId
                      ? (() => {
                          const airport = departureAirports.find(a => a.airportId?.toString() === form.departureAirportId);
                          return airport ? `${airport.iataCode} - ${airport.name}` : "Chọn sân bay đi";
                        })()
                      : "Chọn sân bay đi"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Tìm sân bay đi..." 
                      onValueChange={debouncedSearchDeparture}
                      value={departureSearchTerm}
                    />
                    <CommandEmpty>
                      {loadingDepartureAirports ? "Đang tải..." : "Không tìm thấy sân bay đi."}
                    </CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {departureAirports
                        .filter(airport => airport.airportId != null)
                        .map((airport) => (
                          <CommandItem
                            key={airport.airportId}
                            value={`${airport.iataCode} ${airport.name}`}
                            onSelect={() => {
                              onFormChange({ ...form, departureAirportId: airport.airportId!.toString() });
                              setDepartureAirportOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.departureAirportId === airport.airportId?.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {airport.iataCode} - {airport.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalAirport">Sân bay đến *</Label>
              <Popover open={arrivalAirportOpen} onOpenChange={setArrivalAirportOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={arrivalAirportOpen}
                    className="w-full justify-between"
                  >
                    {form.arrivalAirportId
                      ? (() => {
                          const airport = arrivalAirports.find(a => a.airportId?.toString() === form.arrivalAirportId);
                          return airport ? `${airport.iataCode} - ${airport.name}` : "Chọn sân bay đến";
                        })()
                      : "Chọn sân bay đến"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Tìm sân bay đến..." 
                      onValueChange={debouncedSearchArrival}
                      value={arrivalSearchTerm}
                    />
                    <CommandEmpty>
                      {loadingArrivalAirports ? "Đang tải..." : "Không tìm thấy sân bay đến."}
                    </CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-y-auto">
                      {arrivalAirports
                        .filter(airport => airport.airportId != null)
                        .map((airport) => (
                          <CommandItem
                            key={airport.airportId}
                            value={`${airport.iataCode} ${airport.name}`}
                            onSelect={() => {
                              onFormChange({ ...form, arrivalAirportId: airport.airportId!.toString() });
                              setArrivalAirportOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.arrivalAirportId === airport.airportId?.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {airport.iataCode} - {airport.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái chuyến bay</Label>
              <Select value={form.status} onValueChange={(value) => onFormChange({...form, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="DELAYED">Tạm hoãn</SelectItem>
                  <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={submitting || loadingFormData}
            onClick={onSubmit}
          >
            {submitting ? "Đang xử lý..." : submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}