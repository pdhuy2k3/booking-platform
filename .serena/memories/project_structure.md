# Project Structure

## Root Directory Structure
```
bookingsmart/
├── common-lib/                 # Shared components and utilities
├── discovery-service/          # Eureka service discovery
├── booking-service/           # Core booking orchestration
├── flight-service/            # Flight inventory management
├── hotel-service/             # Hotel inventory management
├── payment-service/           # Payment processing
├── customer-service/          # Customer management
├── notification-service/      # Email and notifications
├── storefront-bff/           # Customer-facing BFF
├── backoffice-bff/           # Admin-facing BFF
├── storefront-fe/            # Customer frontend (Next.js)
├── backoffice-fe/            # Admin frontend (Next.js)
├── identity/                 # Keycloak configuration
├── debezium/                 # Debezium connector configurations
├── docker-compose.yml        # Container orchestration
├── nginx.conf               # Reverse proxy configuration
└── pom.xml                  # Maven parent POM
```

## Service Structure (Example: booking-service)
```
booking-service/
├── src/main/java/com/pdh/booking/
│   ├── config/              # Configuration classes
│   ├── controller/          # REST controllers
│   ├── dto/                 # Data Transfer Objects
│   │   ├── request/         # Request DTOs
│   │   ├── response/        # Response DTOs
│   │   └── internal/        # Internal DTOs
│   ├── kafka/               # Kafka configuration and listeners
│   ├── mapper/              # Entity-DTO mappers
│   ├── model/               # JPA entities and enums
│   ├── repository/          # Data access layer
│   ├── saga/                # Saga orchestration
│   ├── service/             # Business logic
│   └── viewmodel/           # View models for UI
├── src/main/resources/
│   ├── application.yml      # Application configuration
│   └── db/changelog/        # Liquibase migrations
└── src/test/                # Test classes
```

## Common Library Structure
```
common-lib/
├── config/                  # Shared configuration
├── constants/               # Application constants
├── dto/                     # Common DTOs
├── event/                   # Domain events
├── exceptions/              # Custom exceptions
├── kafka/                   # Kafka utilities
├── lock/                    # Distributed locking
├── model/                   # Base entities
├── outbox/                  # Outbox pattern implementation
├── saga/                    # Saga pattern utilities
├── utils/                   # Utility classes
└── validation/              # Validation utilities
```