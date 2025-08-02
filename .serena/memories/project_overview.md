# BookingSmart Project Overview

## Project Purpose
BookingSmart is a comprehensive microservices-based booking platform for travel services including flights, hotels, and combo packages. It provides both customer-facing storefront and administrative backoffice interfaces.

## Core Architecture
- **Microservices Architecture**: Multiple independent Spring Boot services
- **Event-Driven**: Uses Apache Kafka for asynchronous communication
- **Database per Service**: Each microservice has its own PostgreSQL database
- **Change Data Capture**: Debezium for reliable event publishing via outbox pattern
- **Authentication**: Keycloak for OAuth2/JWT-based security
- **API Gateway**: Nginx reverse proxy with BFF (Backend for Frontend) pattern

## Key Services
- **booking-service**: Core booking orchestration and saga management
- **flight-service**: Flight inventory and reservation management
- **hotel-service**: Hotel inventory and reservation management
- **payment-service**: Payment processing with Stripe integration
- **customer-service**: Customer management and Keycloak integration
- **notification-service**: Email and notification handling
- **storefront-bff**: Backend for Frontend for customer interface
- **backoffice-bff**: Backend for Frontend for admin interface

## Frontend Applications
- **storefront-fe**: Next.js customer-facing application
- **backoffice-fe**: Next.js administrative interface

## Key Architectural Patterns
1. **Outbox Pattern**: Ensures atomic database updates and event publishing
2. **Saga Pattern**: Manages distributed transactions across services
3. **Listen to Yourself Pattern**: Decouples synchronous operations from async tasks