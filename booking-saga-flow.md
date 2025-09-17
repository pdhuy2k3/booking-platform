# Booking Service Saga Flow Documentation

## Overview
The BookingSmart platform uses a Saga pattern to manage distributed transactions across multiple services (Flight, Hotel, Payment) during the booking process. This ensures data consistency and proper compensation in case of failures.

## Saga States

The booking saga follows these states:

1. **BOOKING_INITIATED** - Initial state when booking is created
2. **FLIGHT_RESERVATION_PENDING** - Waiting for flight reservation
3. **FLIGHT_RESERVED** - Flight successfully reserved
4. **HOTEL_RESERVATION_PENDING** - Waiting for hotel reservation
5. **HOTEL_RESERVED** - Hotel successfully reserved
6. **PAYMENT_PENDING** - Waiting for payment processing
7. **PAYMENT_COMPLETED** - Payment successfully processed
8. **BOOKING_COMPLETED** - Final successful state

### Compensation States (Reverse Order)
1. **COMPENSATION_PAYMENT_REFUND** - Refund payment if needed
2. **COMPENSATION_HOTEL_CANCEL** - Cancel hotel reservation
3. **COMPENSATION_FLIGHT_CANCEL** - Cancel flight reservation
4. **COMPENSATION_BOOKING_CANCEL** - Cancel entire booking
5. **BOOKING_CANCELLED** - Final cancelled state

## Booking Types

1. **FLIGHT** - Flight-only booking
2. **HOTEL** - Hotel-only booking
3. **COMBO** - Flight + Hotel booking

## Saga Flow by Booking Type

### Flight Booking Flow
1. BOOKING_INITIATED
2. FLIGHT_RESERVATION_PENDING → FLIGHT_RESERVED
3. PAYMENT_PENDING → PAYMENT_COMPLETED
4. BOOKING_COMPLETED

### Hotel Booking Flow
1. BOOKING_INITIATED
2. HOTEL_RESERVATION_PENDING → HOTEL_RESERVED
3. PAYMENT_PENDING → PAYMENT_COMPLETED
4. BOOKING_COMPLETED

### Combo Booking Flow
1. BOOKING_INITIATED
2. FLIGHT_RESERVATION_PENDING → FLIGHT_RESERVED
3. HOTEL_RESERVATION_PENDING → HOTEL_RESERVED
4. PAYMENT_PENDING → PAYMENT_COMPLETED
5. BOOKING_COMPLETED

## Compensation Flow
If any step fails, the saga follows the reverse compensation path:
1. Failure in PAYMENT_COMPLETED → COMPENSATION_HOTEL_CANCEL
2. Failure in HOTEL_RESERVED → COMPENSATION_FLIGHT_CANCEL
3. Failure in FLIGHT_RESERVED → COMPENSATION_BOOKING_CANCEL
4. Final state: BOOKING_CANCELLED

## Service Interactions

### Booking Service (Orchestrator)
- Initiates saga
- Publishes commands to other services
- Listens to events from other services
- Manages saga state transitions
- Handles compensation

### Flight Service
- Receives RESERVE_FLIGHT command
- Processes flight reservation
- Publishes FlightReserved/FlightReservationFailed events
- Handles CANCEL_FLIGHT command for compensation

### Hotel Service
- Receives RESERVE_HOTEL command
- Processes hotel reservation
- Publishes HotelReserved/HotelReservationFailed events
- Handles CANCEL_HOTEL command for compensation

### Payment Service
- Receives PROCESS_PAYMENT command
- Processes payment
- Publishes PaymentProcessed/PaymentFailed events
- Handles REFUND_PAYMENT command for compensation

## Event-Driven Architecture

The saga uses Kafka topics for communication:
- Flight events: `flight-db-server.public.flight_outbox_events`
- Hotel events: `hotel-db-server.public.hotel_outbox_events`
- Payment events: `payment-db-server.public.payment_outbox_events`

## Data Flow

1. **CreateBookingCommand** is sent to Booking Service
2. Booking entity is created with status PENDING
3. BookingSagaInstance is created with state BOOKING_INITIATED
4. Based on booking type, appropriate reservation command is published:
   - FLIGHT/COMBO: RESERVE_FLIGHT command
   - HOTEL: RESERVE_HOTEL command
5. Target service processes reservation and publishes result event
6. Booking Service receives event and transitions saga state
7. Process continues until completion or failure

## Compensation Handling

When a failure occurs:
1. Saga state is updated to appropriate compensation state
2. Compensation commands are published to reverse completed steps
3. Inventory locks are released
4. Booking entity is updated to CANCELLED status
5. BookingCancelled event is published

## Key Components

### BookingSagaOrchestrator
Main orchestrator that manages the saga lifecycle:
- State transitions
- Command publishing
- Event handling
- Compensation management

### BookingSagaInstance
Entity that tracks individual saga instances:
- sagaId (UUID)
- bookingId (UUID)
- currentState (SagaState)
- isCompensating (Boolean)
- compensationReason (String)

### SagaCommand
DTO for saga commands sent between services:
- sagaId
- bookingId
- action (RESERVE_FLIGHT, RESERVE_HOTEL, PROCESS_PAYMENT, etc.)
- Product-specific details (flightDetails, hotelDetails, paymentDetails)