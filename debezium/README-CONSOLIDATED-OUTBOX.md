# Debezium Configuration for Consolidated Outbox Pattern

## Overview

This document describes the Debezium CDC configuration for the consolidated outbox pattern implementation. The outbox entities have been consolidated into shared implementations in the `common-lib` module.

## Outbox Table Mapping

### Service → Table Mapping (Using @MappedSuperclass Pattern)

| Service | Outbox Table | Service Entity | Base Class | Description |
|---------|-------------|---------------|-------------|-------------|
| **flight-service** | `flight_outbox_events` | `FlightOutboxEvent` | `SimpleOutboxEvent` | Lightweight events for flight operations |
| **hotel-service** | `hotel_outbox_events` | `HotelOutboxEvent` | `SimpleOutboxEvent` | Lightweight events for hotel operations |
| **notification-service** | `notification_outbox_events` | `NotificationOutboxEvent` | `SimpleOutboxEvent` | Lightweight events for notifications |
| **booking-service** | `booking_outbox_events` | `BookingOutboxEvent` | `BaseOutboxEvent` | Standard events with retry mechanisms |
| **payment-service** | `payment_outbox_events` | `PaymentOutboxEvent` | `ExtendedOutboxEvent` | Advanced events with saga support |

### Table Schemas

#### `simple_outbox_events` (Flight, Hotel, Notification)
```sql
CREATE TABLE simple_outbox_events (
    id UUID PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `outbox_events` (Booking)
```sql
CREATE TABLE outbox_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    payload TEXT NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMP,
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    next_retry_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `payment_outbox_events` (Payment)
```sql
CREATE TABLE payment_outbox_events (
    -- Inherits all fields from outbox_events
    -- Plus additional fields:
    saga_id VARCHAR(36),
    booking_id UUID,
    user_id UUID,
    headers TEXT,
    topic VARCHAR(100),
    partition_key VARCHAR(100),
    priority INTEGER NOT NULL DEFAULT 5,
    expires_at TIMESTAMPTZ,
    last_error TEXT
);
```

## Debezium Connectors

### 1. Flight Service Connector
- **File**: `flight-db-connector.json`
- **Database**: `flight_db`
- **Table**: `simple_outbox_events`
- **Topic Pattern**: `booking.Flight.events`

### 2. Hotel Service Connector
- **File**: `hotel-db-connector.json`
- **Database**: `hotel_db`
- **Table**: `simple_outbox_events`
- **Topic Pattern**: `booking.Hotel.events`

### 3. Notification Service Connector
- **File**: `notification-db-connector.json`
- **Database**: `notification_db`
- **Table**: `simple_outbox_events`
- **Topic Pattern**: `booking.Notification.events`

### 4. Booking Service Connector
- **File**: `booking-saga-outbox-connector.json`
- **Database**: `booking_db`
- **Table**: `outbox_events`
- **Topic Pattern**: `booking.{aggregate_type}.events`

### 5. Payment Service Connector
- **File**: `payment-db-connector.json`
- **Database**: `payment_db`
- **Table**: `payment_outbox_events`
- **Topic Pattern**: `booking.Payment.events`

## Outbox Event Router Configuration

All connectors use the Debezium Outbox Event Router transform:

```json
{
  "transforms": "outbox",
  "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
  "transforms.outbox.route.by.field": "aggregate_type",
  "transforms.outbox.route.topic.replacement": "booking.${routedByValue}.events",
  "transforms.outbox.table.field.event.key": "aggregate_id",
  "transforms.outbox.table.field.event.id": "id", // or "event_id" for advanced tables
  "transforms.outbox.table.field.event.timestamp": "created_at"
}
```

## Kafka Topics

Events are routed to the following Kafka topics:

- `booking.Flight.events` - Flight-related events
- `booking.Hotel.events` - Hotel-related events
- `booking.Notification.events` - Notification events
- `booking.Booking.events` - Booking events
- `booking.Payment.events` - Payment events
- `booking.Saga.events` - Saga orchestration events

## Deployment

### Prerequisites
1. PostgreSQL databases must be running
2. Required outbox tables must exist
3. Kafka and Kafka Connect must be running

### Deploy Connectors

**Using Shell Script (Linux/Mac):**
```bash
./deploy-debezium-connectors.sh
```

**Using PowerShell (Windows):**
```powershell
.\deploy-debezium-connectors.ps1
```

### Verify Deployment

1. **Check connector status:**
   ```bash
   curl http://localhost:8083/connectors
   ```

2. **Monitor Kafka topics:**
   - Kafka UI: http://localhost:8090
   - Connect API: http://localhost:8083

3. **Check connector health:**
   ```bash
   curl http://localhost:8083/connectors/flight-outbox-connector/status
   ```

## Event Flow

1. **Service Operation** → Business logic executes
2. **Outbox Event** → Event saved to outbox table (same transaction)
3. **Debezium CDC** → Detects table changes
4. **Event Router** → Transforms and routes to appropriate Kafka topic
5. **Event Consumers** → Process events from Kafka topics

## Monitoring and Troubleshooting

### Common Issues

1. **Connector fails to start:**
   - Check database connectivity
   - Verify table exists
   - Check PostgreSQL replication slot

2. **No events in Kafka:**
   - Verify outbox events are being created
   - Check connector status
   - Review Kafka Connect logs

3. **Event routing issues:**
   - Verify `aggregate_type` field values
   - Check topic naming configuration
   - Review transform configuration

### Useful Commands

```bash
# List all connectors
curl http://localhost:8083/connectors

# Get connector configuration
curl http://localhost:8083/connectors/flight-outbox-connector/config

# Restart connector
curl -X POST http://localhost:8083/connectors/flight-outbox-connector/restart

# Delete connector
curl -X DELETE http://localhost:8083/connectors/flight-outbox-connector
```

## Benefits of Consolidated Outbox

1. **Consistency** - Single outbox implementation across services
2. **Maintainability** - Changes in one place affect all services
3. **Flexibility** - Different outbox types for different needs
4. **Reliability** - Proven outbox pattern with CDC
5. **Scalability** - Debezium handles high-throughput scenarios
