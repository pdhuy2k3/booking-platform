package com.pdh.common.constants;

/**
 * Standardized error codes for BookingSmart platform
 * Used across all services for consistent error handling
 */
public final class ErrorCodes {
    
    private ErrorCodes() {
        // Utility class - prevent instantiation
    }
    
    // === GENERAL ERROR CODES ===
    public static final String GENERAL_ERROR = "GENERAL_ERROR";
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String NOT_FOUND = "NOT_FOUND";
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String CONFLICT = "CONFLICT";
    public static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
    public static final String SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
    public static final String BAD_REQUEST = "BAD_REQUEST";
    public static final String TIMEOUT = "TIMEOUT";
    
    // === AUTHENTICATION & AUTHORIZATION ===
    public static final String INVALID_TOKEN = "INVALID_TOKEN";
    public static final String TOKEN_EXPIRED = "TOKEN_EXPIRED";
    public static final String INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS";
    public static final String ACCOUNT_LOCKED = "ACCOUNT_LOCKED";
    public static final String ACCOUNT_DISABLED = "ACCOUNT_DISABLED";
    public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
    
    // === CUSTOMER SERVICE ERRORS ===
    public static final String CUSTOMER_NOT_FOUND = "CUSTOMER_NOT_FOUND";
    public static final String CUSTOMER_PROFILE_NOT_FOUND = "CUSTOMER_PROFILE_NOT_FOUND";
    public static final String CUSTOMER_ALREADY_EXISTS = "CUSTOMER_ALREADY_EXISTS";
    public static final String INVALID_CUSTOMER_DATA = "INVALID_CUSTOMER_DATA";
    public static final String LOYALTY_PROGRAM_NOT_FOUND = "LOYALTY_PROGRAM_NOT_FOUND";
    public static final String INSUFFICIENT_LOYALTY_POINTS = "INSUFFICIENT_LOYALTY_POINTS";
    public static final String ADDRESS_NOT_FOUND = "ADDRESS_NOT_FOUND";
    public static final String INVALID_ADDRESS_DATA = "INVALID_ADDRESS_DATA";
    public static final String TRAVEL_DOCUMENT_INVALID = "TRAVEL_DOCUMENT_INVALID";
    public static final String TRAVEL_DOCUMENT_EXPIRED = "TRAVEL_DOCUMENT_EXPIRED";
    
    // === BOOKING SERVICE ERRORS ===
    public static final String BOOKING_NOT_FOUND = "BOOKING_NOT_FOUND";
    public static final String BOOKING_ALREADY_EXISTS = "BOOKING_ALREADY_EXISTS";
    public static final String BOOKING_CANCELLED = "BOOKING_CANCELLED";
    public static final String BOOKING_EXPIRED = "BOOKING_EXPIRED";
    public static final String BOOKING_NOT_MODIFIABLE = "BOOKING_NOT_MODIFIABLE";
    public static final String INVALID_BOOKING_STATUS = "INVALID_BOOKING_STATUS";
    public static final String BOOKING_LIMIT_EXCEEDED = "BOOKING_LIMIT_EXCEEDED";
    public static final String SAGA_NOT_FOUND = "SAGA_NOT_FOUND";
    public static final String SAGA_ALREADY_COMPLETED = "SAGA_ALREADY_COMPLETED";
    public static final String SAGA_COMPENSATION_FAILED = "SAGA_COMPENSATION_FAILED";
    
    // === FLIGHT SERVICE ERRORS ===
    public static final String FLIGHT_NOT_FOUND = "FLIGHT_NOT_FOUND";
    public static final String FLIGHT_NOT_AVAILABLE = "FLIGHT_NOT_AVAILABLE";
    public static final String FLIGHT_FULLY_BOOKED = "FLIGHT_FULLY_BOOKED";
    public static final String INVALID_FLIGHT_DATES = "INVALID_FLIGHT_DATES";
    public static final String SEAT_NOT_AVAILABLE = "SEAT_NOT_AVAILABLE";
    public static final String SEAT_ALREADY_RESERVED = "SEAT_ALREADY_RESERVED";
    public static final String INVALID_PASSENGER_DATA = "INVALID_PASSENGER_DATA";
    public static final String AIRPORT_NOT_FOUND = "AIRPORT_NOT_FOUND";
    public static final String AIRLINE_NOT_FOUND = "AIRLINE_NOT_FOUND";
    public static final String FLIGHT_SCHEDULE_CONFLICT = "FLIGHT_SCHEDULE_CONFLICT";
    
    // === HOTEL SERVICE ERRORS ===
    public static final String HOTEL_NOT_FOUND = "HOTEL_NOT_FOUND";
    public static final String HOTEL_NOT_AVAILABLE = "HOTEL_NOT_AVAILABLE";
    public static final String ROOM_NOT_FOUND = "ROOM_NOT_FOUND";
    public static final String ROOM_NOT_AVAILABLE = "ROOM_NOT_AVAILABLE";
    public static final String ROOM_FULLY_BOOKED = "ROOM_FULLY_BOOKED";
    public static final String INVALID_CHECKIN_CHECKOUT_DATES = "INVALID_CHECKIN_CHECKOUT_DATES";
    public static final String INVALID_GUEST_DATA = "INVALID_GUEST_DATA";
    public static final String HOTEL_POLICY_VIOLATION = "HOTEL_POLICY_VIOLATION";
    public static final String ROOM_CAPACITY_EXCEEDED = "ROOM_CAPACITY_EXCEEDED";
    
    // === PAYMENT SERVICE ERRORS ===
    public static final String PAYMENT_NOT_FOUND = "PAYMENT_NOT_FOUND";
    public static final String PAYMENT_FAILED = "PAYMENT_FAILED";
    public static final String PAYMENT_DECLINED = "PAYMENT_DECLINED";
    public static final String PAYMENT_EXPIRED = "PAYMENT_EXPIRED";
    public static final String PAYMENT_ALREADY_PROCESSED = "PAYMENT_ALREADY_PROCESSED";
    public static final String INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS";
    public static final String INVALID_PAYMENT_METHOD = "INVALID_PAYMENT_METHOD";
    public static final String PAYMENT_METHOD_NOT_FOUND = "PAYMENT_METHOD_NOT_FOUND";
    public static final String PAYMENT_GATEWAY_ERROR = "PAYMENT_GATEWAY_ERROR";
    public static final String REFUND_NOT_ALLOWED = "REFUND_NOT_ALLOWED";
    public static final String REFUND_FAILED = "REFUND_FAILED";
    public static final String INVALID_AMOUNT = "INVALID_AMOUNT";
    public static final String CURRENCY_NOT_SUPPORTED = "CURRENCY_NOT_SUPPORTED";
    
    // === NOTIFICATION SERVICE ERRORS ===
    public static final String NOTIFICATION_SEND_FAILED = "NOTIFICATION_SEND_FAILED";
    public static final String INVALID_NOTIFICATION_TEMPLATE = "INVALID_NOTIFICATION_TEMPLATE";
    public static final String NOTIFICATION_PREFERENCE_NOT_FOUND = "NOTIFICATION_PREFERENCE_NOT_FOUND";
    public static final String EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED";
    public static final String SMS_SEND_FAILED = "SMS_SEND_FAILED";
    public static final String PUSH_NOTIFICATION_FAILED = "PUSH_NOTIFICATION_FAILED";
    
    // === DATA VALIDATION ERRORS ===
    public static final String INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT";
    public static final String INVALID_PHONE_FORMAT = "INVALID_PHONE_FORMAT";
    public static final String INVALID_DATE_FORMAT = "INVALID_DATE_FORMAT";
    public static final String INVALID_DATE_RANGE = "INVALID_DATE_RANGE";
    public static final String REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING";
    public static final String FIELD_TOO_LONG = "FIELD_TOO_LONG";
    public static final String FIELD_TOO_SHORT = "FIELD_TOO_SHORT";
    public static final String INVALID_ENUM_VALUE = "INVALID_ENUM_VALUE";
    public static final String INVALID_UUID_FORMAT = "INVALID_UUID_FORMAT";
    
    // === BUSINESS LOGIC ERRORS ===
    public static final String BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION";
    public static final String OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED";
    public static final String RESOURCE_LOCKED = "RESOURCE_LOCKED";
    public static final String CONCURRENT_MODIFICATION = "CONCURRENT_MODIFICATION";
    public static final String QUOTA_EXCEEDED = "QUOTA_EXCEEDED";
    public static final String RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED";
    
    // === EXTERNAL SERVICE ERRORS ===
    public static final String EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR";
    public static final String KEYCLOAK_ERROR = "KEYCLOAK_ERROR";
    public static final String DATABASE_ERROR = "DATABASE_ERROR";
    public static final String KAFKA_ERROR = "KAFKA_ERROR";
    public static final String REDIS_ERROR = "REDIS_ERROR";
    public static final String THIRD_PARTY_API_ERROR = "THIRD_PARTY_API_ERROR";
    
    // === SYSTEM ERRORS ===
    public static final String CONFIGURATION_ERROR = "CONFIGURATION_ERROR";
    public static final String RESOURCE_EXHAUSTED = "RESOURCE_EXHAUSTED";
    public static final String MAINTENANCE_MODE = "MAINTENANCE_MODE";
    public static final String FEATURE_DISABLED = "FEATURE_DISABLED";
    public static final String VERSION_MISMATCH = "VERSION_MISMATCH";
    
    // === ERROR MESSAGES ===
    public static class Messages {
        public static final String CUSTOMER_NOT_FOUND_MSG = "Customer not found";
        public static final String BOOKING_NOT_FOUND_MSG = "Booking not found";
        public static final String PAYMENT_FAILED_MSG = "Payment processing failed";
        public static final String VALIDATION_FAILED_MSG = "Validation failed";
        public static final String UNAUTHORIZED_ACCESS_MSG = "Unauthorized access";
        public static final String INTERNAL_ERROR_MSG = "Internal server error occurred";
        public static final String SERVICE_UNAVAILABLE_MSG = "Service temporarily unavailable";
        
        private Messages() {
            // Utility class
        }
    }
}
