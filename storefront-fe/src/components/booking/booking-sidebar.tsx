import { BookingFlowState, PassengerInfo } from "@/types/api/booking";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Building, Package, Users, Star } from "lucide-react";
import { format } from "date-fns";

interface BookingSidebarProps {
  selectedItem?: FlightOffer | HotelOffer | PackageOffer;
  passengers: PassengerInfo[];
  totalAmount: number;
  currency: string;
  currentStep: BookingFlowState["step"];
}

export function BookingSidebar({
  selectedItem,
  passengers,
  totalAmount,
  currency
}: BookingSidebarProps) {
  const renderItemDetails = () => {
    if (!selectedItem) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No item selected</p>
          </CardContent>
        </Card>
      );
    }

    // Flight Details
    if ("outbound" in selectedItem) {
      const flight = selectedItem as FlightOffer;
      const outbound = flight.outbound[0];
      const lastSegment = flight.outbound[flight.outbound.length - 1];
      const hasStops = flight.outbound.length > 1;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5" />
              <span>Flight Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Airline */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Airline</span>
              <span className="font-medium">{flight.airline.name}</span>
            </div>

            {/* Route */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">From</span>
                <span className="font-medium">{outbound.departure.airport}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">To</span>
                <span className="font-medium">{lastSegment.arrival.airport}</span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Departure</span>
                <div className="text-right">
                  <div className="font-medium">
                    {format(new Date(outbound.departure.dateTime), "HH:mm")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(outbound.departure.dateTime), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Arrival</span>
                <div className="text-right">
                  <div className="font-medium">
                    {format(new Date(lastSegment.arrival.dateTime), "HH:mm")}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(lastSegment.arrival.dateTime), "MMM dd, yyyy")}
                  </div>
                </div>
              </div>
            </div>

            {/* Stops */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Stops</span>
              <Badge variant={hasStops ? "secondary" : "default"}>
                {hasStops ? `${flight.outbound.length - 1} stop(s)` : "Direct"}
              </Badge>
            </div>

            {/* Class */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Class</span>
              <span className="font-medium capitalize">{flight.class}</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Hotel Details
    if ("hotel" in selectedItem) {
      const hotel = selectedItem as HotelOffer;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Hotel Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Hotel Name */}
            <div>
              <h3 className="font-medium">{hotel.hotel.name}</h3>
              <div className="flex items-center space-x-1 mt-1">
                {Array.from({ length: hotel.hotel.category }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-500 ml-1">
                  {hotel.hotel.category} star
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Location</span>
              <span className="font-medium">{hotel.hotel.location.city}</span>
            </div>

            {/* Room Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Room</span>
              <span className="font-medium">{hotel.room.name}</span>
            </div>

            {/* Board Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Board</span>
              <Badge variant="secondary" className="capitalize">
                {hotel.boardType.replace("_", " ")}
              </Badge>
            </div>

            {/* Cancellation */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancellation</span>
              <Badge variant={hotel.room.cancellationPolicy.refundable ? "default" : "destructive"}>
                {hotel.room.cancellationPolicy.refundable ? "Free" : "Non-refundable"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Package Details
    if ("components" in selectedItem) {
      const pkg = selectedItem as PackageOffer;

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Package Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Package Name */}
            <div>
              <h3 className="font-medium">{pkg.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="font-medium">{pkg.duration.days} days, {pkg.duration.nights} nights</span>
            </div>

            {/* Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Type</span>
              <Badge variant="secondary" className="capitalize">
                {pkg.type.replace("_", " + ")}
              </Badge>
            </div>

            {/* Inclusions */}
            <div>
              <span className="text-sm text-gray-600">Includes</span>
              <ul className="mt-2 space-y-1">
                {pkg.inclusions.slice(0, 3).map((inclusion, index) => (
                  <li key={index} className="text-sm flex items-center space-x-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    <span>{inclusion}</span>
                  </li>
                ))}
                {pkg.inclusions.length > 3 && (
                  <li className="text-xs text-gray-500">
                    +{pkg.inclusions.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const renderPassengerSummary = () => {
    if (passengers.length === 0) return null;

    const adults = passengers.filter(p => p.type === "adult").length;
    const children = passengers.filter(p => p.type === "child").length;
    const infants = passengers.filter(p => p.type === "infant").length;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Passengers</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {adults > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Adults</span>
              <span className="font-medium">{adults}</span>
            </div>
          )}
          {children > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Children</span>
              <span className="font-medium">{children}</span>
            </div>
          )}
          {infants > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Infants</span>
              <span className="font-medium">{infants}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPricingSummary = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span>{(totalAmount * 0.9).toLocaleString()} {currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxes & Fees</span>
              <span>{(totalAmount * 0.1).toLocaleString()} {currency}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{totalAmount.toLocaleString()} {currency}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderItemDetails()}
      {renderPassengerSummary()}
      {renderPricingSummary()}
    </div>
  );
}
