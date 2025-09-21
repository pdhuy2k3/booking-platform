# Booking Flow Implementation

## Overview
This directory contains the implementation of the booking flow for the BookingSmart platform. The booking flow follows a saga pattern to manage distributed transactions across multiple services (Flight, Hotel, Payment).

## Architecture

### Frontend Components
1. **Booking Context** - Manages the booking flow state
2. **Booking Flow Manager** - Orchestrates the different steps of the booking process
3. **Booking Forms** - Collects user input for flight and hotel bookings
4. **Booking Review** - Allows users to review their booking details
5. **Booking Confirmation** - Shows the final booking status

### Services
1. **Booking API Service** - Communicates with the backend booking service
2. **Booking Service** - Main service that exposes booking functionality

### Types
1. **Booking Types** - TypeScript interfaces for booking data structures

## Booking Flow Steps
1. **Selection** - User selects booking type (flight, hotel, or combo)
2. **Passengers/Details** - User enters passenger/guest information
3. **Review** - User reviews booking details
4. **Payment** - User completes payment (not implemented yet)
5. **Confirmation** - Shows booking confirmation status

## Saga Pattern
The booking flow uses a saga pattern to ensure data consistency across services:
1. Flight reservation
2. Hotel reservation (for combo bookings)
3. Payment processing
4. Booking confirmation

If any step fails, the saga executes compensation steps to revert previous operations.

## API Integration
The frontend integrates with the booking service through REST APIs:
- `POST /bookings/storefront` - Create a new booking
- `GET /bookings/storefront/{bookingId}/status` - Get booking status
- `POST /bookings/commands/{bookingId}/cancel` - Cancel a booking

## State Management
The booking flow state is managed using React Context and useReducer for a clean and predictable state management solution.