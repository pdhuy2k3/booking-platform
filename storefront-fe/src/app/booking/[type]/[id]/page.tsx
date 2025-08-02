"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { BookingSteps } from "@/components/booking/booking-steps";
import { BookingHeader } from "@/components/booking/booking-header";
import { BookingSidebar } from "@/components/booking/booking-sidebar";
import { SelectionStep } from "@/components/booking/steps/selection-step";
import { DetailsStep } from "@/components/booking/steps/details-step";
import { PaymentStep } from "@/components/booking/steps/payment-step";
import { ConfirmationStep } from "@/components/booking/steps/confirmation-step";
import { useBookingFlow } from "@/hooks/use-booking-flow";
import { BookingType } from "@/types/api/booking";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingType = params.type as BookingType;
  const itemId = params.id as string;

  const {
    step,
    selectedItem,
    passengers,
    contactInfo,
    billingInfo,
    paymentMethod,
    totalAmount,
    currency,
    errors,
    initializeFromSearch,
    setSelectedItem,
    nextStep,
    previousStep,
    validateCurrentStep,
  } = useBookingFlow();

  // Initialize booking flow from URL parameters
  useEffect(() => {
    if (searchParams.get("from_search") === "true") {
      const searchData = {
        searchType: bookingType,
        selectedItemId: itemId,
        searchParams: Object.fromEntries(searchParams.entries()),
        passengers: {
          adults: parseInt(searchParams.get("adults") || "1"),
          children: parseInt(searchParams.get("children") || "0"),
          infants: parseInt(searchParams.get("infants") || "0"),
        },
        rooms: searchParams.get("rooms") ? JSON.parse(searchParams.get("rooms")!) : undefined,
      };
      
      initializeFromSearch(searchData);
    }
  }, [searchParams, bookingType, itemId, initializeFromSearch]);

  const handleStepComplete = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case "selection":
        return (
          <SelectionStep
            bookingType={bookingType}
            itemId={itemId}
            onItemSelected={setSelectedItem}
            onContinue={handleStepComplete}
          />
        );
      case "details":
        return (
          <DetailsStep
            passengers={passengers}
            contactInfo={contactInfo}
            billingInfo={billingInfo}
            errors={errors}
            onContinue={handleStepComplete}
            onBack={previousStep}
          />
        );
      case "payment":
        return (
          <PaymentStep
            selectedItem={selectedItem}
            passengers={passengers}
            contactInfo={contactInfo}
            billingInfo={billingInfo}
            totalAmount={totalAmount}
            currency={currency}
            paymentMethod={paymentMethod}
            onContinue={handleStepComplete}
            onBack={previousStep}
          />
        );
      case "confirmation":
        return (
          <ConfirmationStep
            bookingType={bookingType}
            selectedItem={selectedItem}
            passengers={passengers}
            contactInfo={contactInfo}
            totalAmount={totalAmount}
            currency={currency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/search">Search</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Booking</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Booking Header */}
          <BookingHeader
            bookingType={bookingType}
            selectedItem={selectedItem}
            currentStep={step}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <BookingSteps currentStep={step} className="mb-8" />
            
            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {renderCurrentStep()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BookingSidebar
              selectedItem={selectedItem}
              passengers={passengers}
              totalAmount={totalAmount}
              currency={currency}
              currentStep={step}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
