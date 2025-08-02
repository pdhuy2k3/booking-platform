# Coding Style and Conventions

## Java Code Style
- **Package Structure**: `com.pdh.{service-name}.{layer}` (e.g., `com.pdh.booking.service`)
- **Annotations**: Heavy use of Lombok (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- **Documentation**: Comprehensive JavaDoc comments for public APIs
- **Naming**: Descriptive class and method names following camelCase convention

## Architecture Patterns
- **Layered Architecture**: Controller → Service → Repository pattern
- **DTO Pattern**: Separate DTOs for requests, responses, and internal communication
- **Mapper Pattern**: Dedicated mapper classes for entity-DTO conversion
- **Common Library**: Shared components in `common-lib` module

## API Design
- **Standardized Responses**: All APIs use `ApiResponse<T>` wrapper
- **RESTful Endpoints**: Follow REST conventions with proper HTTP methods
- **Context Paths**: Each service has its own context path (e.g., `/bookings`, `/flights`)
- **Error Handling**: Consistent error codes and messages

## Database Conventions
- **Entity Naming**: Pascal case for entities, snake_case for database tables
- **Auditing**: All entities extend `AbstractAuditEntity` for created/updated timestamps
- **Migrations**: Liquibase changesets for database schema management
- **Outbox Tables**: Each service has an outbox table for event publishing

## Configuration Management
- **Profiles**: Separate configurations for `local`, `docker`, and production
- **Environment Variables**: Externalized configuration via environment variables
- **YAML Format**: Application configuration in YAML format