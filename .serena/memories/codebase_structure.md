# BookingSmart Codebase Structure

## Root Directory Structure
```
bookingsmart/
├── backoffice-bff/          # Administrative Backend-for-Frontend
├── backoffice-fe/           # Administrative Frontend (Next.js)
├── booking-service/         # Core booking orchestration service
├── common-lib/              # Shared libraries and utilities
├── customer-service/        # Customer management service
├── database_backup/         # Database backup scripts
├── debezium/               # CDC configuration
├── discovery-service/       # Eureka service registry
├── docs/                   # Documentation
├── flight-service/         # Flight inventory and booking service
├── hotel-service/          # Hotel inventory and booking service
├── identity/               # Identity service (if applicable)
├── keycloak-theme/         # Custom Keycloak theme
├── media-service/          # Media and file management
├── notification-service/   # Email/SMS notification service
├── payment-service/        # Payment processing service
├── recommendation-service/ # Recommendation engine
├── storefront-bff/        # Customer-facing Backend-for-Frontend
├── storefront-fe/         # Customer-facing Frontend (Next.js)
├── transport-service/     # Transport booking service (currently disabled)
├── docker-compose.yml     # Local development infrastructure
├── pom.xml               # Root Maven configuration
└── README files and configs
```

## Service-Specific Structure Pattern
Each Java service follows this structure:
```
[service-name]/
├── src/main/java/com/pdh/[service]/
│   ├── [ServiceName]Application.java  # Main Spring Boot application
│   ├── config/                        # Service-specific configuration
│   ├── controller/                    # REST controllers
│   ├── dto/                          # Data Transfer Objects
│   │   ├── request/                  # Request DTOs
│   │   ├── response/                 # Response DTOs
│   │   └── internal/                 # Internal DTOs
│   ├── kafka/                        # Kafka-related classes
│   │   ├── consumer/                 # Kafka consumers
│   │   ├── producer/                 # Kafka producers
│   │   └── config/                   # Kafka configuration
│   ├── mapper/                       # DTO mappers
│   ├── model/                        # JPA entities
│   │   └── enums/                    # Enumerations
│   ├── repository/                   # JPA repositories
│   ├── saga/                         # Saga orchestration (booking-service)
│   ├── service/                      # Business logic services
│   │   ├── impl/                     # Service implementations
│   │   └── dto/                      # Service-level DTOs
│   └── viewmodel/                    # View models for UI
├── src/main/resources/
│   ├── application.yml               # Main configuration
│   ├── application-local.yml         # Local profile
│   ├── application-docker.yml        # Docker profile
│   ├── application-test.yml          # Test profile
│   └── db/changelog/                 # Liquibase migrations
└── src/test/java/                    # Test classes
```

## Common Library Structure
```
common-lib/src/main/java/com/pdh/common/
├── config/                    # Shared configuration
├── event/                     # Domain events
│   ├── booking/              # Booking events
│   ├── flight/               # Flight events
│   ├── hotel/                # Hotel events
│   └── payment/              # Payment events
├── exception/                 # Common exceptions
├── kafka/                     # Kafka infrastructure
│   ├── cdc/                  # Change Data Capture
│   └── config/               # Kafka configuration
├── lock/                      # Distributed locking
├── outbox/                    # Outbox pattern implementation
├── saga/                      # Saga framework
├── security/                  # Security utilities
├── util/                      # Utility classes
└── validation/                # Validation utilities
```

## Frontend Structure (Next.js)
```
[frontend-name]/
├── src/
│   ├── app/                   # App Router (Next.js 13+)
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── services/              # API services
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── styles/                    # CSS/Tailwind styles
└── configuration files
```

## Key Architecture Components

### Saga Orchestration (Booking Service)
```
booking-service/src/main/java/com/pdh/booking/saga/
├── BookingSagaOrchestrator.java     # Main saga coordinator
├── CompensationHandler.java         # Compensation logic
└── SagaStateManager.java           # State management
```

### Event Processing
```
[service]/src/main/java/com/pdh/[service]/kafka/
├── consumer/
│   └── [Service]EventConsumer.java  # CDC and saga event consumers
├── producer/
│   └── [Service]EventProducer.java  # Event publishers
└── config/
    └── [Service]KafkaConfig.java    # Service-specific Kafka config
```

### Database Layer
```
[service]/src/main/resources/db/changelog/
├── db.changelog-master.xml          # Master changelog
├── changes/
│   ├── 001-initial-schema.xml
│   ├── 002-add-saga-support.xml
│   └── [version]-[description].xml
└── data/
    └── initial-data.xml             # Reference data
```

## Configuration Management

### Profile-Based Configuration
- `application.yml` - Base configuration
- `application-local.yml` - Local development
- `application-docker.yml` - Docker environment
- `application-test.yml` - Testing environment

### Service Discovery
- All services register with Eureka discovery service
- Service-to-service communication via service names
- Load balancing handled by Spring Cloud LoadBalancer

## Data Flow Architecture

### Request Flow
1. **Frontend** → **BFF** → **Business Services** → **Database**
2. **Business Services** → **Kafka Events** → **Other Services**
3. **Saga Orchestrator** → **Command Events** → **Service Actions**

### Event Flow
1. **Database Changes** → **Debezium CDC** → **Kafka Topics**
2. **Saga Commands** → **Service Consumers** → **Business Actions**
3. **Compensation Events** → **Rollback Actions** → **State Consistency**

## Testing Structure
```
src/test/java/com/pdh/[service]/
├── controller/                # Controller tests
├── service/                   # Service layer tests
├── repository/                # Repository tests
├── kafka/                     # Kafka integration tests
├── saga/                      # Saga orchestration tests
└── integration/               # End-to-end tests
```

## Build and Deployment

### Maven Module Structure
- Root POM manages all modules
- Common-lib built first (dependency for other services)
- Each service can be built and deployed independently
- Shared version management through `${revision}` property

### Docker Integration
- `docker-compose.yml` for local development infrastructure
- Individual Dockerfile for each service (production)
- Environment-specific configuration via environment variables