import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  BookingFlowState, 
  PassengerInfo, 
  ContactInfo, 
  BillingInfo,
  BookingType,
  SearchToBookingData
} from "@/types/api/booking";
import { FlightOffer } from "@/types/api/flight";
import { HotelOffer } from "@/types/api/hotel";
import { PackageOffer } from "@/types/api/package";

const initialState: BookingFlowState = {
  step: "selection",
  passengers: [],
  specialRequests: [],
  totalAmount: 0,
  currency: "VND",
  errors: {},
  isLoading: false,
};

export function useBookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<BookingFlowState>(initialState);

  // Initialize booking flow from search results
  const initializeFromSearch = useCallback((searchData: SearchToBookingData) => {
    const passengerCount = searchData.passengers.adults + 
                          searchData.passengers.children + 
                          searchData.passengers.infants;
    
    // Create initial passenger list
    const passengers: PassengerInfo[] = [];
    
    // Add adults
    for (let i = 0; i < searchData.passengers.adults; i++) {
      passengers.push({
        type: "adult",
        title: "mr",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
      });
    }
    
    // Add children
    for (let i = 0; i < searchData.passengers.children; i++) {
      passengers.push({
        type: "child",
        title: "mr",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
      });
    }
    
    // Add infants
    for (let i = 0; i < searchData.passengers.infants; i++) {
      passengers.push({
        type: "infant",
        title: "mr",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationality: "",
      });
    }

    setState(prev => ({
      ...prev,
      passengers,
      step: "details",
    }));
  }, []);

  // Set selected item (flight, hotel, or package)
  const setSelectedItem = useCallback((item: FlightOffer | HotelOffer | PackageOffer) => {
    setState(prev => ({
      ...prev,
      selectedItem: item,
      totalAmount: 'pricing' in item ? item.pricing.totalPrice.amount : 
                   'price' in item ? item.price.total.amount : 0,
      currency: 'pricing' in item ? item.pricing.totalPrice.currency : 
                'price' in item ? item.price.total.currency : "VND",
    }));
  }, []);

  // Update passenger information
  const updatePassenger = useCallback((index: number, passenger: Partial<PassengerInfo>) => {
    setState(prev => ({
      ...prev,
      passengers: prev.passengers.map((p, i) => 
        i === index ? { ...p, ...passenger } : p
      ),
      errors: {
        ...prev.errors,
        [`passenger_${index}`]: undefined,
      },
    }));
  }, []);

  // Update contact information
  const updateContactInfo = useCallback((contactInfo: Partial<ContactInfo>) => {
    setState(prev => ({
      ...prev,
      contactInfo: prev.contactInfo ? { ...prev.contactInfo, ...contactInfo } : contactInfo as ContactInfo,
      errors: {
        ...prev.errors,
        contact: undefined,
      },
    }));
  }, []);

  // Update billing information
  const updateBillingInfo = useCallback((billingInfo: Partial<BillingInfo>) => {
    setState(prev => ({
      ...prev,
      billingInfo: prev.billingInfo ? { ...prev.billingInfo, ...billingInfo } : billingInfo as BillingInfo,
      errors: {
        ...prev.errors,
        billing: undefined,
      },
    }));
  }, []);

  // Update payment method
  const updatePaymentMethod = useCallback((paymentMethod: { type: string; details?: any }) => {
    setState(prev => ({
      ...prev,
      paymentMethod,
      errors: {
        ...prev.errors,
        payment: undefined,
      },
    }));
  }, []);

  // Add special request
  const addSpecialRequest = useCallback((request: string) => {
    setState(prev => ({
      ...prev,
      specialRequests: [...prev.specialRequests, request],
    }));
  }, []);

  // Remove special request
  const removeSpecialRequest = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      specialRequests: prev.specialRequests.filter((_, i) => i !== index),
    }));
  }, []);

  // Apply promo code
  const applyPromoCode = useCallback((promoCode: string) => {
    setState(prev => ({
      ...prev,
      promoCode,
    }));
  }, []);

  // Set loading state
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }));
  }, []);

  // Set errors
  const setErrors = useCallback((errors: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
    }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
    }));
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    setState(prev => {
      const steps: BookingFlowState["step"][] = ["selection", "details", "payment", "confirmation"];
      const currentIndex = steps.indexOf(prev.step);
      const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
      return {
        ...prev,
        step: steps[nextIndex],
      };
    });
  }, []);

  // Navigate to previous step
  const previousStep = useCallback(() => {
    setState(prev => {
      const steps: BookingFlowState["step"][] = ["selection", "details", "payment", "confirmation"];
      const currentIndex = steps.indexOf(prev.step);
      const prevIndex = Math.max(currentIndex - 1, 0);
      return {
        ...prev,
        step: steps[prevIndex],
      };
    });
  }, []);

  // Go to specific step
  const goToStep = useCallback((step: BookingFlowState["step"]) => {
    setState(prev => ({
      ...prev,
      step,
    }));
  }, []);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (state.step === "details") {
      // Validate passengers
      state.passengers.forEach((passenger, index) => {
        if (!passenger.firstName.trim()) {
          errors[`passenger_${index}_firstName`] = "First name is required";
        }
        if (!passenger.lastName.trim()) {
          errors[`passenger_${index}_lastName`] = "Last name is required";
        }
        if (!passenger.dateOfBirth) {
          errors[`passenger_${index}_dateOfBirth`] = "Date of birth is required";
        }
        if (!passenger.nationality) {
          errors[`passenger_${index}_nationality`] = "Nationality is required";
        }
      });

      // Validate contact info
      if (!state.contactInfo?.email) {
        errors.contact_email = "Email is required";
      }
      if (!state.contactInfo?.phone) {
        errors.contact_phone = "Phone number is required";
      }
    }

    if (state.step === "payment") {
      if (!state.paymentMethod?.type) {
        errors.payment_method = "Payment method is required";
      }
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [state, setErrors]);

  // Reset booking flow
  const resetFlow = useCallback(() => {
    setState(initialState);
  }, []);

  // Get booking data for submission
  const getBookingData = useCallback(() => {
    if (!state.selectedItem || !state.contactInfo) {
      throw new Error("Missing required booking data");
    }

    const bookingType: BookingType = 'outbound' in state.selectedItem ? 'flight' :
                                    'hotel' in state.selectedItem ? 'hotel' : 'package';

    return {
      bookingType,
      ...(bookingType === 'flight' && { flightOffer: state.selectedItem as FlightOffer }),
      ...(bookingType === 'hotel' && { hotelOffer: state.selectedItem as HotelOffer }),
      ...(bookingType === 'package' && { packageOffer: state.selectedItem as PackageOffer }),
      passengers: state.passengers,
      contactInfo: state.contactInfo,
      billingInfo: state.billingInfo,
      specialRequests: state.specialRequests,
      paymentMethod: state.paymentMethod || { type: "stripe" },
      totalAmount: state.totalAmount,
      currency: state.currency,
      promoCode: state.promoCode,
      termsAccepted: true,
    };
  }, [state]);

  return {
    // State
    ...state,
    
    // Actions
    initializeFromSearch,
    setSelectedItem,
    updatePassenger,
    updateContactInfo,
    updateBillingInfo,
    updatePaymentMethod,
    addSpecialRequest,
    removeSpecialRequest,
    applyPromoCode,
    setLoading,
    setErrors,
    clearErrors,
    nextStep,
    previousStep,
    goToStep,
    validateCurrentStep,
    resetFlow,
    getBookingData,
  };
}
