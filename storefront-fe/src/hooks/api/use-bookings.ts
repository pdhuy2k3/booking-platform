import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BookingService } from "@/services/booking-service";
import { 
  BookingRequest, 
  BookingResponse,
  BookingHistoryItem,
  BookingModificationRequest,
  BookingCancellationRequest,
  PaymentIntent
} from "@/types/api/booking";
import { QUERY_KEYS } from "@/lib/utils/constants";
import { toast } from "sonner";

/**
 * Hook for creating a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingData: BookingRequest) => 
      BookingService.createBooking(bookingData),
    onSuccess: (data) => {
      toast.success("Booking created successfully!");
      // Invalidate booking history to refresh the list
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKING_HISTORY] 
      });
    },
    onError: (error: any) => {
      console.error("Booking creation error:", error);
      toast.error(error?.message || "Failed to create booking. Please try again.");
    },
  });
}

/**
 * Hook for getting booking details
 */
export function useBookingDetails(bookingId: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.BOOKING_DETAILS, bookingId],
    queryFn: () => BookingService.getBookingDetails(bookingId),
    enabled: enabled && !!bookingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting booking by reference
 */
export function useBookingByReference(reference: string, enabled = true) {
  return useQuery({
    queryKey: [QUERY_KEYS.BOOKING_DETAILS, "reference", reference],
    queryFn: () => BookingService.getBookingByReference(reference),
    enabled: enabled && !!reference,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for getting booking history
 */
export function useBookingHistory(
  page = 1, 
  limit = 10, 
  status?: string,
  enabled = true
) {
  return useQuery({
    queryKey: [QUERY_KEYS.BOOKING_HISTORY, page, limit, status],
    queryFn: () => BookingService.getBookingHistory(page, limit, status),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for modifying a booking
 */
export function useModifyBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modificationData: BookingModificationRequest) => 
      BookingService.modifyBooking(modificationData),
    onSuccess: (data, variables) => {
      toast.success("Booking modified successfully!");
      // Invalidate specific booking details
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKING_DETAILS, variables.bookingId] 
      });
      // Invalidate booking history
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKING_HISTORY] 
      });
    },
    onError: (error: any) => {
      console.error("Booking modification error:", error);
      toast.error(error?.message || "Failed to modify booking. Please try again.");
    },
  });
}

/**
 * Hook for cancelling a booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cancellationData: BookingCancellationRequest) => 
      BookingService.cancelBooking(cancellationData),
    onSuccess: (data, variables) => {
      toast.success("Booking cancelled successfully!");
      // Invalidate specific booking details
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKING_DETAILS, variables.bookingId] 
      });
      // Invalidate booking history
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKING_HISTORY] 
      });
    },
    onError: (error: any) => {
      console.error("Booking cancellation error:", error);
      toast.error(error?.message || "Failed to cancel booking. Please try again.");
    },
  });
}

/**
 * Hook for creating payment intent
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (bookingData: Partial<BookingRequest>) => 
      BookingService.createPaymentIntent(bookingData),
    onError: (error: any) => {
      console.error("Payment intent creation error:", error);
      toast.error(error?.message || "Failed to initialize payment. Please try again.");
    },
  });
}

/**
 * Hook for confirming payment
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentIntentId, bookingData }: { 
      paymentIntentId: string; 
      bookingData: BookingRequest 
    }) => BookingService.confirmPayment(paymentIntentId, bookingData),
    onSuccess: (data) => {
      toast.success("Payment confirmed! Your booking is complete.");
      // Invalidate booking history
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.BOOKING_HISTORY] 
      });
    },
    onError: (error: any) => {
      console.error("Payment confirmation error:", error);
      toast.error(error?.message || "Payment failed. Please try again.");
    },
  });
}

/**
 * Hook for downloading booking documents
 */
export function useDownloadBookingDocuments() {
  return useMutation({
    mutationFn: ({ bookingId, documentType }: { 
      bookingId: string; 
      documentType: "ticket" | "voucher" | "invoice" | "all" 
    }) => BookingService.downloadBookingDocuments(bookingId, documentType),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking-${variables.bookingId}-${variables.documentType}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Document downloaded successfully!");
    },
    onError: (error: any) => {
      console.error("Document download error:", error);
      toast.error(error?.message || "Failed to download document. Please try again.");
    },
  });
}

/**
 * Hook for resending confirmation email
 */
export function useResendConfirmationEmail() {
  return useMutation({
    mutationFn: (bookingId: string) => 
      BookingService.resendConfirmationEmail(bookingId),
    onSuccess: () => {
      toast.success("Confirmation email sent successfully!");
    },
    onError: (error: any) => {
      console.error("Email resend error:", error);
      toast.error(error?.message || "Failed to send email. Please try again.");
    },
  });
}

/**
 * Hook for validating promo code
 */
export function useValidatePromoCode() {
  return useMutation({
    mutationFn: ({ promoCode, bookingData }: { 
      promoCode: string; 
      bookingData: Partial<BookingRequest> 
    }) => BookingService.validatePromoCode(promoCode, bookingData),
    onSuccess: (data) => {
      if (data.valid) {
        toast.success(`Promo code applied! ${data.message}`);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      console.error("Promo code validation error:", error);
      toast.error(error?.message || "Failed to validate promo code.");
    },
  });
}

/**
 * Hook for getting pricing breakdown
 */
export function usePricingBreakdown() {
  return useMutation({
    mutationFn: (bookingData: Partial<BookingRequest>) => 
      BookingService.getPricingBreakdown(bookingData),
    onError: (error: any) => {
      console.error("Pricing breakdown error:", error);
      toast.error(error?.message || "Failed to calculate pricing.");
    },
  });
}
