# BookingSmart Backend DTO and Controller Schema Analysis

## Executive Summary

This document provides a comprehensive analysis of the BookingSmart system's backend DTOs and controller schemas, serving as a blueprint for TypeScript interface generation. The analysis covers all services including Flight, Hotel, Booking, Customer services, and Common Library events.

## Table of Contents

1. [Java to TypeScript Type Mappings](#java-to-typescript-type-mappings)
2. [Validation Constraints Documentation](#validation-constraints-documentation)
3. [Enum Catalog](#enum-catalog)
4. [Complex Nested Structures](#complex-nested-structures)
5. [Controller Endpoint Schemas](#controller-endpoint-schemas)
6. [Generic Type Handling](#generic-type-handling)
7. [Date/Time Patterns](#datetime-patterns)
8. [Inheritance Patterns](#inheritance-patterns)

---

## Java to TypeScript Type Mappings

### Primitive Types
| Java Type | TypeScript Type | Notes |
|-----------|----------------|-------|
| `String` | `string` | Direct mapping |
| `Integer` | `number` | 32-bit integer |
| `Long` | `number` | 64-bit integer |
| `Double` | `number` | Double precision float |
| `BigDecimal` | `number` | Monetary values |
| `Boolean` | `boolean` | Direct mapping |
| `UUID` | `string` | UUID as string representation |

### Date/Time Types
| Java Type | TypeScript Type | Format |
|-----------|----------------|--------|
| `LocalDate` | `string` | YYYY-MM-DD |
| `LocalDateTime` | `string` | ISO 8601 format |
| `ZonedDateTime` | `string` | ISO 8601 with timezone |
| `Instant` | `string` | ISO 8601 UTC |

### Collection Types
| Java Type | TypeScript Type | Example |
|-----------|----------------|---------|
| `List<T>` | `T[]` | `List<String>` → `string[]` |
| `Set<T>` | `T[]` | `Set<String>` → `string[]` |
| `Map<K,V>` | `Record<K,V>` | `Map<String,Object>` → `Record<string, any>` |

### Optional/Nullable Fields
| Java Pattern | TypeScript Pattern | Notes |
|-------------|-------------------|-------|
| `@NotNull` field | Required field | No `?` in interface |
| Optional field | `field?: Type` | Optional property |
| `@Nullable` field | `field: Type \| null` | Explicitly nullable |

---

## Validation Constraints Documentation

### Field Validation Mappings

#### Required Field Constraints
| Java Annotation | TypeScript Equivalent | Implementation |
|----------------|----------------------|----------------|
| `@NotNull` | Required field (no `?`) | Field must be present |
| `@NotBlank` | Required `string` | Non-empty string required |
| `@NotEmpty` | Required array/object | Non-empty collection required |

#### Size/Length Constraints
| Java Annotation | TypeScript Validation | Example |
|----------------|----------------------|---------|
| `@Size(min=3, max=3)` | String length validation | Airport codes |
| `@Min(value=1)` | Number minimum validation | Passenger count |
| `@Max(value=5)` | Number maximum validation | Star rating |

#### Format Constraints
| Java Annotation | TypeScript Validation | Pattern |
|----------------|----------------------|---------|
| `@Email` | Email format validation | RFC 5322 compliant |
| `@Pattern(regexp="^(M\|F)$")` | Regex validation | Gender field |

#### Nested Object Validation
| Java Annotation | TypeScript Equivalent | Notes |
|----------------|----------------------|-------|
| `@Valid` | Nested interface validation | Validates nested objects |

---

## Enum Catalog

### Booking Service Enums

#### BookingStatus
```typescript
enum BookingStatus {
  VALIDATION_PENDING = "VALIDATION_PENDING", // Waiting for inventory validation
  PENDING = "PENDING",                       // Validation passed, saga started
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED", 
  FAILED = "FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED"    // Inventory validation failed
}
```

#### BookingType
```typescript
enum BookingType {
  FLIGHT = "FLIGHT",
  HOTEL = "HOTEL", 
  BUS = "BUS",
  TRAIN = "TRAIN",
  COMBO = "COMBO"
}
```

#### SagaState
```typescript
enum SagaState {
  // Initial state
  BOOKING_INITIATED = "BOOKING_INITIATED",
  
  // Flight reservation states
  FLIGHT_RESERVATION_PENDING = "FLIGHT_RESERVATION_PENDING",
  FLIGHT_RESERVED = "FLIGHT_RESERVED",
  
  // Hotel reservation states
  HOTEL_RESERVATION_PENDING = "HOTEL_RESERVATION_PENDING", 
  HOTEL_RESERVED = "HOTEL_RESERVED",
  
  // Payment states
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  
  // Completion states
  COMPLETED = "COMPLETED",
  BOOKING_COMPLETED = "BOOKING_COMPLETED",
  
  // Compensation states (for rollback)
  COMPENSATION_INITIATED = "COMPENSATION_INITIATED",
  COMPENSATION_FLIGHT_CANCEL = "COMPENSATION_FLIGHT_CANCEL",
  COMPENSATION_HOTEL_CANCEL = "COMPENSATION_HOTEL_CANCEL", 
  COMPENSATION_PAYMENT_REFUND = "COMPENSATION_PAYMENT_REFUND",
  COMPENSATED = "COMPENSATED",
  
  // Cancellation states
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  COMPENSATION_BOOKING_CANCEL = "COMPENSATION_BOOKING_CANCEL",
  
  // Failure states
  FAILED = "FAILED"
}
```

#### ServiceType
```typescript
enum ServiceType {
  FLIGHT = "FLIGHT",
  HOTEL = "HOTEL",
  BUS = "BUS", 
  TRAIN = "TRAIN"
}
```

### Flight Service Enums

#### FareClass (from previous analysis)
```typescript
enum FareClass {
  ECONOMY = "ECONOMY",
  PREMIUM_ECONOMY = "PREMIUM_ECONOMY", 
  BUSINESS = "BUSINESS",
  FIRST = "FIRST"
}
```

### Customer Service Enums

#### Account Status
```typescript
enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED", 
  PENDING_VERIFICATION = "PENDING_VERIFICATION"
}
```

#### Membership Tier
```typescript
enum MembershipTier {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM"
}
```

---

## Complex Nested Structures

### Booking Service DTOs

#### ComboBookingDetailsDto
```typescript
interface ComboBookingDetailsDto {
  flightDetails: FlightBookingDetailsDto;     // @NotNull @Valid
  hotelDetails: HotelBookingDetailsDto;       // @NotNull @Valid
  comboDiscount?: number;                     // Optional discount
  packageName?: string;                       // Optional package name
  comboOffers?: string;                       // Optional special offers
}
```

#### FlightBookingDetailsDto
```typescript
interface FlightBookingDetailsDto {
  flightId: string;                          // @NotBlank
  flightNumber: string;                      // @NotBlank
  airline: string;                           // @NotBlank
  originAirport: string;                     // @NotBlank @Size(min=3, max=3)
  destinationAirport: string;                // @NotBlank @Size(min=3, max=3)
  departureDateTime: string;                 // @NotNull (LocalDateTime)
  arrivalDateTime: string;                   // @NotNull (LocalDateTime)
  seatClass: string;                         // @NotBlank
  passengerCount: number;                    // @NotNull @Min(1)
  passengers: PassengerDetailsDto[];         // @NotNull @Size(min=1)
  selectedSeats?: string[];                  // Optional
  pricePerPassenger: number;                 // @NotNull @Min(0)
  totalFlightPrice: number;                  // @NotNull @Min(0)
  returnFlight?: ReturnFlightDetailsDto;     // Optional for round trip
  additionalServices?: FlightServiceDto[];   // Optional services
  specialRequests?: string;                  // Optional
}
```

#### HotelBookingDetailsDto
```typescript
interface HotelBookingDetailsDto {
  hotelId: string;                          // @NotBlank
  hotelName: string;                        // @NotBlank
  hotelAddress: string;                     // @NotBlank
  city: string;                             // @NotBlank
  country: string;                          // @NotBlank
  starRating?: number;                      // @Min(1) @Max(5)
  roomId: string;                           // @NotBlank
  roomType: string;                         // @NotBlank
  roomName: string;                         // @NotBlank
  checkInDate: string;                      // @NotNull (LocalDate)
  checkOutDate: string;                     // @NotNull (LocalDate)
  numberOfNights: number;                   // @NotNull @Min(1)
  numberOfRooms: number;                    // @NotNull @Min(1)
  numberOfGuests: number;                   // @NotNull @Min(1)
  guests: GuestDetailsDto[];                // @NotNull
  pricePerNight: number;                    // @NotNull @Min(0)
  totalRoomPrice: number;                   // @NotNull @Min(0)
  bedType?: string;                         // Optional
  amenities?: string[];                     // Optional
  additionalServices?: HotelServiceDto[];   // Optional
  specialRequests?: string;                 // Optional
  cancellationPolicy?: string;              // Optional
}
```

#### PassengerDetailsDto
```typescript
interface PassengerDetailsDto {
  passengerType: string;                    // @NotBlank (ADULT, CHILD, INFANT)
  title: string;                            // @NotBlank
  firstName: string;                        // @NotBlank
  lastName: string;                         // @NotBlank
  dateOfBirth: string;                      // @NotNull (LocalDate)
  gender: string;                           // @NotBlank @Pattern("^(M|F)$")
  nationality: string;                      // @NotBlank
  passportNumber?: string;                  // Optional
  passportExpiryDate?: string;              // Optional (LocalDate)
  passportIssuingCountry?: string;          // Optional
  email?: string;                           // @Email
  phoneNumber?: string;                     // Optional
  frequentFlyerNumber?: string;             // Optional
  specialAssistance?: string;               // Optional
  mealPreference?: string;                  // Optional
  seatPreference?: string;                  // Optional
}
```

#### GuestDetailsDto
```typescript
interface GuestDetailsDto {
  guestType: string;                        // @NotBlank (PRIMARY, ADDITIONAL)
  title: string;                            // @NotBlank
  firstName: string;                        // @NotBlank
  lastName: string;                         // @NotBlank
  dateOfBirth: string;                      // @NotNull (LocalDate)
  gender: string;                           // @NotBlank @Pattern("^(M|F)$")
  nationality: string;                      // @NotBlank
  idNumber?: string;                        // Optional
  email?: string;                           // @Email
  phoneNumber?: string;                     // Optional
  loyaltyNumber?: string;                   // Optional
  specialRequests?: string;                 // Optional
}
```

### Customer Service DTOs

#### CustomerProfileResponseDto
```typescript
interface CustomerProfileResponseDto {
  customerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;                      // LocalDate
  title: string;
  nationality: string;
  address: AddressDto;
  accountStatus: string;                    // AccountStatus enum
  createdAt: string;                        // LocalDateTime
  lastLoginAt: string;                      // LocalDateTime
  emailVerified: boolean;
  phoneVerified: boolean;
  preferredLanguage: string;
  preferredCurrency: string;
  marketingOptIn: boolean;
  newsletterOptIn: boolean;
  travelPreferences: TravelPreferencesDto;
  loyaltyInfo: LoyaltyInfoDto;
  activitySummary: ActivitySummaryDto;
}

interface AddressDto {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
}

interface TravelPreferencesDto {
  preferredSeatClass: string;
  preferredMealType: string;
  preferredRoomType: string;
  smokingPreference: boolean;
  specialAssistance: string;
  loyaltyPrograms: string[];
}

interface LoyaltyInfoDto {
  membershipTier: string;                   // MembershipTier enum
  totalPoints: number;
  availablePoints: number;
  nextTierRequirement: string;
  memberSince: string;                      // LocalDate
}

interface ActivitySummaryDto {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  lastBookingDate: string;
  favoriteDestination: string;
  totalSpent: number;
  currency: string;
}
```

---

## Controller Endpoint Schemas

### Booking Service Endpoints

#### BookingController

**POST /backoffice**
- Request: `CreateBookingRequestDto`
- Response: `ApiResponse<BookingResponseDto>`

**POST /storefront**
- Request: `StorefrontCreateBookingRequestDto`
- Response: `ApiResponse<StorefrontBookingResponseDto>` (202 Accepted)

**GET /saga/{sagaId}**
- Response: `ApiResponse<BookingResponseDto>`

**GET /storefront/saga/{sagaId}**
- Response: `ApiResponse<StorefrontBookingResponseDto>`

**GET /storefront/{bookingId}/status**
- Response: `ApiResponse<BookingStatusResponseDto>`

#### BackofficeBookingController

**GET /backoffice/bookings**
- Query Parameters: `page`, `size`, `bookingType`, `status`, `startDate`, `endDate`
- Response: `ApiResponse<Page<Booking>>`

**GET /backoffice/bookings/flights/by-airline**
- Query Parameters: `airline`, `page`, `size`
- Response: `ApiResponse<Page<Booking>>`

**GET /backoffice/bookings/flights/by-route**
- Query Parameters: `departureAirport`, `arrivalAirport`, `page`, `size`
- Response: `ApiResponse<Page<Booking>>`

**GET /backoffice/bookings/hotels/by-hotel-name**
- Query Parameters: `hotelName`, `page`, `size`
- Response: `ApiResponse<Page<Booking>>`

**GET /backoffice/bookings/statistics**
- Query Parameters: `startDate`, `endDate`
- Response: `ApiResponse<Record<string, any>>`

### Customer Service Endpoints

#### CustomerController

**GET /backoffice/admin/customers**
- Query Parameters: `page`, `size`
- Response: `ApiResponse<CustomerListVm>`

**GET /backoffice/admin/customers/{id}**
- Response: `ApiResponse<CustomerAdminVm>`

**GET /storefront/profile**
- Response: `ApiResponse<CustomerVm>`

**PUT /storefront/profile**
- Request: `CustomerProfileRequestVm`
- Response: `ApiResponse<void>`

**POST /storefront/guest**
- Response: `ApiResponse<GuestUserVm>`

---

## Generic Type Handling

### ApiResponse<T> Wrapper Pattern
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  message?: string;
  timestamp: string;
  path?: string;
  validationErrors?: Record<string, string[]>;
}
```

### Pagination Pattern
```typescript
interface Page<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}
```

### Generic Collections
| Java Pattern | TypeScript Pattern | Example |
|-------------|-------------------|---------|
| `List<String>` | `string[]` | Simple array |
| `Map<String, Object>` | `Record<string, any>` | Key-value pairs |
| `Optional<T>` | `T \| undefined` | Optional values |

---

## Date/Time Patterns

### Format Specifications
| Java Type | TypeScript Type | Format Pattern | Example |
|-----------|----------------|----------------|---------|
| `LocalDate` | `string` | YYYY-MM-DD | "2024-03-15" |
| `LocalDateTime` | `string` | YYYY-MM-DDTHH:mm:ss | "2024-03-15T14:30:00" |
| `ZonedDateTime` | `string` | ISO 8601 with timezone | "2024-03-15T14:30:00+07:00" |
| `Instant` | `string` | ISO 8601 UTC | "2024-03-15T07:30:00Z" |

### @JsonFormat Handling
When `@JsonFormat` annotations are present, follow the specified pattern:
```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private LocalDateTime departureTime;
```
Maps to:
```typescript
departureTime: string; // Format: "2024-03-15 14:30:00"
```

### Timezone Considerations
- All `LocalDateTime` fields are timezone-naive
- `ZonedDateTime` includes timezone information
- Frontend should handle timezone conversion based on user preferences
- UTC is used for system-internal timestamps

---

## Inheritance Patterns

### Event Inheritance Hierarchy

#### Base DomainEvent
```typescript
abstract class DomainEvent {
  eventId: string;                          // UUID
  occurredAt: string;                       // LocalDateTime
  eventType: string;                        // Class name
  
  abstract getAggregateId(): string;
  abstract getAggregateType(): string;
}
```

#### Concrete Event Types
```typescript
interface BookingInitiatedEvent {
  bookingId: string;                        // UUID
  sagaId: string;
  userId: string;                           // UUID
  bookingReference: string;
  bookingType: string;                      // BookingType enum as string
  totalAmount: number;                      // BigDecimal
  currency: string;
  timestamp: string;                        // ZonedDateTime
}

interface FlightReservedEvent extends DomainEvent {
  aggregateId: string;
  aggregateType: "Booking";
  flightId: string;
  bookingReference: string;
  reservationId: string;
  passengerCount: number;
  reservationAmount: number;                // BigDecimal
  departureTime: string;                    // ZonedDateTime
  arrivalTime: string;                      // ZonedDateTime
  seatClass: string;
}
```

### DTO Inheritance Patterns

#### Response DTO Variations
```typescript
// Base booking response
interface BookingResponseDto {
  bookingId: string;
  bookingReference: string;
  status: BookingStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

// Storefront-specific response (extends base)
interface StorefrontBookingResponseDto extends BookingResponseDto {
  sagaId: string;
  sagaState: SagaState;
  confirmationNumber?: string;
  error?: string;
  errorCode?: string;
  validationDetails?: Record<string, any>;
}

// Status polling response (lightweight)
interface BookingStatusResponseDto {
  bookingId: string;
  bookingReference: string;
  status: BookingStatus;
  message: string;
  estimatedCompletion?: string;
  lastUpdated: string;
  progressPercentage?: number;
}
```

---

## Implementation Guidelines

### TypeScript Interface Generation Rules

1. **Required Fields**: Java fields with `@NotNull`, `@NotBlank`, or `@NotEmpty` become required TypeScript properties (no `?`)

2. **Optional Fields**: Java fields without validation annotations or marked as optional become optional TypeScript properties (`field?: Type`)

3. **Enum Handling**: Java enums become TypeScript string literal unions or enums with string values

4. **Date Serialization**: All Java date/time types serialize to ISO 8601 strings in TypeScript

5. **Nested Objects**: Java DTOs with `@Valid` annotations require full nested interface definitions

6. **Collections**: Java collections map to TypeScript arrays, with generic type preservation

7. **Validation**: Client-side validation should mirror server-side Jakarta validation constraints

### Error Handling Patterns

```typescript
// Standard error response structure
interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  message: string;
  timestamp: string;
  path: string;
  validationErrors?: Record<string, string[]>;
}

// Validation error structure
interface ValidationError {
  field: string;
  rejectedValue: any;
  message: string;
}
```

### API Client Type Safety

```typescript
// Example API client method signatures
interface BookingApiClient {
  createBooking(request: CreateBookingRequestDto): Promise<ApiResponse<BookingResponseDto>>;
  createStorefrontBooking(request: StorefrontCreateBookingRequestDto): Promise<ApiResponse<StorefrontBookingResponseDto>>;
  getBookingStatus(bookingId: string): Promise<ApiResponse<BookingStatusResponseDto>>;
  getBookingBySagaId(sagaId: string): Promise<ApiResponse<BookingResponseDto>>;
}
```

---

## Conclusion

This comprehensive analysis provides a complete blueprint for generating TypeScript interfaces from the BookingSmart backend DTOs. The type mappings, validation constraints, and structural patterns documented here ensure type safety and consistency between the Java backend and TypeScript frontend implementations.

Key implementation priorities:
1. Maintain strict type safety with proper nullable/optional field handling
2. Preserve validation constraints in client-side implementations
3. Handle date/time serialization consistently across all interfaces
4. Implement proper error handling with structured error responses
5. Support generic types and inheritance patterns appropriately

This documentation serves as the definitive reference for frontend developers implementing TypeScript interfaces that interact with the BookingSmart backend services.