# BookingSmart Code Style and Conventions

## Java Code Style

### Naming Conventions
- **Packages**: `com.pdh.{service-name}.{domain}` (e.g., `com.pdh.booking.saga`)
- **Classes**: PascalCase (e.g., `BookingSagaOrchestrator`, `FlightService`)
- **Methods**: camelCase (e.g., `startBookingSaga()`, `reserveFlight()`)
- **Variables**: camelCase (e.g., `sagaId`, `bookingDetails`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `BOOKING_CONFIRMED`, `MAX_RETRY_COUNT`)
- **DTOs**: Suffix with `Dto` (e.g., `BookingRequestDto`, `FlightResponseDto`)
- **Entities**: Plain domain names (e.g., `Booking`, `Flight`, `Hotel`)
- **Services**: Suffix with `Service` (e.g., `BookingService`, `PaymentService`)
- **Controllers**: Suffix with `Controller` (e.g., `BookingController`)
- **Repositories**: Suffix with `Repository` (e.g., `BookingRepository`)

### Annotations
- **Lombok**: Extensive use of `@Data`, `@Builder`, `@AllArgsConstructor`, `@NoArgsConstructor`
- **Validation**: Use `@Valid`, `@NotNull`, `@NotBlank` for input validation
- **JPA**: Use `@Entity`, `@Table`, `@Column` with explicit naming
- **Kafka**: Use `@KafkaListener` with explicit topics and consumer groups
- **Logging**: Use `@Slf4j` for logging with structured log messages

### Documentation
- **JavaDoc**: Comprehensive class and method documentation
- **Inline Comments**: Explain complex business logic, especially in saga orchestration
- **API Documentation**: Use SpringDoc OpenAPI for automatic documentation

## Architecture Patterns

### Saga Pattern Implementation
- Each service implements saga participants with compensation logic
- State machines for saga orchestration with explicit state transitions
- Comprehensive error handling and retry mechanisms
- Distributed locks for inventory management

### Event-Driven Patterns
- Outbox pattern for reliable event publishing
- Event deduplication using Redis-based idempotency keys
- Structured event payloads with version compatibility
- CDC (Change Data Capture) integration with Debezium

### Error Handling
- Comprehensive exception hierarchy with domain-specific exceptions
- Global exception handlers in controllers
- Structured error responses with correlation IDs
- Circuit breaker patterns for external service calls

## Configuration Management
- **Profiles**: Use `local`, `docker`, `test` profiles
- **Properties**: Externalize configuration using `application-{profile}.yml`
- **Environment Variables**: Override sensitive configuration via env vars
- **Feature Toggles**: Use configuration properties for feature flags

## Testing Conventions
- **Unit Tests**: High coverage for business logic, especially saga orchestration
- **Integration Tests**: Test Kafka message flows and database interactions
- **Contract Tests**: Ensure API compatibility between services
- **End-to-End Tests**: Test complete booking workflows

## Security Practices
- **Authentication**: OAuth2/JWT tokens via Keycloak
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive validation at API boundaries
- **Sensitive Data**: No secrets in code, use environment variables
- **CORS**: Proper CORS configuration for web applications

## Database Conventions
- **Naming**: snake_case for table and column names
- **Migrations**: Use Liquibase changesets with proper rollback scripts
- **Indexes**: Explicit index creation for performance-critical queries
- **Constraints**: Use database constraints for data integrity
- **Audit Fields**: Include created_at, updated_at, created_by, updated_by

## Kafka Conventions
- **Topics**: Use descriptive names (e.g., `booking-saga-commands`, `flight-db-server.public.flight_outbox_events`)
- **Consumer Groups**: Use service-specific group IDs
- **Message Format**: JSON with schema evolution compatibility
- **Error Handling**: Dead letter topics for failed messages
- **Acknowledgment**: Manual acknowledgment for important messages