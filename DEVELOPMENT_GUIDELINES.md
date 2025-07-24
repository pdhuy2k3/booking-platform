# BookingSmart Development Guidelines

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Development Environment Setup](#development-environment-setup)
3. [Service Development Guidelines](#service-development-guidelines)
4. [Event-Driven Architecture Guidelines](#event-driven-architecture-guidelines)
5. [Frontend Development Guidelines](#frontend-development-guidelines)
6. [Database Guidelines](#database-guidelines)
7. [Security Guidelines](#security-guidelines)
8. [Testing Guidelines](#testing-guidelines)
9. [Deployment Guidelines](#deployment-guidelines)
10. [Monitoring & Observability](#monitoring--observability)

## Project Architecture

### Core Services
- **Discovery Service**: Eureka service registry
- **Storefront BFF**: Customer-facing API gateway
- **Backoffice BFF**: Admin API gateway  
- **Flight Service**: Flight search and booking (connects to flight_db)
- **Hotel Service**: Hotel search and booking (connects to hotel_db)
- **Booking Service**: Booking orchestration and saga management
- **Payment Service**: Payment processing with Stripe
- **Customer Service**: User management and profiles
- **Notification Service**: Email/SMS notifications
- **Common Library**: Shared utilities and patterns

### Key Architectural Patterns
- **Outbox Pattern**: Reliable event publishing via database transactions
- **Saga Pattern**: Distributed transaction management
- **BFF Pattern**: Backend for Frontend with domain-specific gateways
- **"Listen to Yourself" Pattern**: Async processing within services

### Technology Stack
- **Backend**: Spring Boot 3.5.3, Java 21
- **Frontend**: Next.js with TypeScript
- **Database**: PostgreSQL with Debezium CDC
- **Messaging**: Apache Kafka
- **Authentication**: Keycloak
- **Infrastructure**: Docker Compose, nginx

## Development Environment Setup

### Prerequisites
- Java 21
- Node.js 18+
- Docker & Docker Compose
- Maven 3.9+
- pnpm (for frontend)

### Local Development Setup
1. **Clone and build**:
   ```bash
   git clone <repository-url>
   cd bookingsmart
   mvn clean install
   ```

2. **Start infrastructure**:
   ```bash
   docker-compose --profile auth up -d  # Start auth services
   docker-compose --profile app up -d   # Start all services
   ```

3. **Frontend development**:
   ```bash
   cd storefront-fe && pnpm install && pnpm dev
   cd backoffice-fe && pnpm install && pnpm dev
   ```

### Domain Configuration

**Production Domains**:
- **Storefront**: `bookingsmart.huypd.dev` (customer-facing application)
- **Backoffice**: `admin-bookingsmart.huypd.dev` (admin panel)
- **Identity**: `identity.huypd.dev` (Keycloak authentication)

**Local Development Domains** (add to hosts file):
For local development, add to your hosts file (`/etc/hosts` or `C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 bookingsmart.huypd.dev
127.0.0.1 admin-bookingsmart.huypd.dev
127.0.0.1 identity.huypd.dev
127.0.0.1 kafka.huypd.dev
127.0.0.1 n8n.huypd.dev
127.0.0.1 ollama.huypd.dev
```

### Service Ports
- **nginx**: 80 (main entry point)
- **PostgreSQL**: 5432
- **Kafka**: 9092
- **Kafka UI**: 8091
- **Debezium Connect**: 8083
- **N8N**: 5678
- **PgAdmin**: 8666 (dev profile)

## Service Development Guidelines

### Creating a New Service

1. **Use Maven archetype or copy existing service structure**
2. **Add to parent pom.xml modules section**
3. **Extend common-lib for shared functionality**
4. **Follow naming convention**: `{domain}-service`

### Service Structure
```
service-name/
├── src/main/java/com/pdh/{service}/
│   ├── {Service}Application.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── DatabaseConfig.java
│   ├── controller/
│   ├── service/
│   ├── repository/
│   ├── model/
│   │   └── outbox/
│   ├── dto/
│   └── kafka/
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
├── Dockerfile
└── pom.xml
```

### Common Library Usage

**Extend base classes**:
```java
// For entities with audit fields
public class MyEntity extends AbstractAuditEntity {
    // entity fields
}

// For outbox events
@Entity
@Table(name = "my_service_outbox")
public class MyServiceOutboxEvent extends ExtendedOutboxEvent {
    // service-specific fields if needed
}
```

**Use shared utilities**:
```java
// Standardized API responses
return ResponseUtils.ok(data, "Success message");
return ResponseUtils.badRequest("Error message", "ERROR_CODE");

// Event publishing
@Autowired
private OutboxEventPublisher eventPublisher;

eventPublisher.publishEvent("UserCreated", "User", userId.toString(), userDto);
```

### Configuration Standards

**application.yml structure**:
```yaml
server:
  port: ${SERVER_PORT:8080}

spring:
  application:
    name: SERVICE-NAME
  profiles:
    active: local

---
# Local profile
spring:
  config:
    activate:
      on-profile: local
  datasource:
    url: jdbc:postgresql://localhost:5432/service_db
    username: postgres
    password: p0stgr3s

---
# Docker profile  
spring:
  config:
    activate:
      on-profile: docker
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

eureka:
  client:
    serviceUrl:
      defaultZone: ${EUREKA_URI}
```

### Security Configuration

**For microservices**:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**", "/swagger-ui/**").permitAll()
                .requestMatchers("/storefront/**").permitAll()
                .requestMatchers("/backoffice/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
            .build();
    }
}
```

**For BFF services**:
```java
@Bean
public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
    return http
        .authorizeExchange(exchanges -> exchanges
            .pathMatchers("/health", "/actuator/**").permitAll()
            .anyExchange().authenticated())
        .oauth2Login(Customizer.withDefaults())
        .csrf(ServerHttpSecurity.CsrfSpec::disable)
        .build();
}
```

## Event-Driven Architecture Guidelines

### Outbox Pattern Implementation

**1. Create service-specific outbox entity**:
```java
@Entity
@Table(name = "booking_outbox")
public class BookingOutboxEvent extends ExtendedOutboxEvent {
    // Inherits all outbox functionality
}
```

**2. Repository**:
```java
public interface BookingOutboxEventRepository 
    extends JpaRepository<BookingOutboxEvent, Long> {
}
```

**3. Publishing events**:
```java
@Service
@Transactional
public class BookingService {
    
    @Autowired
    private OutboxEventPublisher eventPublisher;
    
    public Booking createBooking(CreateBookingRequest request) {
        // 1. Save business entity
        Booking booking = bookingRepository.save(new Booking(request));
        
        // 2. Publish event (atomically via outbox)
        eventPublisher.publishEvent(
            "BookingCreated", 
            "Booking", 
            booking.getId().toString(), 
            booking
        );
        
        return booking;
    }
}
```

### Saga Pattern Implementation

**Saga State Management**:
```java
@Entity
public class BookingSaga extends AbstractAuditEntity {
    private UUID sagaId;
    private UUID bookingId;
    private SagaState currentState;
    private String compensationData; // JSON for rollback
    
    // State transition methods
    public void transitionTo(SagaState newState) {
        this.currentState = newState;
        // Publish state change event
    }
}
```

**Saga Orchestrator**:
```java
@Service
public class BookingSagaService {
    
    public Booking startBookingSaga(Booking booking) {
        // 1. Create saga
        BookingSaga saga = new BookingSaga(booking.getId());
        saga.transitionTo(SagaState.BOOKING_INITIATED);
        
        // 2. Save booking and saga atomically
        Booking savedBooking = bookingRepository.save(booking);
        sagaRepository.save(saga);
        
        // 3. Publish initial event
        publishSagaEvent("BookingSagaStarted", saga, savedBooking);
        
        return savedBooking;
    }
    
    @KafkaListener(topics = "payment-events")
    public void handlePaymentEvent(PaymentEvent event) {
        BookingSaga saga = findSagaByBookingId(event.getBookingId());
        
        switch (event.getEventType()) {
            case "PaymentCompleted":
                saga.transitionTo(SagaState.PAYMENT_COMPLETED);
                completeBooking(saga);
                break;
            case "PaymentFailed":
                saga.transitionTo(SagaState.COMPENSATION_PAYMENT_REFUND);
                startCompensation(saga);
                break;
        }
    }
}
```

### Kafka Event Handling

**Event Listeners**:
```java
@Component
@Slf4j
public class BookingEventListener {
    
    @KafkaListener(
        topics = "flight-events",
        groupId = "booking-service-group"
    )
    public void handleFlightEvent(
        @Payload FlightEvent event,
        @Header Map<String, Object> headers
    ) {
        log.info("Received flight event: {}", event.getEventType());
        
        try {
            switch (event.getEventType()) {
                case "FlightReserved":
                    handleFlightReserved(event);
                    break;
                case "FlightReservationFailed":
                    handleFlightReservationFailed(event);
                    break;
            }
        } catch (Exception e) {
            log.error("Error processing flight event", e);
            // Handle error - could trigger compensation
        }
    }
}
```

### Debezium Configuration

**Connector configuration** (example for booking service):
```json
{
  "name": "booking-outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "p0stgr3s",
    "database.dbname": "booking_db",
    "database.server.name": "booking-db",
    "table.include.list": "public.booking_outbox",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.topic.replacement": "booking-events"
  }
}
```

## Frontend Development Guidelines

### Project Structure
```
storefront-fe/
├── app/                    # Next.js 13+ app directory
├── components/
│   ├── ui/                # Reusable UI components
│   ├── forms/             # Form components
│   └── layout/            # Layout components
├── lib/
│   ├── api/               # API client functions
│   ├── auth/              # Authentication utilities
│   ├── utils/             # Utility functions
│   └── config.ts          # App configuration
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── styles/                # Global styles
```

### API Integration

**Use relative paths for BFF calls**:
```typescript
// lib/api/flights.ts
export const flightApi = {
  search: async (params: FlightSearchParams) => {
    const response = await fetch('/api/flights/storefront/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      credentials: 'include' // Important for auth
    });
    return response.json();
  }
};
```

**Configuration management**:
```typescript
// lib/config.ts
export const APP_CONFIG = {
  API: {
    // Use production domains or local development
    BASE_URL: process.env.NEXT_PUBLIC_BFF_BASE_URL || "https://bookingsmart.huypd.dev",
    TIMEOUT: 30000,
  },
  SERVICES: {
    USE_REAL_DATA: true,
    ENDPOINTS: {
      FLIGHTS: "/api/flights/storefront",
      HOTELS: "/api/hotels/storefront",
      BOOKINGS: "/api/bookings/storefront",
    }
  },
  DOMAINS: {
    STOREFRONT: "bookingsmart.huypd.dev",
    BACKOFFICE: "admin-bookingsmart.huypd.dev",
    IDENTITY: "identity.huypd.dev"
  }
};
```

### Authentication Integration

**Auth context**:
```typescript
// lib/auth-context.tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  
  useEffect(() => {
    AuthService.checkAuthStatus().then(setUser);
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Component Guidelines

**Use TypeScript interfaces**:
```typescript
interface FlightSearchFormProps {
  onSearch: (params: FlightSearchParams) => void;
  loading?: boolean;
}

export const FlightSearchForm: React.FC<FlightSearchFormProps> = ({
  onSearch,
  loading = false
}) => {
  // Component implementation
};
```

**Error handling**:
```typescript
const [error, setError] = useState<string | null>(null);

try {
  const result = await flightApi.search(params);
  setFlights(result.data);
} catch (err) {
  setError(err instanceof Error ? err.message : 'An error occurred');
}
```

## Database Guidelines

### Database Per Service Pattern
Each microservice has its own dedicated PostgreSQL database:
- `flight_db` - Flight service data
- `hotel_db` - Hotel service data
- `booking_db` - Booking service data
- `payment_db` - Payment service data
- `notification_db` - Notification service data
- `keycloak_db` - Identity service data
- `n8n_db` - Workflow automation data

### Migration Strategy
Use Flyway for database migrations:

```sql
-- V1__Create_booking_tables.sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    booking_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Always include outbox table for each service
CREATE TABLE booking_outbox (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    saga_id VARCHAR(36),
    booking_id UUID,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Entity Guidelines

**Base entity structure**:
```java
@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking extends AbstractAuditEntity {

    @Id
    @Column(name = "id")
    private UUID id = UUID.randomUUID();

    @Column(name = "booking_reference", unique = true, nullable = false)
    private String bookingReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    // Use proper validation
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;

    // Relationships
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BookingItem> items = new ArrayList<>();
}
```

### Repository Patterns

**Standard repository**:
```java
@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByUserIdAndStatus(UUID userId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.bookingReference = :ref")
    Optional<Booking> findByBookingReference(@Param("ref") String bookingReference);

    @Modifying
    @Query("UPDATE Booking b SET b.status = :status WHERE b.id = :id")
    int updateBookingStatus(@Param("id") UUID id, @Param("status") BookingStatus status);
}
```

## Security Guidelines

### Authentication Flow
1. **Frontend** → **BFF** (OAuth2 login)
2. **BFF** → **Microservices** (JWT token relay)
3. **Microservices** validate JWT with Keycloak

### Role-Based Access Control

**Keycloak Roles**:
- `CUSTOMER` - Regular users (storefront access)
- `ADMIN` - System administrators (backoffice access)
- `PARTNER` - Hotel/airline partners (limited backoffice access)

**Controller Security**:
```java
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @GetMapping("/storefront/my-bookings")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<BookingDto>> getMyBookings(Authentication auth) {
        String userId = auth.getName();
        // Implementation
    }

    @GetMapping("/backoffice/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        // Implementation
    }
}
```

### JWT Token Handling

**In BFF services**:
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: booking-service
          uri: lb://BOOKING-SERVICE
          predicates:
            - Path=/api/bookings/**
          filters:
            - StripPrefix=1
            - TokenRelay=  # Automatically forwards JWT token
```

**In microservices**:
```java
@Configuration
public class SecurityConfig {

    @Bean
    public JwtDecoder jwtDecoder() {
        return JwtDecoders.fromIssuerLocation("${spring.security.oauth2.resourceserver.jwt.issuer-uri}");
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return authenticationConverter;
    }
}
```

## Testing Guidelines

### Unit Testing

**Service layer testing**:
```java
@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private OutboxEventPublisher eventPublisher;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void shouldCreateBookingAndPublishEvent() {
        // Given
        CreateBookingRequest request = new CreateBookingRequest();
        Booking expectedBooking = new Booking();
        when(bookingRepository.save(any(Booking.class))).thenReturn(expectedBooking);

        // When
        Booking result = bookingService.createBooking(request);

        // Then
        assertThat(result).isEqualTo(expectedBooking);
        verify(eventPublisher).publishEvent(eq("BookingCreated"), any(), any(), any());
    }
}
```

**Repository testing**:
```java
@DataJpaTest
class BookingRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void shouldFindBookingByReference() {
        // Given
        Booking booking = new Booking();
        booking.setBookingReference("BK123456");
        entityManager.persistAndFlush(booking);

        // When
        Optional<Booking> result = bookingRepository.findByBookingReference("BK123456");

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getBookingReference()).isEqualTo("BK123456");
    }
}
```

### Integration Testing

**Kafka integration testing**:
```java
@SpringBootTest
@Testcontainers
class BookingEventIntegrationTest {

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.7.1"));

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Test
    void shouldProcessBookingEvent() {
        // Given
        BookingEvent event = new BookingEvent("BookingCreated", UUID.randomUUID());

        // When
        kafkaTemplate.send("booking-events", event);

        // Then
        // Verify event processing
    }
}
```

### End-to-End Testing

**API testing with TestContainers**:
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class BookingApiIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateBookingSuccessfully() {
        // Given
        CreateBookingRequest request = new CreateBookingRequest();

        // When
        ResponseEntity<BookingResponseDto> response = restTemplate.postForEntity(
            "/api/bookings/storefront", request, BookingResponseDto.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getBookingReference()).isNotNull();
    }
}
```

## Reverse Proxy & Domain Configuration

### Domain Architecture with Cloudflare Tunnel

The application uses a multi-domain architecture with nginx as the reverse proxy, exposed to the internet via **Cloudflare Tunnel**:

**Production Domains** (accessible via internet):
- `bookingsmart.huypd.dev` → Storefront (customer-facing)
- `admin-bookingsmart.huypd.dev` → Backoffice (admin panel)
- `identity.huypd.dev` → Keycloak authentication server

**Cloudflare Tunnel Benefits**:
- ✅ **No port forwarding** required
- ✅ **Automatic SSL/TLS** termination
- ✅ **DDoS protection** and security
- ✅ **Global CDN** for better performance
- ✅ **Zero-trust access** control

### Nginx Configuration

**Domain-based routing** (`nginx.conf`):
```nginx
# Storefront - Customer facing application
server {
    listen 80;
    server_name bookingsmart.huypd.dev;

    location / {
        proxy_pass http://storefront;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backoffice - Admin panel
server {
    listen 80;
    server_name admin-bookingsmart.huypd.dev;

    location / {
        proxy_pass http://backoffice;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Identity Service - Keycloak
server {
    listen 80;
    server_name identity.huypd.dev;
    large_client_header_buffers 8 32k;

    location / {
        proxy_pass http://identity;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Keycloak specific settings
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Additional services (development/monitoring)
server {
    listen 80;
    server_name kafka.huypd.dev;
    location / {
        proxy_pass http://kafka-ui:8080;
    }
}

server {
    listen 80;
    server_name n8n.huypd.dev;
    location / {
        proxy_pass http://n8n:5678;
    }
}
```

### BFF Configuration Updates

**Storefront BFF** (`storefront-bff/src/main/resources/application.yml`):
```yaml
spring:
  security:
    oauth2:
      client:
        provider:
          keycloak:
            # Use production domain
            issuer-uri: https://identity.huypd.dev/realms/BookingSmart
  cloud:
    gateway:
      # Frontend fallback route
      routes:
        - id: frontend-fallback
          uri: http://storefront-fe:3000
          predicates:
            - Path=/**
```

**Backoffice BFF** (`backoffice-bff/src/main/resources/application.yml`):
```yaml
spring:
  security:
    oauth2:
      client:
        provider:
          keycloak:
            # Use production domain
            issuer-uri: https://identity.huypd.dev/realms/BookingSmart
```

### Frontend Configuration Updates

**Storefront Frontend** environment variables:
```bash
NEXT_PUBLIC_API_URL=https://bookingsmart.huypd.dev
NEXT_PUBLIC_KEYCLOAK_URL=https://identity.huypd.dev/realms/BookingSmart
```

**Backoffice Frontend** environment variables:
```bash
NEXT_PUBLIC_API_URL=https://admin-bookingsmart.huypd.dev
NEXT_PUBLIC_KEYCLOAK_URL=https://identity.huypd.dev/realms/BookingSmart
```

### Cloudflare Tunnel Configuration

**No SSL configuration needed in nginx** - Cloudflare handles SSL/TLS termination automatically.

**Cloudflare Tunnel Setup** (already configured):
```yaml
# cloudflared tunnel configuration
tunnel: <your-tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: bookingsmart.huypd.dev
    service: http://localhost:80
    originRequest:
      httpHostHeader: bookingsmart.huypd.dev

  - hostname: admin-bookingsmart.huypd.dev
    service: http://localhost:80
    originRequest:
      httpHostHeader: admin-bookingsmart.huypd.dev

  - hostname: identity.huypd.dev
    service: http://localhost:80
    originRequest:
      httpHostHeader: identity.huypd.dev

  # Catch-all rule
  - service: http_status:404
```

**Benefits of Cloudflare Tunnel**:
- Automatic HTTPS with Cloudflare's SSL certificates
- No need for manual SSL certificate management
- Built-in security features (WAF, DDoS protection)
- Global CDN for improved performance
- Easy domain management through Cloudflare dashboard

## Deployment Guidelines

### Docker Configuration

**Service Dockerfile template**:
```dockerfile
FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom files for dependency caching
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY */pom.xml ./

# Download dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests

# Runtime stage
FROM openjdk:21-jre-slim

WORKDIR /app

COPY --from=0 /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Environment Configuration

**Docker Compose profiles**:
- `auth` - Only authentication services (Keycloak + PostgreSQL)
- `app` - Full application stack
- `dev` - Development tools (PgAdmin)
- `aiAgent` - AI/ML services (Ollama, N8N)

**Environment variables**:
```bash
# Database
DB_URL=jdbc:postgresql://postgres:5432/service_db
DB_USERNAME=postgres
DB_PASSWORD=p0stgr3s

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:29092

# Authentication - Production domains
JWT_ISSUER_URI=https://identity.huypd.dev/realms/BookingSmart
KEYCLOAK_HOST=https://identity.huypd.dev
KEYCLOAK_CLIENT_SECRET_STOREFRONT_BFF=your-secret
KEYCLOAK_CLIENT_SECRET_BACKOFFICE_BFF=your-secret

# For local development, use:
# JWT_ISSUER_URI=http://identity.huypd.dev/realms/BookingSmart
# KEYCLOAK_HOST=http://identity.huypd.dev

# Service Discovery
EUREKA_URI=http://discovery-service:8761/eureka

# Server
SERVER_PORT=80

# Frontend URLs
NEXT_PUBLIC_API_URL_STOREFRONT=https://bookingsmart.huypd.dev
NEXT_PUBLIC_API_URL_BACKOFFICE=https://admin-bookingsmart.huypd.dev
NEXT_PUBLIC_KEYCLOAK_URL=https://identity.huypd.dev/realms/BookingSmart
```

### Production Deployment with Cloudflare Tunnel

**Start production environment**:
```bash
# 1. Start infrastructure services
docker-compose --profile auth up -d

# 2. Wait for services to be healthy, then start application
docker-compose --profile app up -d

# 3. Deploy Debezium connectors (after services are running)
./deploy-debezium-connectors.sh  # Linux/Mac
./deploy-debezium-connectors.ps1 # Windows

# 4. Verify services are accessible via domains
curl https://bookingsmart.huypd.dev/actuator/health
curl https://admin-bookingsmart.huypd.dev/actuator/health
curl https://identity.huypd.dev/realms/BookingSmart
```

**Development environment**:
```bash
# Start with development tools
docker-compose --profile app --profile dev up -d

# Access services locally (add to hosts file first)
# 127.0.0.1 bookingsmart.huypd.dev
# 127.0.0.1 admin-bookingsmart.huypd.dev
# 127.0.0.1 identity.huypd.dev
```

**Payment Gateway Configuration**:
The payment service supports multiple gateways:
```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_SECRET_KEY=sk_live_your_secret_key

# VietQR Configuration (for Vietnamese market)
VIETQR_CLIENT_ID=your_vietqr_client_id
VIETQR_API_KEY=your_vietqr_api_key
BANK_ACCOUNT_NUMBER=your_bank_account
BANK_ACCOUNT_NAME="BOOKING SMART COMPANY"
BANK_CODE=VCB
VIETQR_CALLBACK_SECRET=your_callback_secret
```

### Live Service Access

**Production URLs** (accessible via internet):
- **Storefront**: https://bookingsmart.huypd.dev
- **Backoffice**: https://admin-bookingsmart.huypd.dev
- **Identity**: https://identity.huypd.dev
- **Kafka UI**: https://kafka.huypd.dev (if configured)
- **N8N**: https://n8n.huypd.dev (if configured)

**Health Check Endpoints**:
```bash
# Check all services are running
curl https://bookingsmart.huypd.dev/actuator/health
curl https://admin-bookingsmart.huypd.dev/actuator/health
curl https://identity.huypd.dev/realms/BookingSmart/.well-known/openid_configuration

# Check individual microservices (through BFF)
curl https://bookingsmart.huypd.dev/api/flights/actuator/health
curl https://bookingsmart.huypd.dev/api/hotels/actuator/health
curl https://bookingsmart.huypd.dev/api/bookings/actuator/health
curl https://bookingsmart.huypd.dev/api/payments/actuator/health
```

**Docker health checks**:
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## Monitoring & Observability

### Logging Standards

**Use structured logging**:
```java
@Slf4j
@Service
public class BookingService {

    public Booking createBooking(CreateBookingRequest request) {
        log.info("Creating booking for user: {}, type: {}",
                request.getUserId(), request.getBookingType());

        try {
            Booking booking = processBooking(request);
            log.info("Booking created successfully: {}", booking.getBookingReference());
            return booking;
        } catch (Exception e) {
            log.error("Failed to create booking for user: {}", request.getUserId(), e);
            throw e;
        }
    }
}
```

### Metrics Collection

**Custom metrics**:
```java
@Component
public class BookingMetrics {

    private final Counter bookingCreatedCounter;
    private final Timer bookingProcessingTimer;

    public BookingMetrics(MeterRegistry meterRegistry) {
        this.bookingCreatedCounter = Counter.builder("bookings.created")
            .description("Number of bookings created")
            .register(meterRegistry);

        this.bookingProcessingTimer = Timer.builder("bookings.processing.time")
            .description("Booking processing time")
            .register(meterRegistry);
    }

    public void incrementBookingCreated() {
        bookingCreatedCounter.increment();
    }

    public Timer.Sample startBookingTimer() {
        return Timer.start(bookingProcessingTimer);
    }
}
```

### Available Monitoring Tools

**Production monitoring** (accessible via internet):
- **Kafka UI**: https://kafka.huypd.dev - Monitor Kafka topics and consumers
- **N8N**: https://n8n.huypd.dev - Workflow automation and monitoring
- **Service Health**: All services expose `/actuator/health` and `/actuator/prometheus`

**Development tools** (local access):
- **PgAdmin**: http://localhost:8666 - Database administration (dev profile)
- **Kafka Connect**: http://localhost:8083 - Debezium connector management

**Cloudflare Analytics**:
- **Traffic Analytics**: Monitor domain traffic through Cloudflare dashboard
- **Security Events**: View blocked requests and security threats
- **Performance Metrics**: Page load times and CDN cache hit rates
- **SSL/TLS Monitoring**: Certificate status and encryption analytics

**Planned observability stack** (commented in docker-compose):
- **Grafana**: Dashboards and visualization
- **Loki**: Log aggregation
- **Tempo**: Distributed tracing
- **Elasticsearch**: Search and analytics

### Domain-Specific Development Considerations

**Cross-Origin Resource Sharing (CORS)**:
```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow specific domains
        configuration.setAllowedOrigins(Arrays.asList(
            "https://bookingsmart.huypd.dev",
            "https://admin-bookingsmart.huypd.dev",
            "http://localhost:3000" // For local development
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**Keycloak Client Configuration**:
```json
{
  "clientId": "storefront-bff",
  "name": "Storefront BFF",
  "protocol": "openid-connect",
  "publicClient": false,
  "redirectUris": [
    "https://bookingsmart.huypd.dev/*",
    "http://localhost:3000/*"
  ],
  "webOrigins": [
    "https://bookingsmart.huypd.dev",
    "http://localhost:3000"
  ],
  "attributes": {
    "post.logout.redirect.uris": "https://bookingsmart.huypd.dev/+"
  }
}
```

## Best Practices Summary

### Code Quality
1. **Use common-lib** for shared functionality
2. **Follow naming conventions** consistently
3. **Implement proper error handling** with ResponseUtils
4. **Write comprehensive tests** for all layers
5. **Use TypeScript** for frontend development

### Architecture
1. **Maintain service boundaries** - avoid direct database access between services
2. **Use outbox pattern** for reliable event publishing
3. **Implement saga pattern** for distributed transactions
4. **Follow BFF pattern** for frontend-specific APIs
5. **Use proper authentication** flow through BFF

### Domain & Infrastructure
1. **Use production domains** (`huypd.dev`) for all environments
2. **Configure nginx properly** for domain-based routing
3. **Implement SSL/TLS** for production deployments
4. **Set up proper CORS** for cross-domain requests
5. **Use environment-specific** configuration

### Operations
1. **Use Docker profiles** for different environments
2. **Monitor service health** with actuator endpoints
3. **Implement structured logging** for better observability
4. **Use environment variables** for configuration
5. **Deploy Debezium connectors** after service startup

### Security
1. **Never bypass authentication** in production
2. **Use role-based access control** consistently
3. **Validate all inputs** at API boundaries
4. **Secure sensitive configuration** with environment variables
5. **Implement proper CORS** configuration for frontend
6. **Use HTTPS** for all production domains

This comprehensive guide should help your team develop the BookingSmart platform smoothly and consistently. Remember to update these guidelines as the project evolves and new patterns emerge.
