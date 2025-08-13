# Architecture Overview

## Technology Stack

BookingSmart is built on a modern microservices architecture leveraging **Spring Boot 3.5.3** running on **Java 21** with **virtual threads** for enhanced concurrency. The frontend applications utilize **Next.js** for both customer-facing and backoffice portals.

## Core Architecture Components

### Event-Driven Architecture
The platform implements a robust **event-driven architecture** using **Apache Kafka** as the message broker with **Debezium CDC** (Change Data Capture) for real-time database event streaming. This ensures reliable event propagation across services while maintaining data consistency.

### Distributed Transaction Management
- **Saga Pattern**: Orchestration-based saga implementation for managing distributed transactions across microservices
- **Outbox Pattern**: Transactional outbox tables in each service guarantee at-least-once event delivery
- **Compensation Logic**: Automatic rollback mechanisms handle failure scenarios gracefully

### Service Discovery & Communication
- **Eureka**: Netflix Eureka provides dynamic service discovery and registration
- **Client-side Load Balancing**: Services communicate through discovered endpoints with automatic failover
- **REST APIs**: Synchronous inter-service communication with circuit breaker patterns

### Security & Authentication
- **Keycloak**: Centralized OAuth2/OpenID Connect authentication and authorization
- **JWT Tokens**: Stateless authentication with role-based access control (RBAC)
- **Spring Security**: Comprehensive security configurations at service level

### Data Management
- **PostgreSQL**: Database-per-service pattern with PostgreSQL 17
- **Liquibase**: Database schema version control and migration management
- **Redis**: Distributed caching and **distributed locking** for critical sections
- **Event Deduplication**: Redis-based idempotency keys prevent duplicate processing

### Frontend Architecture
- **Next.js Applications**: 
  - Customer-facing storefront with SSR/SSG capabilities
  - Administrative backoffice portal
- **BFF Pattern**: Backend-for-Frontend services provide tailored APIs for each frontend

## Key Architectural Patterns

### Microservices Decomposition
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│         (Next.js Storefront & Backoffice)               │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                     BFF Layer                           │
│     (storefront-bff, backoffice-bff)                   │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│                  Business Services                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Booking  │ │  Flight  │ │  Hotel   │ │ Payment  │  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────────┐                         │
│  │Customer  │ │ Notification │                         │
│  │ Service  │ │   Service    │                         │
│  └──────────┘ └──────────────┘                         │
└─────────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────────┐
│              Infrastructure Services                     │
│   Eureka | Kafka | Debezium | Redis | Keycloak         │
└─────────────────────────────────────────────────────────┘
```

### Event Flow Architecture
```
Database → Debezium CDC → Kafka Topics → Service Consumers
    ↓           ↓             ↓              ↓
[Outbox]   [Captures]    [Events]     [Process & Update]
```

### Saga Orchestration Flow
```
Booking Initiated → Flight Reserved → Hotel Reserved → Payment Processed → Booking Completed
       ↓                  ↓                ↓                ↓                    ↓
[Compensation]    [Cancel Flight]  [Cancel Hotel]   [Refund Payment]    [Cancel Booking]
```

## Performance & Scalability Features

- **Virtual Threads**: Java 21 virtual threads enable massive concurrency with minimal resource overhead
- **Distributed Locking**: Redis-based locks ensure data consistency in multi-instance deployments
- **Event Deduplication**: Prevents duplicate processing in distributed environments
- **Caching Strategy**: Redis cache-aside pattern reduces database load
- **Horizontal Scaling**: Stateless services enable seamless scaling based on demand

## Reliability & Resilience

- **At-least-once Delivery**: Outbox pattern ensures no events are lost
- **Compensation Transactions**: Saga pattern handles distributed rollbacks
- **Service Discovery**: Automatic service registration and health checking
- **Database Migrations**: Liquibase ensures consistent schema evolution
- **Circuit Breakers**: Prevent cascading failures in service communication

## Development & Deployment

- **Maven Multi-Module**: Centralized dependency management
- **Docker Compose**: Orchestrated local development and testing
- **Spring Profiles**: Environment-specific configurations (local, docker, test)
- **API Documentation**: SpringDoc OpenAPI for automatic API documentation

This architecture provides a robust, scalable foundation for the BookingSmart platform, combining modern microservices patterns with proven enterprise technologies to deliver a reliable travel booking experience.
