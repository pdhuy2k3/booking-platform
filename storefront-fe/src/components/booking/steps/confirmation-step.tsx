import { useState } from "react";
import { BookingType, PassengerInfo, ContactInfo } from "@/types/api/booking";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";
import { useResendConfirmationEmail, useDownloadBookingDocuments } from "@/hooks/api/use-bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  Mail,
  Download,
  Calendar,
  Users,
  Plane,
  Building,
  Package,
  Share2,
  Home
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ConfirmationStepProps {
  bookingType: BookingType;
  selectedItem?: FlightOffer | HotelOffer | PackageOffer;
  passengers: PassengerInfo[];
  contactInfo?: ContactInfo;
  totalAmount: number;
  currency: string;
}

export function ConfirmationStep({
  bookingType,
  selectedItem,
  passengers,
  contactInfo,
  totalAmount,
  currency,
}: ConfirmationStepProps) {
  const router = useRouter();
  const [bookingReference] = useState(`BKS${Date.now().toString().slice(-8)}`); // Mock booking reference
  const resendEmail = useResendConfirmationEmail();
  const downloadDocuments = useDownloadBookingDocuments();

  const handleResendEmail = async () => {
    try {
      await resendEmail.mutateAsync(bookingReference);
    } catch (error) {
      console.error("Failed to resend email:", error);
    }
  };

  const handleDownloadDocuments = async () => {
    try {
      await downloadDocuments.mutateAsync({
        bookingId: bookingReference,
        documentType: "all",
      });
    } catch (error) {
      console.error("Failed to download documents:", error);
    }
  };

  const handleShareBooking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BookingSmart - Booking Confirmation",
          text: `My booking confirmation: ${bookingReference}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Failed to share:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Booking Reference: ${bookingReference}`);
    }
  };

  const getBookingIcon = () => {
    switch (bookingType) {
      case "flight":
        return <Plane className="h-8 w-8 text-primary" />;
      case "hotel":
        return <Building className="h-8 w-8 text-primary" />;
      case "package":
        return <Package className="h-8 w-8 text-primary" />;
      default:
        return <CheckCircle className="h-8 w-8 text-primary" />;
    }
  };

  const getBookingTitle = () => {
    switch (bookingType) {
      case "flight":
        return "Flight Booked Successfully!";
      case "hotel":
        return "Hotel Booked Successfully!";
      case "package":
        return "Package Booked Successfully!";
      default:
        return "Booking Confirmed!";
    }
  };

  const renderBookingDetails = () => {
    if (!selectedItem) return null;

    if (bookingType === "flight" && "outbound" in selectedItem) {
      const flight = selectedItem as FlightOffer;
      const outbound = flight.outbound[0];
      const lastSegment = flight.outbound[flight.outbound.length - 1];

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Flight</span>
            <span className="font-medium">{flight.airline.name} - {flight.aircraft}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Route</span>
            <span className="font-medium">{outbound.departure.airport} → {lastSegment.arrival.airport}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Departure</span>
            <span className="font-medium">
              {format(new Date(outbound.departure.dateTime), "MMM dd, yyyy 'at' HH:mm")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Class</span>
            <Badge variant="secondary" className="capitalize">{flight.class}</Badge>
          </div>
        </div>
      );
    }

    if (bookingType === "hotel" && "hotel" in selectedItem) {
      const hotel = selectedItem as HotelOffer;

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Hotel</span>
            <span className="font-medium">{hotel.hotel.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Location</span>
            <span className="font-medium">{hotel.hotel.location.city}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Room</span>
            <span className="font-medium">{hotel.room.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Check-in</span>
            <span className="font-medium">{hotel.hotel.policies.checkIn}</span>
          </div>
        </div>
      );
    }

    if (bookingType === "package" && "components" in selectedItem) {
      const pkg = selectedItem as PackageOffer;

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Package</span>
            <span className="font-medium">{pkg.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Duration</span>
            <span className="font-medium">{pkg.duration.days} days, {pkg.duration.nights} nights</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Type</span>
            <Badge variant="secondary" className="capitalize">
              {pkg.type.replace("_", " + ")}
            </Badge>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">{getBookingTitle()}</h2>
          <p className="text-gray-600">
            Your booking has been confirmed and a confirmation email has been sent to{" "}
            <span className="font-medium">{contactInfo?.email}</span>
          </p>
        </div>
      </div>

      {/* Booking Reference */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Booking Reference</p>
            <p className="text-3xl font-bold text-primary tracking-wider">{bookingReference}</p>
            <p className="text-xs text-gray-500">Please save this reference number for your records</p>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getBookingIcon()}
            <span>Booking Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderBookingDetails()}
        </CardContent>
      </Card>

      {/* Passenger Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Passenger Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {passengers.map((passenger, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-600">
                  Passenger {index + 1} ({passenger.type})
                </span>
                <span className="font-medium">
                  {passenger.title} {passenger.firstName} {passenger.lastName}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{(totalAmount * 0.9).toLocaleString()} {currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & Fees</span>
              <span>{(totalAmount * 0.1).toLocaleString()} {currency}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Paid</span>
              <span className="text-green-600">{totalAmount.toLocaleString()} {currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What&apos;s Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Check Your Email</p>
                <p className="text-sm text-gray-600">
                  We&apos;ve sent your booking confirmation and tickets to your email address.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Prepare for Your Trip</p>
                <p className="text-sm text-gray-600">
                  Make sure to arrive at the departure point with sufficient time.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Download className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Download Documents</p>
                <p className="text-sm text-gray-600">
                  Download your tickets and vouchers for offline access.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={handleResendEmail}
          disabled={resendEmail.isPending}
          className="w-full"
        >
          <Mail className="h-4 w-4 mr-2" />
          {resendEmail.isPending ? "Sending..." : "Resend Email"}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleDownloadDocuments}
          disabled={downloadDocuments.isPending}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {downloadDocuments.isPending ? "Downloading..." : "Download Documents"}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleShareBooking}
          className="w-full"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Booking
        </Button>
        
        <Button
          onClick={() => router.push("/")}
          className="w-full"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Support Information */}
      <Alert>
        <AlertDescription>
          Need help? Contact our support team at{" "}
          <a href="mailto:support@bookingsmart.com" className="text-primary hover:underline">
            support@bookingsmart.com
          </a>{" "}
          or call +84 123 456 789. Please have your booking reference ready.
        </AlertDescription>
      </Alert>
    </div>
  );
}
