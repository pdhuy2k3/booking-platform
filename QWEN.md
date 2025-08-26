# BookingSmart Project Context

This document provides an overview of the BookingSmart project for use in future interactions with Qwen Code.

## Project Overview

BookingSmart is a comprehensive travel booking platform built as a microservices architecture using Java Spring Boot. The platform is designed to handle various aspects of travel planning and booking, including flights, hotels, and potentially other travel services. It leverages several key technologies and architectural patterns:

- **Microservices Architecture:** The application is decomposed into multiple independent services (e.g., `flight-service`, `hotel-service`, `booking-service`, `customer-service`, `payment-service`, `notification-service`).
- **Backend-for-Frontend (BFF):** Separate BFFs (`backoffice-bff`, `storefront-bff`) act as API gateways and aggregation layers for the frontend applications.
- **Service Discovery:** Netflix Eureka (`discovery-service`) is used for service registration and discovery.
- **Authentication & Authorization:** Keycloak is the identity and access management solution, handling user authentication and role-based authorization (roles like `CUSTOMER`, `ADMIN`).
- **Data Management:**
  - PostgreSQL is the primary relational database, with separate databases for each service.
  - Liquibase is used for database migrations.
  - Redis is used for event deduplication.
- **Messaging & Events:**
  - Apache Kafka is used for asynchronous communication and event-driven architecture between services.
  - Debezium is used for Change Data Capture (CDC) from PostgreSQL to Kafka.
- **Build & Deployment:**
  - Maven is the build tool.
  - Docker and Docker Compose are used for containerization and local deployment.
  - Nginx acts as a reverse proxy.
- **Frontend:** The project includes frontend applications (`backoffice-fe`, `storefront-fe`), likely built with a modern JavaScript framework (e.g., React, Next.js).
- **Common Library:** A `common-lib` module provides shared functionalities across services, such as JPA, Redis, Kafka, and AOP configurations.

## Key Technologies

- Java 21
- Spring Boot 3.5.3
- Spring Cloud 2025.0.0
- PostgreSQL
- Redis
- Apache Kafka
- Debezium
- Keycloak 25.0.3
- Maven
- Docker
- Nginx
- N8N (Workflow Automation)

## Building and Running

The project uses Maven for building and managing dependencies.

### Prerequisites

- Java 21
- Maven
- Docker & Docker Compose

### Building the Project

To build the entire project, run the following command from the root directory:

```bash
# Build all modules
mvn clean install

# Build a specific module (e.g., hotel-service)
mvn clean install -pl hotel-service -am
```

### Running the Project

The easiest way to run the entire system locally is using Docker Compose.

1.  Ensure Docker and Docker Compose are installed.
2.  From the root directory, run:
    ```bash
    docker compose up --build
    ```
    This will start all the services defined in `docker-compose.yml`, including databases, Keycloak, Kafka, and the Spring Boot applications.

## Development Conventions

- **Modular Structure:** The project is a Maven multi-module project. Each service and BFF is a separate module.
- **Spring Boot:** Services are built using Spring Boot, leveraging Spring Cloud for microservices patterns.
- **Configuration:** Services likely use Spring's profile-based configuration (e.g., `application-docker.yml`).
- **Database Migrations:** Liquibase is used for managing database schema changes.
- **Security:** OAuth2 Resource Server is used for securing services, integrated with Keycloak.
- **Event-Driven:** Services communicate asynchronously using Kafka events for loose coupling.
- **Common Code:** Shared code and configurations are placed in the `common-lib` module to avoid duplication.

## Directory Structure

- `backoffice-bff/`: Backend-for-Frontend for the backoffice/admin panel.
- `backoffice-fe/`: Frontend application for the backoffice/admin panel.
- `booking-service/`: Service handling the core booking logic and orchestration.
- `common-lib/`: Shared library with common configurations and utilities.
- `customer-service/`: Service managing customer data and profiles.
- `discovery-service/`: Netflix Eureka service discovery server.
- `flight-service/`: Service managing flight search and data.
- `hotel-service/`: Service managing hotel search and data.
- `identity/`: Keycloak configuration and realm export.
- `keycloak-theme/`: Custom Keycloak theme.
- `notification-service/`: Service handling notifications (email, SMS, etc.).
- `payment-service/`: Service managing payment processing.
- `storefront-bff/`: Backend-for-Frontend for the customer-facing storefront.
- `storefront-fe/`: Frontend application for the customer-facing storefront.
- `debezium/`: Debezium connector configurations.
- `docs/`: Project documentation.