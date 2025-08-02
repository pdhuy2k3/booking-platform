import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface BookingFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Travel Information
  passengers: PassengerInfo[];
  specialRequests?: string;
  
  // Payment Information
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  
  // Additional Information
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface PassengerInfo {
  id: string;
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  passportExpiry?: Date;
  nationality?: string;
  specialNeeds?: string;
}

export interface BookingStep {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
  canAccess: boolean;
}

export interface BookingState {
  // Booking flow state
  currentStep: number;
  totalSteps: number;
  steps: BookingStep[];
  
  // Booking data
  bookingId: string | null;
  formData: BookingFormData;
  selectedFlight: any | null; // TODO: Replace with proper flight type
  selectedHotel: any | null;  // TODO: Replace with proper hotel type
  selectedPackage: any | null; // TODO: Replace with proper package type
  
  // Pricing
  basePrice: number;
  taxes: number;
  fees: number;
  discounts: number;
  totalPrice: number;
  
  // State flags
  isProcessing: boolean;
  isConfirmed: boolean;
  errors: Record<string, string>;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  addPassenger: (passenger: PassengerInfo) => void;
  updatePassenger: (id: string, data: Partial<PassengerInfo>) => void;
  removePassenger: (id: string) => void;
  setSelectedFlight: (flight: any) => void;
  setSelectedHotel: (hotel: any) => void;
  setSelectedPackage: (packageData: any) => void;
  updatePricing: (pricing: {
    basePrice?: number;
    taxes?: number;
    fees?: number;
    discounts?: number;
  }) => void;
  setProcessing: (isProcessing: boolean) => void;
  setConfirmed: (isConfirmed: boolean) => void;
  setError: (field: string, error: string) => void;
  clearErrors: () => void;
  resetBooking: () => void;
  completeStep: (stepIndex: number) => void;
  validateStep: (stepIndex: number) => boolean;
}

const initialSteps: BookingStep[] = [
  { id: 'selection', title: 'Selection', completed: false, active: true, canAccess: true },
  { id: 'details', title: 'Details', completed: false, active: false, canAccess: false },
  { id: 'passengers', title: 'Passengers', completed: false, active: false, canAccess: false },
  { id: 'payment', title: 'Payment', completed: false, active: false, canAccess: false },
  { id: 'confirmation', title: 'Confirmation', completed: false, active: false, canAccess: false },
];

const initialFormData: BookingFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  passengers: [],
  paymentMethod: 'credit_card',
};

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentStep: 0,
        totalSteps: initialSteps.length,
        steps: initialSteps,
        
        bookingId: null,
        formData: initialFormData,
        selectedFlight: null,
        selectedHotel: null,
        selectedPackage: null,
        
        basePrice: 0,
        taxes: 0,
        fees: 0,
        discounts: 0,
        totalPrice: 0,
        
        isProcessing: false,
        isConfirmed: false,
        errors: {},
        
        // Actions
        setCurrentStep: (step) => {
          const state = get();
          if (step >= 0 && step < state.totalSteps && state.steps[step].canAccess) {
            const updatedSteps = state.steps.map((s, index) => ({
              ...s,
              active: index === step,
            }));
            
            set({ 
              currentStep: step,
              steps: updatedSteps,
            });
          }
        },
        
        nextStep: () => {
          const state = get();
          const nextStep = state.currentStep + 1;
          
          if (nextStep < state.totalSteps) {
            // Validate current step before moving
            if (state.validateStep(state.currentStep)) {
              state.completeStep(state.currentStep);
              
              // Enable access to next step
              const updatedSteps = state.steps.map((step, index) => ({
                ...step,
                canAccess: index <= nextStep,
                active: index === nextStep,
              }));
              
              set({
                currentStep: nextStep,
                steps: updatedSteps,
              });
            }
          }
        },
        
        previousStep: () => {
          const state = get();
          const prevStep = state.currentStep - 1;
          
          if (prevStep >= 0) {
            const updatedSteps = state.steps.map((step, index) => ({
              ...step,
              active: index === prevStep,
            }));
            
            set({
              currentStep: prevStep,
              steps: updatedSteps,
            });
          }
        },
        
        updateFormData: (data) => {
          const currentFormData = get().formData;
          set({
            formData: { ...currentFormData, ...data },
          });
        },
        
        addPassenger: (passenger) => {
          const currentPassengers = get().formData.passengers;
          set({
            formData: {
              ...get().formData,
              passengers: [...currentPassengers, passenger],
            },
          });
        },
        
        updatePassenger: (id, data) => {
          const currentPassengers = get().formData.passengers;
          const updatedPassengers = currentPassengers.map(passenger =>
            passenger.id === id ? { ...passenger, ...data } : passenger
          );
          
          set({
            formData: {
              ...get().formData,
              passengers: updatedPassengers,
            },
          });
        },
        
        removePassenger: (id) => {
          const currentPassengers = get().formData.passengers;
          const updatedPassengers = currentPassengers.filter(passenger => passenger.id !== id);
          
          set({
            formData: {
              ...get().formData,
              passengers: updatedPassengers,
            },
          });
        },
        
        setSelectedFlight: (flight) => {
          set({ selectedFlight: flight });
        },
        
        setSelectedHotel: (hotel) => {
          set({ selectedHotel: hotel });
        },
        
        setSelectedPackage: (packageData) => {
          set({ selectedPackage: packageData });
        },
        
        updatePricing: (pricing) => {
          const currentState = get();
          const updatedPricing = {
            basePrice: pricing.basePrice ?? currentState.basePrice,
            taxes: pricing.taxes ?? currentState.taxes,
            fees: pricing.fees ?? currentState.fees,
            discounts: pricing.discounts ?? currentState.discounts,
          };
          
          const totalPrice = updatedPricing.basePrice + updatedPricing.taxes + updatedPricing.fees - updatedPricing.discounts;
          
          set({
            ...updatedPricing,
            totalPrice,
          });
        },
        
        setProcessing: (isProcessing) => {
          set({ isProcessing });
        },
        
        setConfirmed: (isConfirmed) => {
          set({ isConfirmed });
        },
        
        setError: (field, error) => {
          const currentErrors = get().errors;
          set({
            errors: { ...currentErrors, [field]: error },
          });
        },
        
        clearErrors: () => {
          set({ errors: {} });
        },
        
        resetBooking: () => {
          set({
            currentStep: 0,
            steps: initialSteps,
            bookingId: null,
            formData: initialFormData,
            selectedFlight: null,
            selectedHotel: null,
            selectedPackage: null,
            basePrice: 0,
            taxes: 0,
            fees: 0,
            discounts: 0,
            totalPrice: 0,
            isProcessing: false,
            isConfirmed: false,
            errors: {},
          });
        },
        
        completeStep: (stepIndex) => {
          const currentSteps = get().steps;
          const updatedSteps = currentSteps.map((step, index) =>
            index === stepIndex ? { ...step, completed: true } : step
          );
          
          set({ steps: updatedSteps });
        },
        
        validateStep: (stepIndex) => {
          const state = get();
          
          switch (stepIndex) {
            case 0: // Selection
              return state.selectedFlight || state.selectedHotel || state.selectedPackage;
            
            case 1: // Details
              const { firstName, lastName, email, phone } = state.formData;
              return firstName.length > 0 && lastName.length > 0 && email.length > 0 && phone.length > 0;
            
            case 2: // Passengers
              return state.formData.passengers.length > 0 && 
                     state.formData.passengers.every(p => p.firstName && p.lastName);
            
            case 3: // Payment
              return state.formData.paymentMethod.length > 0;
            
            default:
              return true;
          }
        },
      }),
      {
        name: 'booking-store',
        partialize: (state) => ({
          formData: state.formData,
          selectedFlight: state.selectedFlight,
          selectedHotel: state.selectedHotel,
          selectedPackage: state.selectedPackage,
          currentStep: state.currentStep,
          steps: state.steps,
        }),
      }
    ),
    { name: 'BookingStore' }
  )
);

// Selectors for optimized re-renders
export const useBookingStep = () => useBookingStore((state) => ({
  currentStep: state.currentStep,
  totalSteps: state.totalSteps,
  steps: state.steps,
}));

export const useBookingFormData = () => useBookingStore((state) => state.formData);
export const useBookingSelections = () => useBookingStore((state) => ({
  flight: state.selectedFlight,
  hotel: state.selectedHotel,
  package: state.selectedPackage,
}));

export const useBookingPricing = () => useBookingStore((state) => ({
  basePrice: state.basePrice,
  taxes: state.taxes,
  fees: state.fees,
  discounts: state.discounts,
  totalPrice: state.totalPrice,
}));

export const useBookingStatus = () => useBookingStore((state) => ({
  isProcessing: state.isProcessing,
  isConfirmed: state.isConfirmed,
  errors: state.errors,
}));
