import { useEffect, useState } from "react";
import { BookingType } from "@/types/api/booking";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";
import { useFlightDetails } from "@/hooks/api/use-flights";
import { useHotelDetails } from "@/hooks/api/use-hotels";
import { usePackageDetails } from "@/hooks/api/use-packages";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plane, Building, Package, MapPin, Star, Clock } from "lucide-react";
import { format } from "date-fns";

interface SelectionStepProps {
  bookingType: BookingType;
  itemId: string;
  onItemSelected: (item: FlightOffer | HotelOffer | PackageOffer) => void;
  onContinue: () => void;
}

export function SelectionStep({ bookingType, itemId, onItemSelected, onContinue }: SelectionStepProps) {
  const [selectedItem, setSelectedItem] = useState<FlightOffer | HotelOffer | PackageOffer | null>(null);

  // Fetch item details based on type
  const flightQuery = useFlightDetails(itemId, bookingType === "flight");
  const hotelQuery = useHotelDetails(itemId, bookingType === "hotel");
  const packageQuery = usePackageDetails(itemId, bookingType === "package");

  const isLoading = flightQuery.isLoading || hotelQuery.isLoading || packageQuery.isLoading;
  const error = flightQuery.error || hotelQuery.error || packageQuery.error;
  const data = flightQuery.data || hotelQuery.data || packageQuery.data;

  useEffect(() => {
    if (data) {
      setSelectedItem(data);
      onItemSelected(data);
    }
  }, [data, onItemSelected]);

  const handleContinue = () => {
    if (selectedItem) {
      onContinue();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Loading your selection...</h2>
          <p className="text-gray-600">Please wait while we fetch the details.</p>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Unable to load selection</h2>
          <p className="text-gray-600">There was an error loading the item details.</p>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderFlightDetails = (flight: FlightOffer) => {
    const outbound = flight.outbound[0];
    const lastSegment = flight.outbound[flight.outbound.length - 1];
    const hasStops = flight.outbound.length > 1;
    const totalDuration = flight.outbound.reduce((acc, segment) => acc + segment.duration, 0);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5" />
            <span>{flight.airline.name} - {flight.aircraft}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold">{outbound.departure.airport}</div>
              <div className="text-sm text-gray-600">
                {format(new Date(outbound.departure.dateTime), "HH:mm")}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(outbound.departure.dateTime), "MMM dd")}
              </div>
            </div>
            
            <div className="flex-1 mx-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="flex-1 h-px bg-gray-300"></div>
                <div className="text-center">
                  <Clock className="h-4 w-4 mx-auto text-gray-400" />
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </div>
                  {hasStops && (
                    <div className="text-xs text-gray-500">
                      {flight.outbound.length - 1} stop(s)
                    </div>
                  )}
                </div>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{lastSegment.arrival.airport}</div>
              <div className="text-sm text-gray-600">
                {format(new Date(lastSegment.arrival.dateTime), "HH:mm")}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(lastSegment.arrival.dateTime), "MMM dd")}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Class</span>
              <div className="font-medium capitalize">{flight.class}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Seats Available</span>
              <div className="font-medium">{flight.availability.seats}</div>
            </div>
          </div>

          {/* Baggage */}
          <div>
            <span className="text-sm text-gray-600">Baggage</span>
            <div className="flex space-x-2 mt-1">
              <Badge variant={flight.baggage.carry ? "default" : "secondary"}>
                Carry-on {flight.baggage.carry ? "✓" : "✗"}
              </Badge>
              <Badge variant={flight.baggage.checked ? "default" : "secondary"}>
                Checked {flight.baggage.checked ? "✓" : "✗"}
              </Badge>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Price</span>
              <span className="text-2xl font-bold text-primary">
                {flight.pricing.totalPrice.amount.toLocaleString()} {flight.pricing.totalPrice.currency}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Base: {flight.pricing.basePrice.amount.toLocaleString()} + 
              Taxes: {flight.pricing.taxes.amount.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHotelDetails = (hotel: HotelOffer) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>{hotel.hotel.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hotel Info */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              {Array.from({ length: hotel.hotel.category }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-gray-600">{hotel.hotel.category} star hotel</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{hotel.hotel.location.city}, {hotel.hotel.location.country}</span>
            </div>
          </div>

          {/* Room Details */}
          <div>
            <h4 className="font-medium mb-2">{hotel.room.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{hotel.room.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Max Occupancy</span>
                <div className="font-medium">{hotel.room.maxOccupancy} guests</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Bed Type</span>
                <div className="font-medium">{hotel.room.bedType}</div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {hotel.hotel.amenities.length > 0 && (
            <div>
              <span className="text-sm text-gray-600">Amenities</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {hotel.hotel.amenities.slice(0, 6).map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {amenity.name}
                  </Badge>
                ))}
                {hotel.hotel.amenities.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{hotel.hotel.amenities.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Policies */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Check-in</span>
              <div className="font-medium">{hotel.hotel.policies.checkIn}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Check-out</span>
              <div className="font-medium">{hotel.hotel.policies.checkOut}</div>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Price</span>
              <span className="text-2xl font-bold text-primary">
                {hotel.price.total.amount.toLocaleString()} {hotel.price.total.currency}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Per night: {hotel.price.perNight.amount.toLocaleString()} + 
              Taxes: {hotel.price.taxes.amount.toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPackageDetails = (pkg: PackageOffer) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>{pkg.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Package Info */}
          <div>
            <p className="text-gray-600 mb-4">{pkg.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Duration</span>
                <div className="font-medium">{pkg.duration.days} days, {pkg.duration.nights} nights</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Type</span>
                <Badge variant="secondary" className="capitalize">
                  {pkg.type.replace("_", " + ")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div>
            <h4 className="font-medium mb-2">What&apos;s Included</h4>
            <ul className="space-y-1">
              {pkg.inclusions.map((inclusion, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span>{inclusion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions */}
          {pkg.exclusions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Not Included</h4>
              <ul className="space-y-1">
                {pkg.exclusions.map((exclusion, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                    <span>{exclusion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total Price</span>
              <span className="text-2xl font-bold text-primary">
                {pkg.pricing.totalPrice.amount.toLocaleString()} {pkg.pricing.totalPrice.currency}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              You save: {pkg.pricing.savings.amount.toLocaleString()} {pkg.pricing.savings.currency}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderItemDetails = () => {
    if (!selectedItem) return null;

    if ("outbound" in selectedItem) {
      return renderFlightDetails(selectedItem as FlightOffer);
    }
    
    if ("hotel" in selectedItem) {
      return renderHotelDetails(selectedItem as HotelOffer);
    }
    
    if ("components" in selectedItem) {
      return renderPackageDetails(selectedItem as PackageOffer);
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review Your Selection</h2>
        <p className="text-gray-600">Please review the details below and continue to enter your information.</p>
      </div>

      {renderItemDetails()}

      <div className="flex justify-end">
        <Button 
          onClick={handleContinue} 
          disabled={!selectedItem}
          size="lg"
        >
          Continue to Details
        </Button>
      </div>
    </div>
  );
}
