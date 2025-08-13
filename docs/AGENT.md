# AGENT.md - BookingSmart Microservices Guide

## Overview
Travel booking platform with Spring Boot microservices, Saga orchestration, Java 21 virtual threads, PostgreSQL, Kafka, and Keycloak authentication.

## Quick Start
```bash
mvn clean install && docker compose --profile auth up -d
./deploy-theme.sh && docker compose --profile app up -d
./deploy-debezium-connectors.sh  # Setup CDC
```

## Service Ports
**All services run on port 80** (configured via SERVER_PORT in .env) | **Infra**: 9090 (Keycloak), 8761 (Eureka), 8091 (Kafka UI), 5432 (PostgreSQL)

## Development
```bash
mvn clean install -pl booking-service -am  # Build service
curl http://localhost/actuator/health  # Health check (all services on port 80)
curl -X POST http://localhost/api/bookings -H "Content-Type: application/json" \
  -d '{"flightId":"FL-001","hotelId":"HT-001","customerId":"CUST-001"}'  # Test booking
```

## Saga States
`BOOKING_INITIATED → FLIGHT_RESERVED → HOTEL_RESERVED → PAYMENT_COMPLETED → BOOKING_COMPLETED`

## Testing
```yaml
saga.mock.enabled: true  # Enable mock mode
```
```bash
curl http://localhost/actuator/sagas  # View active sagas (port 80)
```

## Common Operations
```bash
docker exec -it bookingsmart-postgres-1 psql -U postgres  # Database
docker exec kafka kafka-topics --list --bootstrap-server localhost:9092  # Kafka
docker exec -it bookingsmart-redis-1 redis-cli  # Redis
```

## Troubleshooting
```bash
curl -X POST http://localhost/actuator/sagas/retry-pending  # Retry stuck saga (port 80)
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group booking-service-group --reset-offsets --to-earliest --execute --all-topics  # Reset consumer
```

## Conventions
**Package**: `com.pdh.{service}` | **API**: `/api/v1/{resource}` | **Events**: `{domain}.events`

## Key Conventions
- **Package**: `com.pdh.{service-name}`
- **API Format**: `/api/v1/{resource}`
- **Database**: Liquibase migrations in `resources/db/changelog`
- **Events**: JSON format on Kafka topics `{domain}.events`

---
*For detailed documentation, see ARCHITECTURE_OVERVIEW.md and TESTING_AND_DEBUGGING.md*
