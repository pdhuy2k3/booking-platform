import { useState } from "react";
import { PassengerInfo, ContactInfo, BillingInfo } from "@/types/api/booking";
import { useBookingFlow } from "@/hooks/use-booking-flow";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, AlertCircle } from "lucide-react";

interface DetailsStepProps {
  passengers: PassengerInfo[];
  contactInfo?: ContactInfo;
  billingInfo?: BillingInfo;
  errors: Record<string, string>;
  onContinue: () => void;
  onBack: () => void;
}

export function DetailsStep({ 
  passengers, 
  contactInfo, 
  billingInfo, 
  errors, 
  onContinue, 
  onBack 
}: DetailsStepProps) {
  const { 
    updatePassenger, 
    updateContactInfo, 
    updateBillingInfo,
    addSpecialRequest,
    removeSpecialRequest,
    specialRequests
  } = useBookingFlow();


  const [specialRequest, setSpecialRequest] = useState("");

  const handlePassengerChange = (index: number, field: keyof PassengerInfo, value: string) => {
    updatePassenger(index, { [field]: value });
  };

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    updateContactInfo({ [field]: value });
  };



  const handleAddSpecialRequest = () => {
    if (specialRequest.trim()) {
      addSpecialRequest(specialRequest.trim());
      setSpecialRequest("");
    }
  };

  const validateAndContinue = () => {
    // Basic validation
    const hasErrors = Object.keys(errors).length > 0;
    const hasRequiredFields = passengers.every(p => p.firstName && p.lastName && p.dateOfBirth && p.nationality) &&
                             contactInfo?.email && contactInfo?.phone;

    if (!hasErrors && hasRequiredFields) {
      onContinue();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Enter Your Details</h2>
        <p className="text-gray-600">Please provide passenger and contact information for your booking.</p>
      </div>

      {/* Passenger Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Passenger Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {passengers.map((passenger, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Passenger {index + 1} ({passenger.type})
                </h4>
                {passenger.type === "adult" && index === 0 && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Primary Contact
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`title-${index}`}>Title</Label>
                  <Select
                    value={passenger.title}
                    onValueChange={(value) => handlePassengerChange(index, "title", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mr">Mr.</SelectItem>
                      <SelectItem value="mrs">Mrs.</SelectItem>
                      <SelectItem value="ms">Ms.</SelectItem>
                      <SelectItem value="dr">Dr.</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors[`passenger_${index}_title`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`passenger_${index}_title`]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`firstName-${index}`}>First Name</Label>
                  <Input
                    id={`firstName-${index}`}
                    value={passenger.firstName}
                    onChange={(e) => handlePassengerChange(index, "firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                  {errors[`passenger_${index}_firstName`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`passenger_${index}_firstName`]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                  <Input
                    id={`lastName-${index}`}
                    value={passenger.lastName}
                    onChange={(e) => handlePassengerChange(index, "lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                  {errors[`passenger_${index}_lastName`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`passenger_${index}_lastName`]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth</Label>
                  <Input
                    id={`dateOfBirth-${index}`}
                    type="date"
                    value={passenger.dateOfBirth}
                    onChange={(e) => handlePassengerChange(index, "dateOfBirth", e.target.value)}
                  />
                  {errors[`passenger_${index}_dateOfBirth`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`passenger_${index}_dateOfBirth`]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`nationality-${index}`}>Nationality</Label>
                  <Input
                    id={`nationality-${index}`}
                    value={passenger.nationality}
                    onChange={(e) => handlePassengerChange(index, "nationality", e.target.value)}
                    placeholder="Enter nationality"
                  />
                  {errors[`passenger_${index}_nationality`] && (
                    <p className="text-sm text-red-600 mt-1">{errors[`passenger_${index}_nationality`]}</p>
                  )}
                </div>
              </div>

              {/* Passport Information (for international flights) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`passportNumber-${index}`}>Passport Number (Optional)</Label>
                  <Input
                    id={`passportNumber-${index}`}
                    value={passenger.passportNumber || ""}
                    onChange={(e) => handlePassengerChange(index, "passportNumber", e.target.value)}
                    placeholder="Enter passport number"
                  />
                </div>

                <div>
                  <Label htmlFor={`passportExpiry-${index}`}>Passport Expiry (Optional)</Label>
                  <Input
                    id={`passportExpiry-${index}`}
                    type="date"
                    value={passenger.passportExpiry || ""}
                    onChange={(e) => handlePassengerChange(index, "passportExpiry", e.target.value)}
                  />
                </div>
              </div>

              {index < passengers.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo?.email || ""}
                onChange={(e) => handleContactChange("email", e.target.value)}
                placeholder="Enter email address"
              />
              {errors.contact_email && (
                <p className="text-sm text-red-600 mt-1">{errors.contact_email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={contactInfo?.phone || ""}
                onChange={(e) => handleContactChange("phone", e.target.value)}
                placeholder="Enter phone number"
              />
              {errors.contact_phone && (
                <p className="text-sm text-red-600 mt-1">{errors.contact_phone}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="countryCode">Country Code</Label>
            <Input
              id="countryCode"
              value={contactInfo?.countryCode || "+84"}
              onChange={(e) => handleContactChange("countryCode", e.target.value)}
              placeholder="Enter country code"
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Special Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="Enter special request (e.g., wheelchair assistance, dietary requirements)"
              onKeyPress={(e) => e.key === "Enter" && handleAddSpecialRequest()}
            />
            <Button onClick={handleAddSpecialRequest} variant="outline">
              Add
            </Button>
          </div>

          {specialRequests.length > 0 && (
            <div className="space-y-2">
              {specialRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{request}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeSpecialRequest(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Summary */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please correct the errors above before continuing.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Selection
        </Button>
        <Button onClick={validateAndContinue} size="lg">
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
