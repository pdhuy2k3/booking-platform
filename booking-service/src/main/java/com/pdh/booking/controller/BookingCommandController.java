package com.pdh.booking.controller;

import com.pdh.booking.command.ProcessPaymentCommand;
import com.pdh.booking.command.CancelBookingCommand;
import com.pdh.booking.service.BookingCqrsService;
import com.pdh.common.utils.AuthenticationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

/**
 * Booking Command Controller
 * Handles booking commands (payment processing, cancellation) using CQRS pattern
 * These are separate from queries to maintain clear separation of concerns
 */
@RestController
@RequestMapping("/commands")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Commands", description = "Booking command operations (payment, cancellation)")
@SecurityRequirement(name = "oauth2")
public class BookingCommandController {

    private final BookingCqrsService bookingCqrsService;

    /**
     * Process payment for a booking
     */
    @Operation(
        summary = "Process payment",
        description = "Process payment for a booking using saga orchestration",
        tags = {"Payment", "Booking Commands"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer", "admin"})
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payment command processed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid payment request"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/payment")
    public ResponseEntity<String> processPayment(
            @Parameter(description = "Payment processing request", required = true)
            @Valid @RequestBody ProcessPaymentCommand command) {
        try {
            log.info("Processing payment for booking: {} via CQRS", command.getBookingId());

            // Set user ID from authentication context
            command.setUserId(AuthenticationUtils.getCurrentUserIdFromContext());

            // Execute payment command via CQRS service
            bookingCqrsService.processPayment(command);

            return ResponseEntity.ok("Payment command processed successfully");

        } catch (Exception e) {
            log.error("Error processing payment via CQRS: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to process payment: " + e.getMessage());
        }
    }

    /**
     * Cancel a booking
     */
    @Operation(
        summary = "Cancel booking",
        description = "Cancel a booking and trigger compensation saga",
        tags = {"Cancellation", "Booking Commands"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer", "admin"})
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cancellation command processed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid cancellation request"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Booking not found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/cancel")
    public ResponseEntity<String> cancelBooking(
            @Parameter(description = "Booking cancellation request", required = true)
            @Valid @RequestBody CancelBookingCommand command) {
        try {
            log.info("Canceling booking: {} via CQRS", command.getBookingId());

            // Set user ID from authentication context
            command.setUserId(AuthenticationUtils.getCurrentUserIdFromContext());

            // Execute cancellation command via CQRS service
            bookingCqrsService.cancelBooking(command);

            return ResponseEntity.ok("Cancellation command processed successfully");

        } catch (Exception e) {
            log.error("Error canceling booking via CQRS: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to cancel booking: " + e.getMessage());
        }
    }

    /**
     * Cancel booking by ID (convenience endpoint)
     */
    @Operation(
        summary = "Cancel booking by ID",
        description = "Cancel a booking by its ID with a reason",
        tags = {"Cancellation", "Booking Commands"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"customer", "admin"})
    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<String> cancelBookingById(
            @Parameter(description = "Booking ID", required = true)
            @PathVariable UUID bookingId,
            @Parameter(description = "Cancellation reason", required = true)
            @RequestParam String reason) {
        try {
            log.info("Canceling booking by ID: {} via CQRS", bookingId);

            // Create cancellation command
            CancelBookingCommand command = CancelBookingCommand.builder()
                    .bookingId(bookingId)
                    .userId(AuthenticationUtils.getCurrentUserIdFromContext())
                    .cancellationReason(reason)
                    .sagaId(UUID.randomUUID().toString())
                    .correlationId(UUID.randomUUID().toString())
                    .build();

            // Execute cancellation command via CQRS service
            bookingCqrsService.cancelBooking(command);

            return ResponseEntity.ok("Booking cancellation initiated successfully");

        } catch (Exception e) {
            log.error("Error canceling booking by ID via CQRS: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Failed to cancel booking: " + e.getMessage());
        }
    }
}
