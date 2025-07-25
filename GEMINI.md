# Gemini Code Assistant Project Overview

This document provides an overview of the `bookingsmart` project architecture and key design patterns.

## Core Technologies

*   **Microservices:** The application is split into multiple, independent Spring Boot services (e.g., `booking-service`, `payment-service`, `notification-service`).
*   **Database:** Each microservice has its own dedicated PostgreSQL database, ensuring loose coupling.
*   **Messaging:** Apache Kafka serves as the asynchronous event bus for inter-service communication.
*   **Change Data Capture (CDC):** Debezium is used to capture row-level changes in each service's database and publish them as events to Kafka.

## Key Architectural Patterns

This project heavily relies on several advanced patterns to ensure data consistency, reliability, and resilience in a distributed environment.

### 1. The Outbox Pattern

This pattern guarantees that a service can atomically update its database and send an event to other services. It is the foundation for reliable messaging in the system.

**Implementation:**
1.  **Atomic Write:** When a service needs to perform an action (e.g., create a booking), it starts a single database transaction to write to its business tables (e.g., `bookings`) AND insert a corresponding event record into an `outbox` table.
2.  **CDC with Debezium:** A Debezium connector is configured for each service to monitor its `outbox` table.
3.  **Reliable Publishing:** When Debezium sees a new record in the `outbox` table, it reliably publishes that event to a Kafka topic. This decouples the business logic from the message publishing itself.

### 2. The Saga Pattern

The Saga pattern is used to manage distributed transactions that span multiple services, such as the end-to-end booking flow.

**Example: The Booking Saga**
1.  **Initiation:** The `booking-service` creates a `PENDING` booking and publishes a `BookingCreated` event (via its outbox).
2.  **Payment:** The `payment-service` listens for this event, processes the payment with Stripe, and publishes a `PaymentSucceeded` event (via its outbox).
3.  **Confirmation:** The `booking-service` listens for the `PaymentSucceeded` event and updates the booking status to `CONFIRMED`.
4.  **Notification:** The `notification-service` also listens for `PaymentSucceeded` and sends a confirmation email to the user.

If any step fails, a compensating event (e.g., `PaymentFailed`) is published, allowing services to roll back the transaction gracefully.

### 3. The "Listen to Yourself" Pattern

This pattern is used to improve responsiveness and resilience within a single service by decoupling synchronous operations from long-running or asynchronous tasks.

**Example: `payment-service`**
1.  An external API call (e.g., from the frontend) to create a payment intent does not call the Stripe API directly.
2.  Instead, it just writes a `CreatePaymentIntent` command to its own `outbox` table and returns immediately.
3.  A separate Kafka listener *within the same service* consumes this event and handles the actual, potentially slow, API call to Stripe in the background. This prevents blocking the initial web request.

This combination of patterns creates a highly scalable, resilient, and loosely coupled microservices architecture.