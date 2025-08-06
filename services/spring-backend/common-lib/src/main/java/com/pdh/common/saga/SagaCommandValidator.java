package com.pdh.common.saga;

import com.pdh.common.exceptions.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Saga Command Validator - Centralized in common-lib
 * Uses existing common-lib exception patterns for consistency
 * 
 * Validates saga commands before they are sent to ensure data integrity
 * and prevent invalid commands from being processed by downstream services.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SagaCommandValidator {

    private final Validator validator; // From CommonConfig

    /**
     * Validates a saga command using both annotation-based and business rule validation
     * 
     * @param command The saga command to validate
     * @throws BadRequestException if validation fails
     */
    public void validateCommand(SagaCommand command) {
        log.debug("Validating saga command: {} for saga: {}", command.getAction(), command.getSagaId());
        
        // 1. Annotation-based validation
        Set<ConstraintViolation<SagaCommand>> violations = validator.validate(command);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
            log.warn("Saga command validation failed: {}", errorMessage);
            // Use existing common-lib exception
            throw new BadRequestException("Command validation failed: " + errorMessage);
        }

        // 2. Business rule validation
        validateBusinessRules(command);
        
        log.debug("Saga command validation passed for saga: {}", command.getSagaId());
    }

    /**
     * Validates business rules specific to different command actions
     */
    private void validateBusinessRules(SagaCommand command) {
        switch (command.getAction()) {
            case "RESERVE_FLIGHT":
                validateFlightReservationCommand(command);
                break;
            case "RESERVE_HOTEL":
                validateHotelReservationCommand(command);
                break;
            case "PROCESS_PAYMENT":
                validatePaymentCommand(command);
                break;
            case "CANCEL_FLIGHT":
                validateFlightCancellationCommand(command);
                break;
            case "CANCEL_HOTEL":
                validateHotelCancellationCommand(command);
                break;
            case "REFUND_PAYMENT":
                validatePaymentRefundCommand(command);
                break;
            default:
                log.debug("No specific validation rules for action: {}", command.getAction());
        }
    }

    private void validateFlightReservationCommand(SagaCommand command) {
        if (!command.hasFlightDetails()) {
            throw new BadRequestException("Flight details are required for flight reservation");
        }
        
        if (command.getBookingType() != null && 
            !("FLIGHT".equals(command.getBookingType()) || "COMBO".equals(command.getBookingType()))) {
            throw new BadRequestException("Invalid booking type for flight reservation: " + command.getBookingType());
        }
    }

    private void validateHotelReservationCommand(SagaCommand command) {
        if (!command.hasHotelDetails()) {
            throw new BadRequestException("Hotel details are required for hotel reservation");
        }
        
        if (command.getBookingType() != null && 
            !("HOTEL".equals(command.getBookingType()) || "COMBO".equals(command.getBookingType()))) {
            throw new BadRequestException("Invalid booking type for hotel reservation: " + command.getBookingType());
        }
    }

    private void validatePaymentCommand(SagaCommand command) {
        if (!command.hasPaymentDetails()) {
            throw new BadRequestException("Payment details are required for payment processing");
        }
        
        if (command.getTotalAmount() != null && command.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }
    }

    private void validateFlightCancellationCommand(SagaCommand command) {
        if (!command.isCompensationCommand()) {
            log.warn("Flight cancellation command is not marked as compensation for saga: {}", command.getSagaId());
        }
        
        // Flight cancellation can work without flight details (using booking ID)
        // but log a warning if details are missing
        if (!command.hasFlightDetails()) {
            log.debug("Flight cancellation command without flight details for saga: {}", command.getSagaId());
        }
    }

    private void validateHotelCancellationCommand(SagaCommand command) {
        if (!command.isCompensationCommand()) {
            log.warn("Hotel cancellation command is not marked as compensation for saga: {}", command.getSagaId());
        }
        
        // Hotel cancellation can work without hotel details (using booking ID)
        if (!command.hasHotelDetails()) {
            log.debug("Hotel cancellation command without hotel details for saga: {}", command.getSagaId());
        }
    }

    private void validatePaymentRefundCommand(SagaCommand command) {
        if (!command.isCompensationCommand()) {
            log.warn("Payment refund command is not marked as compensation for saga: {}", command.getSagaId());
        }
        
        // Payment refund can work with just booking ID and customer ID
        if (command.getCustomerId() == null) {
            throw new BadRequestException("Customer ID is required for payment refund");
        }
    }

    /**
     * Validates that a command is properly configured for retry
     */
    public void validateRetryCommand(SagaCommand command) {
        if (command.getRetryCount() == null || command.getRetryCount() < 0) {
            throw new BadRequestException("Invalid retry count for saga command");
        }
        
        if (command.getRetryCount() > 5) {
            throw new BadRequestException("Maximum retry count exceeded for saga command");
        }
    }
}
