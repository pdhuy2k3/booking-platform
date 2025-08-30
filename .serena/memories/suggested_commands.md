# Suggested Commands for BookingSmart Development

## Build and Compilation
```bash
# Build entire project
mvn clean install

# Build specific service with dependencies (IMPORTANT: Use -am flag)
mvn clean install -pl booking-service -am
mvn clean install -pl flight-service -am
mvn clean install -pl hotel-service -am

# Build multiple services together
mvn clean install -pl booking-service,flight-service -am

# Skip tests during build
mvn clean install -DskipTests

# Install parent POM only (when building from scratch)
mvn clean install -N
```

## Docker Operations
```bash
# Start all services (app profile) - all services on port 80
docker compose --profile app up -d

# Start development environment (dev profile)
docker compose --profile dev up -d

# Start authentication services only
docker compose --profile auth up -d

# View logs for specific service
docker compose logs -f booking-service

# Rebuild and restart service
docker compose up -d --build booking-service
```

## Database Operations
```bash
# Connect to PostgreSQL
docker exec -it bookingsmart-postgres-1 psql -U postgres

# Run Liquibase migrations manually
mvn liquibase:update -pl booking-service
```

## Kafka and Debezium
```bash
# Deploy Debezium connectors (Windows)
.\deploy-debezium-connectors.ps1

# Deploy Debezium connectors (Linux/Mac)
./deploy-debezium-connectors.sh

# View Kafka topics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check consumer groups and lag
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups

# Reset consumer offset (troubleshooting)
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 \
  --group booking-service-group --reset-offsets --to-earliest --execute --all-topics
```

## Testing and Debugging
```bash
# Run all tests
mvn test

# Run tests for specific service
mvn test -pl booking-service

# Run integration tests
mvn verify

# Health checks (all services on port 80)
curl http://localhost/actuator/health
curl http://localhost/actuator/sagas  # View active sagas
curl http://localhost/actuator/metrics/saga.transactions.active  # Active saga count

# Dynamic log level change
curl -X POST http://localhost/actuator/loggers/com.pdh.booking.saga \
  -H "Content-Type: application/json" -d '{"configuredLevel": "DEBUG"}'
```

## Frontend Development
```bash
# Install dependencies
cd storefront-fe && pnpm install

# Start development server
cd storefront-fe && pnpm dev

# Build for production
cd storefront-fe && pnpm build

# Lint code
cd storefront-fe && pnpm lint
```

## Virtual Threads Debugging (Java 21)
```bash
# Enable virtual thread debugging
java -Djdk.tracePinnedThreads=full -jar booking-service.jar

# Monitor virtual threads
curl http://localhost/actuator/metrics/jvm.threads.virtual.count
curl http://localhost/actuator/threaddump | jq '.threads[] | select(.threadName | startswith("VirtualThread"))'
```

## Utility Commands (Windows PowerShell)
```powershell
# List directories
Get-ChildItem

# Find files
Get-ChildItem -Recurse -Name "*.java"

# View file content
Get-Content filename.txt

# Network operations
netstat -an | Select-String ":8080"

# Process management
Get-Process java
```

## Troubleshooting Commands
```bash
# Check if all required services are running
docker compose ps

# Restart stuck saga
curl -X POST http://localhost/actuator/sagas/{transactionId}/retry

# Force compensate saga
curl -X POST http://localhost/actuator/sagas/{transactionId}/compensate

# View pending outbox events (connect to postgres first)
SELECT * FROM booking_outbox_events WHERE processed = false ORDER BY created_at DESC;
```

## Key Notes
- **All services run on port 80** in Docker (configured via SERVER_PORT env var)
- **Maven `-am` flag**: Automatically builds dependencies (e.g., common-lib)
- **Virtual Threads**: Java 21 feature enabled - monitor for pinning issues
- **Saga Mock Mode**: Set `saga.mock.enabled=true` for testing without all services