package com.pdh.booking.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.dto.request.CreateBookingRequestDto;
import com.pdh.booking.model.dto.request.StorefrontCreateBookingRequestDto;
import com.pdh.booking.model.dto.response.BookingResponseDto;
import com.pdh.booking.model.dto.response.StorefrontBookingResponseDto;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.service.ProductDetailsService;
import com.pdh.booking.model.viewmodel.BackofficeBookingViewModel;
import com.pdh.booking.model.viewmodel.StorefrontBookingViewModel;
import com.pdh.common.saga.SagaState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.UUID;

/**
 * Mapper utility for converting between DTOs, ViewModels, and Entities
 * Handles data type conversions and transformations
 */
@Component
@RequiredArgsConstructor
public class BookingDtoMapper {
    private final ObjectMapper objectMapper;
    private final ProductDetailsService productDetailsService;
    private final NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    
    /**
     * Convert CreateBookingRequestDto to Booking entity
     */
    public Booking toEntity(CreateBookingRequestDto dto) {
        if (dto == null) return null;

        Booking booking = new Booking();
        booking.setUserId(dto.getUserId());
        booking.setBookingType(dto.getBookingType());
        booking.setTotalAmount(dto.getTotalAmount());
        booking.setCurrency(dto.getCurrency());
        booking.setNotes(dto.getNotes());
        booking.setBookingSource(dto.getBookingSource());

        // Handle product details based on booking type
        if (dto.getProductDetails() != null) {
            // Convert generic Object (from JSON) to typed DTO before validation
            Object typedProductDetails = productDetailsService.convertToTypedDto(dto.getBookingType(), dto.getProductDetails());
            productDetailsService.validateProductDetails(dto.getBookingType(), typedProductDetails);
            String productDetailsJson = productDetailsService.convertToJson(dto.getBookingType(), typedProductDetails);
            booking.setProductDetailsJson(productDetailsJson);
        }

        return booking;
    }
    
    /**
     * Convert StorefrontCreateBookingRequestDto to Booking entity
     * Note: userId should be set separately from JWT authentication
     */
    public Booking toEntity(StorefrontCreateBookingRequestDto dto) throws JsonProcessingException {
        if (dto == null) return null;

        Booking booking = new Booking();
        // userId will be set by the controller from JWT authentication
        booking.setUserId(UUID.randomUUID());
        booking.setBookingType(dto.getBookingType());
        booking.setTotalAmount(BigDecimal.valueOf(dto.getTotalAmount())); // Convert double to BigDecimal
        booking.setCurrency(dto.getCurrency());
        booking.setNotes(dto.getNotes());
        booking.setBookingSource(dto.getBookingSource());

        // Handle product details based on booking type
        if (dto.getProductDetails() != null) {
            // Convert generic Object (from JSON) to typed DTO before validation
//            Object typedProductDetails = productDetailsService.convertToTypedDto(dto.getBookingType(), dto.getProductDetails());
//            productDetailsService.validateProductDetails(dto.getBookingType(), typedProductDetails);
            String productDetailsJson = objectMapper.writeValueAsString(dto.getProductDetails());
            booking.setProductDetailsJson(productDetailsJson);
        }

        return booking;
    }
    
    /**
     * Convert Booking entity to BookingResponseDto
     */
    public BookingResponseDto toResponseDto(Booking booking) {
        if (booking == null) return null;
        
        return BookingResponseDto.builder()
                .bookingId(booking.getBookingId())
                .bookingReference(booking.getBookingReference())
                .sagaId(booking.getSagaId())
                .status(booking.getStatus().name())
                .sagaState(convertSagaState(booking.getSagaState()))
                .confirmationNumber(booking.getConfirmationNumber())
                .build();
    }
    
    /**
     * Convert Booking entity to StorefrontBookingResponseDto
     */
    public StorefrontBookingResponseDto toStorefrontResponseDto(Booking booking) {
        if (booking == null) return null;
        
        return StorefrontBookingResponseDto.builder()
                .bookingId(booking.getBookingId().toString()) // Convert UUID to string
                .bookingReference(booking.getBookingReference())
                .sagaId(booking.getSagaId())
                .status(booking.getStatus())
                .sagaState(convertSagaState(booking.getSagaState()))
                .confirmationNumber(booking.getConfirmationNumber())
                .totalAmount(booking.getTotalAmount().doubleValue()) // Convert BigDecimal to double
                .currency(booking.getCurrency())
                .bookingType(booking.getBookingType())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .updatedAt(booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null)
                .reservationLockedAt(booking.getReservationLockedAt() != null ? booking.getReservationLockedAt().toString() : null)
                .reservationExpiresAt(booking.getReservationExpiresAt() != null ? booking.getReservationExpiresAt().toString() : null)
                .build();
    }
    
    /**
     * Convert Booking entity to StorefrontBookingViewModel
     */
    public StorefrontBookingViewModel toStorefrontViewModel(Booking booking) {
        if (booking == null) return null;
        
        StorefrontBookingViewModel viewModel = StorefrontBookingViewModel.builder()
                .bookingId(booking.getBookingId().toString())
                .bookingReference(booking.getBookingReference())
                .sagaId(booking.getSagaId())
                .status(booking.getStatus())
                .sagaState(convertSagaState(booking.getSagaState()))
                .confirmationNumber(booking.getConfirmationNumber())
                .totalAmount(booking.getTotalAmount().doubleValue())
                .currency(booking.getCurrency())
                .bookingType(booking.getBookingType())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .updatedAt(booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null)
                .build();
        
        // Set computed fields
        viewModel.setProgressPercentage(viewModel.calculateProgressPercentage());
        viewModel.setCanCancel(viewModel.calculateCanCancel());
        viewModel.setIsFinal(viewModel.calculateIsFinal());
        viewModel.setFormattedAmount(formatCurrency(booking.getTotalAmount(), booking.getCurrency()));
        viewModel.setStatusDescription(getStatusDescription(booking.getStatus()));
        
        return viewModel;
    }
    
    /**
     * Convert Booking entity to BackofficeBookingViewModel
     */
    public BackofficeBookingViewModel toBackofficeViewModel(Booking booking) {
        if (booking == null) return null;
        
        return BackofficeBookingViewModel.builder()
                .bookingId(booking.getBookingId())
                .bookingReference(booking.getBookingReference())
                .userId(booking.getUserId())
                .sagaId(booking.getSagaId())
                .status(booking.getStatus())
                .sagaState(convertSagaState(booking.getSagaState()))
                .bookingType(booking.getBookingType())
                .totalAmount(booking.getTotalAmount())
                .currency(booking.getCurrency())
                .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                .updatedAt(booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null)
                .confirmationNumber(booking.getConfirmationNumber())
                .cancellationReason(booking.getCancellationReason())
                .compensationReason(booking.getCompensationReason())
                .build();
    }
    
    /**
     * Helper method to convert saga state
     */
    private SagaState convertSagaState(Object commonSagaState) {
        if (commonSagaState == null) {
            return SagaState.BOOKING_INITIATED;
        }
        
        String stateString = commonSagaState.toString();
        try {
            return SagaState.valueOf(stateString);
        } catch (IllegalArgumentException e) {
            return SagaState.BOOKING_INITIATED;
        }
    }
    
    /**
     * Format currency amount for display
     */
    private String formatCurrency(BigDecimal amount, String currency) {
        if (amount == null) return "";
        
        if ("VND".equals(currency)) {
            return currencyFormatter.format(amount);
        }
        
        return String.format("%.2f %s", amount.doubleValue(), currency);
    }
    
    /**
     * Get user-friendly status description
     */
    private String getStatusDescription(BookingStatus status) {
        if (status == null) return "Unknown";
        
        return switch (status) {
            case VALIDATION_PENDING -> "Validating product availability...";
            case PENDING -> "Processing your booking...";
            case CONFIRMED -> "Booking confirmed successfully";
            case PAYMENT_PENDING -> null;
            case PAID -> null;
            case PAYMENT_FAILED -> null;
            case CANCELLED -> "Booking has been cancelled";
            case FAILED -> "Booking failed - please try again";
            case VALIDATION_FAILED -> "Product availability validation failed";
        };
    }
}
