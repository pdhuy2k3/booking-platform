import { BookingType, BookingFlowState } from "@/types/api/booking";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";
import { Plane, Building, Package, MapPin, Calendar, Users } from "lucide-react";
import { format } from "date-fns";

interface BookingHeaderProps {
  bookingType: BookingType;
  selectedItem?: FlightOffer | HotelOffer | PackageOffer;
  currentStep: BookingFlowState["step"];
}

export function BookingHeader({ bookingType, selectedItem, currentStep }: BookingHeaderProps) {
  const getIcon = () => {
    switch (bookingType) {
      case "flight":
        return <Plane className="h-6 w-6" />;
      case "hotel":
        return <Building className="h-6 w-6" />;
      case "package":
        return <Package className="h-6 w-6" />;
      default:
        return <Plane className="h-6 w-6" />;
    }
  };

  const getTitle = () => {
    switch (bookingType) {
      case "flight":
        return "Flight Booking";
      case "hotel":
        return "Hotel Booking";
      case "package":
        return "Package Booking";
      default:
        return "Booking";
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "selection":
        return "Select Your Option";
      case "details":
        return "Enter Your Details";
      case "payment":
        return "Complete Payment";
      case "confirmation":
        return "Booking Confirmed";
      default:
        return "";
    }
  };

  const renderItemSummary = () => {
    if (!selectedItem) return null;

    if (bookingType === "flight" && "outbound" in selectedItem) {
      const flight = selectedItem as FlightOffer;
      const outbound = flight.outbound[0];
      const lastSegment = flight.outbound[flight.outbound.length - 1];
      
      return (
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{outbound.departure.airport} → {lastSegment.arrival.airport}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(outbound.departure.dateTime), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{flight.pricing.totalPrice.amount.toLocaleString()} {flight.pricing.totalPrice.currency}</span>
          </div>
        </div>
      );
    }

    if (bookingType === "hotel" && "hotel" in selectedItem) {
      const hotel = selectedItem as HotelOffer;
      
      return (
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{hotel.hotel.location.city}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span>{hotel.hotel.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{hotel.price.total.amount.toLocaleString()} {hotel.price.total.currency}</span>
          </div>
        </div>
      );
    }

    if (bookingType === "package" && "components" in selectedItem) {
      const pkg = selectedItem as PackageOffer;
      
      return (
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{pkg.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{pkg.duration.days} days, {pkg.duration.nights} nights</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{pkg.pricing.totalPrice.amount.toLocaleString()} {pkg.pricing.totalPrice.currency}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* Main Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-600">{getStepTitle()}</p>
        </div>
      </div>

      {/* Item Summary */}
      {renderItemSummary()}
    </div>
  );
}
