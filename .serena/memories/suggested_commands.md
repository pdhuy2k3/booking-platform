# Suggested Commands for BookingSmart Development

## Build and Compilation
```bash
# Build entire project
mvn clean install

# Build specific service (IMPORTANT: Include common-lib for services that depend on it)
mvn clean install -pl common-lib,booking-service
mvn clean install -pl common-lib,flight-service
mvn clean install -pl common-lib,hotel-service

# Build multiple services together
mvn clean install -pl common-lib,booking-service,flight-service

# Skip tests during build
mvn clean install -DskipTests

# Install parent POM only (when building from scratch)
mvn clean install -N
```

## Docker Operations
```bash
# Start all services (app profile)
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
docker exec -it bookingsmart-kafka-1 kafka-topics --bootstrap-server localhost:9092 --list
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

## Testing
```bash
# Run all tests
mvn test

# Run tests for specific service
mvn test -pl booking-service

# Run integration tests
mvn verify
```

## Utility Commands (Windows)
```cmd
# List directories
dir

# Find files
where /r . *.java

# View file content
type filename.txt

# Network operations
netstat -an | findstr :8080
```