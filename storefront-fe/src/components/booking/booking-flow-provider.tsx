"use client";

import { ReactNode, createContext, useContext } from "react";
import { useBookingFlow } from "@/hooks/use-booking-flow";

type BookingFlowContextType = ReturnType<typeof useBookingFlow>;

const BookingFlowContext = createContext<BookingFlowContextType | null>(null);

interface BookingFlowProviderProps {
  children: ReactNode;
}

export function BookingFlowProvider({ children }: BookingFlowProviderProps) {
  const bookingFlow = useBookingFlow();

  return (
    <BookingFlowContext.Provider value={bookingFlow}>
      {children}
    </BookingFlowContext.Provider>
  );
}

export function useBookingFlowContext() {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error("useBookingFlowContext must be used within a BookingFlowProvider");
  }
  return context;
}
