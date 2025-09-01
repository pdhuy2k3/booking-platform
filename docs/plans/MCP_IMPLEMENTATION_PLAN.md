# MCP Server Implementation Plan for BookingSmart Services

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Service-Specific MCP Capabilities](#service-specific-mcp-capabilities)
4. [Implementation Phases](#implementation-phases)
5. [Technical Configuration](#technical-configuration)
6. [Security Integration](#security-integration)
7. [Common Library Enhancements](#common-library-enhancements)
8. [Monitoring & Observability](#monitoring--observability)
9. [Development Workflow](#development-workflow)
10. [Success Criteria](#success-criteria)
11. [Timeline](#timeline)

## 📋 Overview

This document outlines the comprehensive plan to implement MCP (Model Context Protocol) servers across all BookingSmart microservices using Spring AI. The implementation will enable AI assistants to interact with the booking platform through a standardized protocol while maintaining the existing event-driven saga architecture.

### Key Benefits
- **Standardized AI Integration**: Common protocol for AI tool access across all services
- **Enhanced Developer Experience**: AI assistants can discover and interact with booking platform capabilities
- **Maintained Architecture**: Respects existing event-driven patterns and saga orchestration
- **Scalable Solution**: Works with current microservice deployment model
- **Secure Integration**: Leverages existing OAuth2/JWT authentication

### Technology Stack Integration
- **Spring Boot**: 3.5.5 (current version)
- **Java**: 21 with Virtual Threads
- **Spring AI**: 1.0.0-SNAPSHOT
- **Transport**: WebMVC Streamable-HTTP
- **Security**: Keycloak OAuth2/JWT
- **Deployment**: Docker containers on port 80

## 🏗️ Architecture Decisions

### MCP Transport Selection: WebMVC Streamable-HTTP

**Selected**: `spring-ai-starter-mcp-server-webmvc` with Streamable-HTTP protocol

**Rationale**:
- ✅ All services already use Spring MVC (`spring-boot-starter-web`)
- ✅ Streamable-HTTP supports persistent connections and real-time notifications
- ✅ HTTP-based transport works well in containerized environments
- ✅ Can expose endpoints alongside existing REST APIs
- ✅ Supports both synchronous operations and change notifications

### Configuration Standards
```yaml
Protocol: STREAMABLE
Server Type: SYNC (matches current synchronous service architecture)
Endpoint: /api/v1/mcp (follows existing API versioning)
Port: 80 (consistent with current deployment)
Capabilities: tools, resources, prompts, completions (all enabled)
Change Notifications: enabled for dynamic updates
```

### Security Model
- **Authentication**: OAuth2/JWT via Keycloak (existing system)
- **Authorization**: Role-based access control per service domain
- **Audit Logging**: All MCP tool invocations logged
- **Rate Limiting**: Protection against abuse

## 📦 Service-Specific MCP Capabilities

### 🎯 booking-service (Saga Orchestrator)

**Primary Role**: Central orchestrator for booking workflows

**MCP Tools**:
- `createBookingSaga(bookingRequest)` - Initiate new booking workflow
- `cancelBookingSaga(bookingId)` - Cancel existing booking with compensation
- `retryFailedBooking(sagaId)` - Retry failed saga steps
- `getBookingStatus(bookingId)` - Query current booking and saga state
- `getActiveSagas()` - List all active saga instances
- `compensateBooking(bookingId, reason)` - Manual compensation trigger

**MCP Resources**:
- `saga-states` - Active saga states and transitions
- `booking-history` - Historical booking data and patterns
- `compensation-logs` - Compensation transaction records
- `booking-templates` - Predefined booking configurations
- `saga-metrics` - Performance and success rate metrics

**MCP Prompts**:
- `booking-confirmation` - Booking confirmation message templates
- `error-handling` - Error recovery and user communication prompts
- `saga-troubleshooting` - Debugging assistance prompts

**Integration Notes**:
- Tools trigger saga workflows through existing orchestrator
- Resources expose saga state for monitoring and debugging
- Change notifications on saga state transitions

### ✈️ flight-service

**Primary Role**: Flight inventory and reservation management

**MCP Tools**:
- `searchAvailableFlights(origin, destination, date, passengers)` - Search flight inventory
- `getFlightDetails(flightId)` - Detailed flight information
- `reserveFlight(flightId, seatCount, holdTime)` - Reserve seats with Redis locking
- `releaseFlight(reservationId)` - Release reserved seats
- `checkSeatAvailability(flightId, seatClass)` - Real-time availability check
- `getFlightStatus(flightId)` - Current flight operational status
- `blockInventory(flightId, seatCount, reason)` - Administrative seat blocking

**MCP Resources**:
- `flight-schedules` - Flight timetables and routes
- `seat-maps` - Aircraft configurations and seat layouts
- `pricing-data` - Current pricing and fare rules
- `airport-data` - Airport codes, names, and information
- `aircraft-info` - Fleet information and specifications
- `availability-cache` - Real-time inventory status

**MCP Prompts**:
- `flight-search` - Flight search assistance templates
- `booking-confirmation` - Flight booking confirmation messages
- `schedule-change` - Flight schedule change notifications

**Integration Notes**:
- Tools integrate with Redis distributed locking for inventory
- Resources provide real-time data for search and booking
- Change notifications on inventory updates

### 🏨 hotel-service

**Primary Role**: Hotel inventory and room reservation management

**MCP Tools**:
- `searchHotels(location, checkIn, checkOut, rooms, guests)` - Hotel availability search
- `getHotelDetails(hotelId)` - Comprehensive hotel information
- `reserveRoom(hotelId, roomType, checkIn, checkOut)` - Room reservation with locking
- `releaseRoom(reservationId)` - Cancel room reservations
- `checkRoomAvailability(hotelId, roomType, dates)` - Real-time availability
- `getHotelAmenities(hotelId)` - Hotel facilities and services
- `getRoomTypes(hotelId)` - Available room categories

**MCP Resources**:
- `hotel-catalog` - Hotel directory and basic information
- `room-inventory` - Real-time room availability
- `amenities-data` - Hotel facilities and service information
- `pricing-calendar` - Dynamic pricing by date and season
- `guest-reviews` - Hotel ratings and guest feedback
- `location-data` - Geographic and area information

**MCP Prompts**:
- `hotel-recommendations` - Personalized hotel suggestion templates
- `booking-templates` - Standard booking confirmation formats
- `amenity-descriptions` - Facility and service descriptions

**Integration Notes**:
- Tools handle inventory management with Redis locks
- Resources support dynamic pricing and availability
- Change notifications on inventory and pricing updates

### 💳 payment-service

**Primary Role**: Payment processing and financial transaction management

**MCP Tools**:
- `authorizePayment(amount, currency, paymentMethod)` - Payment authorization
- `capturePayment(authorizationId, amount)` - Charge capture
- `refundPayment(transactionId, amount, reason)` - Process refunds
- `validatePaymentMethod(paymentData)` - Payment method validation
- `getPaymentStatus(transactionId)` - Transaction status inquiry
- `processPartialRefund(transactionId, amount)` - Partial refund processing
- `voidAuthorization(authorizationId)` - Cancel authorization

**MCP Resources**:
- `transaction-history` - Payment transaction logs
- `payment-methods` - Supported payment options
- `gateway-configs` - Payment gateway configurations
- `fraud-rules` - Fraud detection and prevention rules
- `reconciliation-reports` - Financial reconciliation data
- `payment-analytics` - Transaction metrics and trends

**MCP Prompts**:
- `payment-confirmation` - Payment success confirmation templates
- `failure-handling` - Payment failure communication prompts
- `refund-notifications` - Refund processing notifications

**Security Considerations**:
- Enhanced security for payment tools
- PCI DSS compliance requirements
- Comprehensive audit logging
- Encrypted sensitive data handling

### 👤 customer-service

**Primary Role**: Customer profile and relationship management

**MCP Tools**:
- `createCustomer(customerData)` - Customer registration
- `updateProfile(customerId, updates)` - Profile management
- `getCustomerDetails(customerId)` - Customer information retrieval
- `searchCustomers(criteria)` - Customer search and lookup
- `getBookingHistory(customerId)` - Customer booking history
- `updatePreferences(customerId, preferences)` - Customer preferences
- `manageLoyaltyPoints(customerId, operation, points)` - Loyalty program management

**MCP Resources**:
- `customer-profiles` - Customer demographic and contact information
- `preferences-data` - Customer preferences and settings
- `loyalty-program` - Loyalty points and tier information
- `communication-history` - Customer interaction logs
- `segmentation-data` - Customer segments and classifications
- `gdpr-compliance` - Data privacy and consent records

**MCP Prompts**:
- `welcome-messages` - New customer onboarding templates
- `profile-update` - Profile change confirmation prompts
- `loyalty-notifications` - Loyalty program communications

**Integration Notes**:
- GDPR compliance for data access tools
- Integration with notification service for communications
- Privacy controls for sensitive data access

### 📬 notification-service

**Primary Role**: Multi-channel communication and messaging

**MCP Tools**:
- `sendNotification(type, recipient, content, channel)` - Message dispatch
- `getNotificationHistory(customerId, filters)` - Delivery history
- `updateNotificationPreferences(customerId, preferences)` - User communication preferences
- `sendBulkNotification(recipients, content, channel)` - Bulk messaging
- `scheduleNotification(notification, scheduleTime)` - Scheduled messaging
- `getDeliveryStatus(notificationId)` - Delivery status tracking
- `cancelScheduledNotification(notificationId)` - Cancel pending notifications

**MCP Resources**:
- `message-templates` - Pre-defined message templates
- `delivery-channels` - Available communication channels
- `delivery-status` - Message delivery tracking
- `preferences-matrix` - Customer communication preferences
- `notification-analytics` - Messaging performance metrics
- `channel-configs` - Communication channel configurations

**MCP Prompts**:
- `notification-templates` - Various message format templates
- `alert-messages` - System alert and warning prompts
- `promotional-content` - Marketing communication templates

**Integration Notes**:
- Multi-channel support (email, SMS, push, in-app)
- Real-time delivery status tracking
- Integration with customer preferences

### 🚌 transport-service (Future)

**Primary Role**: Ground transportation booking and management

**MCP Tools**:
- `searchTransportOptions(origin, destination, date, passengers)` - Transport search
- `bookTransportation(optionId, passengers)` - Transportation booking
- `getTransportDetails(bookingId)` - Transportation booking details
- `cancelTransportation(bookingId)` - Cancel transportation booking

**MCP Resources**:
- `transport-providers` - Available transportation providers
- `route-data` - Transportation routes and schedules
- `pricing-info` - Transportation pricing information

### 🌐 storefront-bff & backoffice-bff

**Primary Role**: API gateway and MCP aggregation

**MCP Tools**:
- `discoverServices()` - List available MCP-enabled services
- `aggregateBookingFlow(bookingRequest)` - End-to-end booking orchestration
- `getSystemHealth()` - Overall system status
- `executeWorkflow(workflowId, parameters)` - Custom workflow execution

**MCP Resources**:
- `service-directory` - Available services and capabilities
- `api-documentation` - Service API documentation
- `system-metrics` - Aggregated system performance metrics
- `user-sessions` - Active user session information

**Integration Notes**:
- Aggregate MCP capabilities from multiple services
- Provide unified interface for AI assistants
- Handle cross-service orchestration

### 🔍 discovery-service

**Primary Role**: Service registry and MCP endpoint discovery

**MCP Tools**:
- `registerMcpEndpoint(serviceId, endpoint, capabilities)` - Register MCP endpoint
- `discoverMcpServices()` - List all MCP-enabled services
- `getServiceHealth(serviceId)` - Service health status
- `updateServiceCapabilities(serviceId, capabilities)` - Update service capabilities

**MCP Resources**:
- `service-registry` - Complete service directory
- `mcp-endpoints` - MCP-specific endpoint registry
- `health-status` - Service health and availability
- `load-balancing` - Service instance load distribution

## 🔧 Implementation Phases

### Phase 1: Foundation Setup (Weeks 1-2)

#### Goals
- Establish MCP foundation in common-lib
- Update project dependencies
- Create base configuration and security integration

#### Tasks

1. **Update Parent POM Dependencies**
```xml
<properties>
    <spring-ai.version>1.0.0-SNAPSHOT</spring-ai.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>${spring-ai.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

2. **Common-lib MCP Foundation**
   - Create `com.pdh.common.mcp` package
   - Implement base MCP configuration classes
   - Add security integration for MCP endpoints
   - Create abstract tool and resource classes

3. **Development Environment Setup**
   - Update IDE configurations for Spring AI
   - Set up MCP client testing tools
   - Create development profiles for MCP

#### Deliverables
- [ ] Updated parent POM with Spring AI dependencies
- [ ] MCP base classes in common-lib
- [ ] Security configuration for MCP endpoints
- [ ] Development environment setup
- [ ] Initial documentation

### Phase 2: Core Services Implementation (Weeks 3-4)

#### Goals
- Implement MCP servers in core domain services
- Establish service-to-service MCP communication patterns
- Validate saga integration with MCP

#### Tasks

1. **booking-service MCP Implementation**
   - Add MCP server dependency
   - Implement saga-related tools
   - Expose booking resources
   - Create booking prompts

2. **flight-service MCP Implementation**
   - Implement flight search and reservation tools
   - Expose flight inventory resources
   - Add Redis integration for seat locking
   - Create flight-related prompts

3. **hotel-service MCP Implementation**
   - Implement hotel search and reservation tools
   - Expose hotel inventory resources
   - Add Redis integration for room locking
   - Create hotel-related prompts

4. **Integration Testing**
   - Test MCP tool invocations
   - Validate saga workflow integration
   - Test change notifications
   - Performance baseline testing

#### Deliverables
- [ ] MCP server in booking-service
- [ ] MCP server in flight-service
- [ ] MCP server in hotel-service
- [ ] Integration test suite
- [ ] Performance benchmarks

### Phase 3: Supporting Services (Weeks 5-6)

#### Goals
- Complete MCP implementation for supporting services
- Ensure end-to-end booking workflow support
- Integrate notification and customer management

#### Tasks

1. **payment-service MCP Implementation**
   - Implement payment processing tools
   - Expose transaction resources
   - Enhanced security for payment operations
   - Payment-related prompts

2. **customer-service MCP Implementation**
   - Implement customer management tools
   - Expose customer data resources (GDPR compliant)
   - Customer communication prompts
   - Loyalty program integration

3. **notification-service MCP Implementation**
   - Implement notification dispatch tools
   - Expose template and channel resources
   - Communication preference management
   - Multi-channel notification support

4. **End-to-End Testing**
   - Complete booking workflow testing
   - Cross-service MCP communication
   - Error handling and recovery
   - Security and compliance validation

#### Deliverables
- [ ] MCP server in payment-service
- [ ] MCP server in customer-service
- [ ] MCP server in notification-service
- [ ] End-to-end test scenarios
- [ ] Security audit results

### Phase 4: BFF and Discovery Services (Weeks 7-8)

#### Goals
- Implement MCP aggregation in BFF services
- Update service discovery for MCP endpoints
- Complete system integration and optimization

#### Tasks

1. **BFF Services MCP Implementation**
   - Implement MCP aggregation in storefront-bff
   - Implement MCP aggregation in backoffice-bff
   - Cross-service orchestration tools
   - Unified AI assistant interface

2. **discovery-service MCP Integration**
   - Register MCP endpoints automatically
   - Provide MCP service discovery
   - Health monitoring for MCP endpoints
   - Load balancing support

3. **System Optimization**
   - Performance tuning and optimization
   - Memory and CPU usage optimization
   - Connection pooling and management
   - Caching strategy implementation

4. **Documentation and Deployment**
   - Complete API documentation
   - Deployment guides and runbooks
   - Monitoring and alerting setup
   - Training materials

#### Deliverables
- [ ] MCP aggregation in BFF services
- [ ] Enhanced discovery service
- [ ] Performance optimization
- [ ] Complete documentation
- [ ] Production deployment guide

## 📋 Technical Configuration

### Maven Dependencies

#### Parent POM Updates
```xml
<properties>
    <spring-ai.version>1.0.0-SNAPSHOT</spring-ai.version>
    <mcp-java-sdk.version>0.9.0</mcp-java-sdk.version>
</properties>

<dependencyManagement>
    <dependencies>
        <!-- Spring AI BOM -->
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>${spring-ai.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

#### Service-Level Dependencies
```xml
<dependencies>
    <!-- MCP Server WebMVC Starter -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
    </dependency>
    
    <!-- Common Lib (updated with MCP support) -->
    <dependency>
        <groupId>com.pdh</groupId>
        <artifactId>common-lib</artifactId>
        <version>${revision}</version>
    </dependency>
</dependencies>
```

### Application Configuration

#### Standard MCP Configuration (`application.yml`)
```yaml
spring:
  ai:
    mcp:
      server:
        enabled: true
        protocol: STREAMABLE
        name: ${spring.application.name}-mcp-server
        version: ${project.version}
        type: SYNC
        instructions: "BookingSmart ${spring.application.name} MCP server providing domain-specific tools and resources"
        
        # Capabilities
        capabilities:
          tool: true
          resource: true
          prompt: true
          completion: true
        
        # Change Notifications
        resource-change-notification: true
        tool-change-notification: true
        prompt-change-notification: true
        
        # Streamable HTTP Configuration
        streamable-http:
          mcp-endpoint: /api/v1/mcp
          keep-alive-interval: 30s
          disallow-delete: false
        
        # Security Integration
        tool-response-mime-type:
          getFlightDetails: application/json
          searchHotels: application/json
          processPayment: application/json
        
        # Request Timeout
        request-timeout: 30s

# Security Configuration for MCP endpoints
management:
  endpoints:
    web:
      exposure:
        include: "health,info,metrics,mcp"
  endpoint:
    mcp:
      enabled: true

# Custom MCP Properties
bookingsmart:
  mcp:
    security:
      required-roles: 
        - "ROLE_USER"
        - "ROLE_ADMIN"
      audit-logging: true
    monitoring:
      metrics-enabled: true
      tracing-enabled: true
```

#### Environment-Specific Overrides

**Local Development (`application-local.yml`)**
```yaml
spring:
  ai:
    mcp:
      server:
        protocol: STDIO  # Easier for local debugging
        streamable-http:
          keep-alive-interval: 10s

bookingsmart:
  mcp:
    security:
      required-roles: []  # No security for local dev
```

**Docker/Production (`application-docker.yml`)**
```yaml
spring:
  ai:
    mcp:
      server:
        streamable-http:
          keep-alive-interval: 60s

bookingsmart:
  mcp:
    security:
      audit-logging: true
    monitoring:
      metrics-enabled: true
```

### Docker Configuration Updates

#### Service Dockerfile Updates
```dockerfile
# Add MCP health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/actuator/health || \
      curl -f http://localhost:80/api/v1/mcp/health || exit 1
```

#### Docker Compose Updates
```yaml
services:
  booking-service:
    build: ./booking-service
    ports:
      - "80"
    environment:
      - SERVER_PORT=80
      - SPRING_PROFILES_ACTIVE=docker
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/api/v1/mcp/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "mcp.enabled=true"
      - "mcp.endpoint=/api/v1/mcp"
      - "mcp.capabilities=tools,resources,prompts"
```

#### Nginx Configuration Updates
```nginx
# MCP endpoint routing
location /api/v1/mcp {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # MCP-specific headers
    proxy_set_header MCP-Version "1.0";
    proxy_buffering off;
    proxy_cache off;
}

# MCP service discovery
location /mcp/discovery {
    proxy_pass http://discovery-service/api/v1/mcp/discovery;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

## 🔒 Security Integration

### OAuth2/JWT Integration

#### MCP Security Configuration
```java
@Configuration
@EnableWebSecurity
public class McpSecurityConfig {

    @Bean
    public SecurityFilterChain mcpSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/api/v1/mcp/**")
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/v1/mcp/health").permitAll()
                .requestMatchers("/api/v1/mcp/**").hasAnyRole("USER", "ADMIN", "MCP_CLIENT")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwtAuthenticationConverter(mcpJwtAuthenticationConverter())))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        
        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter mcpJwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter authoritiesConverter = 
            new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        return converter;
    }
}
```

#### Role-Based Access Control
```java
@Component
public class McpAuthorizationService {

    public boolean canAccessTool(String toolName, Authentication auth) {
        return switch (toolName) {
            case "processPayment", "refundPayment" -> 
                hasRole(auth, "PAYMENT_ADMIN");
            case "createBookingSaga", "cancelBookingSaga" -> 
                hasRole(auth, "BOOKING_ADMIN", "USER");
            case "searchFlights", "searchHotels" -> 
                hasRole(auth, "USER", "GUEST");
            default -> hasRole(auth, "USER");
        };
    }

    private boolean hasRole(Authentication auth, String... roles) {
        return Arrays.stream(roles)
            .anyMatch(role -> auth.getAuthorities().stream()
                .anyMatch(grantedAuth -> 
                    grantedAuth.getAuthority().equals("ROLE_" + role)));
    }
}
```

### Audit Logging

#### MCP Audit Configuration
```java
@Component
public class McpAuditLogger {

    private static final Logger auditLog = 
        LoggerFactory.getLogger("MCP_AUDIT");

    @EventListener
    public void onToolInvocation(McpToolInvocationEvent event) {
        auditLog.info("MCP Tool Invoked: tool={}, user={}, params={}, result={}, duration={}ms",
            event.getToolName(),
            event.getUserId(),
            maskSensitiveData(event.getParameters()),
            event.isSuccessful() ? "SUCCESS" : "FAILURE",
            event.getDurationMs());
    }

    @EventListener
    public void onResourceAccess(McpResourceAccessEvent event) {
        auditLog.info("MCP Resource Accessed: resource={}, user={}, operation={}",
            event.getResourceName(),
            event.getUserId(),
            event.getOperation());
    }

    private String maskSensitiveData(String data) {
        // Mask payment information, personal data, etc.
        return data.replaceAll("\"cardNumber\":\"\\d+\"", "\"cardNumber\":\"****\"")
                  .replaceAll("\"ssn\":\"\\d+\"", "\"ssn\":\"***-**-****\"");
    }
}
```

### Rate Limiting

#### MCP Rate Limiting Configuration
```java
@Configuration
public class McpRateLimitingConfig {

    @Bean
    public RedisTemplate<String, String> mcpRedisTemplate() {
        // Redis template for rate limiting
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(jedisConnectionFactory());
        return template;
    }

    @Bean
    public RateLimitingService mcpRateLimitingService() {
        return new RateLimitingService(mcpRedisTemplate());
    }
}

@Component
public class McpRateLimitingInterceptor implements HandlerInterceptor {

    @Autowired
    private RateLimitingService rateLimitingService;

    @Override
    public boolean preHandle(HttpServletRequest request, 
                           HttpServletResponse response, 
                           Object handler) throws Exception {
        
        String userId = extractUserId(request);
        String toolName = extractToolName(request);
        
        if (!rateLimitingService.isAllowed(userId, toolName)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("{\"error\":\"Rate limit exceeded\"}");
            return false;
        }
        
        return true;
    }
}
```

## 📚 Common Library Enhancements

### MCP Base Classes Structure

```
common-lib/
├── src/main/java/com/pdh/common/mcp/
│   ├── config/
│   │   ├── McpAutoConfiguration.java
│   │   ├── McpSecurityConfig.java
│   │   └── McpProperties.java
│   ├── tools/
│   │   ├── BaseToolCallback.java
│   │   ├── SagaAwareToolCallback.java
│   │   └── ToolCallbackRegistry.java
│   ├── resources/
│   │   ├── BaseMcpResourceProvider.java
│   │   ├── CacheableMcpResource.java
│   │   └── ResourceChangeNotifier.java
│   ├── prompts/
│   │   ├── McpPromptTemplateProvider.java
│   │   ├── DynamicPromptGenerator.java
│   │   └── PromptTemplateRepository.java
│   ├── saga/
│   │   ├── SagaMcpToolProvider.java
│   │   ├── SagaStateResourceProvider.java
│   │   └── SagaEventNotificationHandler.java
│   ├── security/
│   │   ├── McpAuthorizationService.java
│   │   ├── McpAuditLogger.java
│   │   └── RateLimitingService.java
│   ├── monitoring/
│   │   ├── McpMetricsCollector.java
│   │   ├── McpHealthIndicator.java
│   │   └── McpTraceabilityService.java
│   └── utils/
│       ├── McpJsonConverter.java
│       ├── McpValidationUtils.java
│       └── McpExceptionHandler.java
```

### Key Base Classes Implementation

#### McpAutoConfiguration.java
```java
@Configuration
@EnableConfigurationProperties(McpProperties.class)
@ConditionalOnProperty(name = "spring.ai.mcp.server.enabled", havingValue = "true")
public class McpAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public McpSecurityConfig mcpSecurityConfig() {
        return new McpSecurityConfig();
    }

    @Bean
    @ConditionalOnMissingBean
    public McpAuditLogger mcpAuditLogger() {
        return new McpAuditLogger();
    }

    @Bean
    @ConditionalOnMissingBean
    public McpMetricsCollector mcpMetricsCollector(MeterRegistry meterRegistry) {
        return new McpMetricsCollector(meterRegistry);
    }

    @Bean
    @ConditionalOnMissingBean
    public ToolCallbackRegistry toolCallbackRegistry() {
        return new ToolCallbackRegistry();
    }

    @Bean
    @ConditionalOnMissingBean
    public ResourceChangeNotifier resourceChangeNotifier() {
        return new ResourceChangeNotifier();
    }
}
```

#### BaseToolCallback.java
```java
public abstract class BaseToolCallback implements ToolCallback {
    
    protected final Logger logger = LoggerFactory.getLogger(getClass());
    
    @Autowired
    protected McpAuditLogger auditLogger;
    
    @Autowired
    protected McpMetricsCollector metricsCollector;
    
    @Override
    public final String call(String functionArguments) {
        long startTime = System.currentTimeMillis();
        String toolName = getToolDefinition().getName();
        
        try {
            validateInput(functionArguments);
            String result = executeInternal(functionArguments);
            
            long duration = System.currentTimeMillis() - startTime;
            metricsCollector.recordToolInvocation(toolName, duration, true);
            auditLogger.logToolInvocation(toolName, functionArguments, result, duration);
            
            return result;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            metricsCollector.recordToolInvocation(toolName, duration, false);
            auditLogger.logToolError(toolName, functionArguments, e, duration);
            throw new McpToolException("Tool execution failed: " + toolName, e);
        }
    }
    
    protected abstract String executeInternal(String functionArguments);
    
    protected void validateInput(String functionArguments) {
        if (functionArguments == null || functionArguments.trim().isEmpty()) {
            throw new IllegalArgumentException("Function arguments cannot be null or empty");
        }
    }
}
```

#### SagaAwareToolCallback.java
```java
public abstract class SagaAwareToolCallback extends BaseToolCallback {
    
    @Autowired
    protected SagaEventPublisher sagaEventPublisher;
    
    @Autowired
    protected SagaStateRepository sagaStateRepository;
    
    protected void publishSagaEvent(String sagaId, String eventType, Object eventData) {
        SagaEvent event = SagaEvent.builder()
            .sagaId(sagaId)
            .eventType(eventType)
            .eventData(eventData)
            .timestamp(Instant.now())
            .build();
            
        sagaEventPublisher.publish(event);
    }
    
    protected Optional<SagaState> getSagaState(String sagaId) {
        return sagaStateRepository.findById(sagaId);
    }
    
    protected void updateSagaState(String sagaId, SagaState.Status status, String details) {
        sagaStateRepository.updateStatus(sagaId, status, details);
    }
}
```

#### BaseMcpResourceProvider.java
```java
public abstract class BaseMcpResourceProvider {
    
    protected final Logger logger = LoggerFactory.getLogger(getClass());
    
    @Autowired
    protected ResourceChangeNotifier changeNotifier;
    
    @Autowired
    protected McpMetricsCollector metricsCollector;
    
    public final McpSchema.ReadResourceResult readResource(String uri) {
        long startTime = System.currentTimeMillis();
        
        try {
            validateUri(uri);
            McpSchema.ReadResourceResult result = readResourceInternal(uri);
            
            long duration = System.currentTimeMillis() - startTime;
            metricsCollector.recordResourceAccess(getResourceType(), duration, true);
            
            return result;
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            metricsCollector.recordResourceAccess(getResourceType(), duration, false);
            throw new McpResourceException("Resource access failed: " + uri, e);
        }
    }
    
    protected abstract McpSchema.ReadResourceResult readResourceInternal(String uri);
    
    protected abstract String getResourceType();
    
    protected void validateUri(String uri) {
        if (uri == null || uri.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource URI cannot be null or empty");
        }
    }
    
    protected void notifyResourceChange(String uri, String changeType) {
        changeNotifier.notifyResourceChange(uri, changeType, getResourceType());
    }
}
```

#### McpProperties.java
```java
@ConfigurationProperties(prefix = "bookingsmart.mcp")
@Data
public class McpProperties {
    
    private Security security = new Security();
    private Monitoring monitoring = new Monitoring();
    private Cache cache = new Cache();
    
    @Data
    public static class Security {
        private List<String> requiredRoles = List.of("ROLE_USER");
        private boolean auditLogging = true;
        private boolean rateLimiting = true;
        private int maxRequestsPerMinute = 100;
    }
    
    @Data
    public static class Monitoring {
        private boolean metricsEnabled = true;
        private boolean tracingEnabled = true;
        private boolean healthChecksEnabled = true;
    }
    
    @Data
    public static class Cache {
        private boolean enabled = true;
        private Duration ttl = Duration.ofMinutes(5);
        private int maxSize = 1000;
    }
}
```

## 📊 Monitoring & Observability

### MCP-Specific Metrics

#### McpMetricsCollector.java
```java
@Component
public class McpMetricsCollector {
    
    private final MeterRegistry meterRegistry;
    private final Counter toolInvocations;
    private final Timer toolExecutionTime;
    private final Counter resourceAccess;
    private final Gauge activeConnections;
    
    public McpMetricsCollector(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        
        this.toolInvocations = Counter.builder("mcp.tool.invocations")
            .description("Total MCP tool invocations")
            .tag("service", getServiceName())
            .register(meterRegistry);
            
        this.toolExecutionTime = Timer.builder("mcp.tool.execution.time")
            .description("MCP tool execution time")
            .tag("service", getServiceName())
            .register(meterRegistry);
            
        this.resourceAccess = Counter.builder("mcp.resource.access")
            .description("Total MCP resource access")
            .tag("service", getServiceName())
            .register(meterRegistry);
            
        this.activeConnections = Gauge.builder("mcp.connections.active")
            .description("Active MCP connections")
            .tag("service", getServiceName())
            .register(meterRegistry, this, McpMetricsCollector::getActiveConnectionsCount);
    }
    
    public void recordToolInvocation(String toolName, long durationMs, boolean success) {
        toolInvocations.increment(
            Tags.of(
                Tag.of("tool", toolName),
                Tag.of("status", success ? "success" : "failure")
            )
        );
        
        toolExecutionTime.record(Duration.ofMillis(durationMs), 
            Tags.of(Tag.of("tool", toolName)));
    }
    
    public void recordResourceAccess(String resourceType, long durationMs, boolean success) {
        resourceAccess.increment(
            Tags.of(
                Tag.of("type", resourceType),
                Tag.of("status", success ? "success" : "failure")
            )
        );
    }
    
    private double getActiveConnectionsCount() {
        // Implementation to count active MCP connections
        return 0.0; // Placeholder
    }
}
```

### Health Checks

#### McpHealthIndicator.java
```java
@Component
public class McpHealthIndicator implements HealthIndicator {
    
    @Autowired
    private McpServerConnectionManager connectionManager;
    
    @Override
    public Health health() {
        try {
            int activeConnections = connectionManager.getActiveConnectionsCount();
            boolean isHealthy = connectionManager.isHealthy();
            
            Health.Builder builder = isHealthy ? Health.up() : Health.down();
            
            return builder
                .withDetail("activeConnections", activeConnections)
                .withDetail("maxConnections", connectionManager.getMaxConnections())
                .withDetail("serverStatus", connectionManager.getServerStatus())
                .withDetail("lastHealthCheck", Instant.now())
                .build();
                
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .withException(e)
                .build();
        }
    }
}
```

### Logging Configuration

#### MCP-Specific Logging
```yaml
# logback-spring.xml additions
logging:
  level:
    com.pdh.common.mcp: DEBUG
    org.springframework.ai.mcp: INFO
    io.modelcontextprotocol: INFO
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} [%X{sagaId}] [%X{mcpSession}] - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} [%X{sagaId}] [%X{mcpSession}] - %msg%n"

# Custom appender for MCP audit logs
appender:
  mcp-audit:
    type: RollingFile
    fileName: logs/mcp-audit.log
    filePattern: logs/mcp-audit-%d{yyyy-MM-dd}-%i.log.gz
    pattern: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%X{userId}] [%X{mcpSession}] %msg%n"
    maxFileSize: 100MB
    maxHistory: 30
```

### Distributed Tracing

#### MCP Tracing Integration
```java
@Component
public class McpTraceabilityService {
    
    private final Tracer tracer;
    
    public McpTraceabilityService(Tracer tracer) {
        this.tracer = tracer;
    }
    
    public Span startToolSpan(String toolName, String parameters) {
        return tracer.nextSpan()
            .name("mcp-tool-" + toolName)
            .tag("mcp.tool.name", toolName)
            .tag("mcp.tool.parameters", sanitizeParameters(parameters))
            .start();
    }
    
    public Span startResourceSpan(String resourceType, String uri) {
        return tracer.nextSpan()
            .name("mcp-resource-" + resourceType)
            .tag("mcp.resource.type", resourceType)
            .tag("mcp.resource.uri", uri)
            .start();
    }
    
    private String sanitizeParameters(String parameters) {
        // Remove sensitive data from trace
        return parameters.replaceAll("\"password\":\"[^\"]*\"", "\"password\":\"***\"");
    }
}
```

## 🔄 Development Workflow

### Local Development Setup

#### MCP Development Profile
```yaml
# application-dev.yml
spring:
  ai:
    mcp:
      server:
        protocol: STDIO  # Easier for local debugging
        type: SYNC
        capabilities:
          tool: true
          resource: true
          prompt: true
          completion: true

bookingsmart:
  mcp:
    security:
      required-roles: []  # No security for local dev
      audit-logging: false
    cache:
      enabled: false  # Disable caching for development
```

#### MCP Testing Tools

**MCP Client Test Utility**
```java
@TestComponent
public class McpTestClient {
    
    public void testToolInvocation(String serviceName, String toolName, String parameters) {
        // Implementation for testing MCP tools
    }
    
    public void testResourceAccess(String serviceName, String resourceUri) {
        // Implementation for testing MCP resources
    }
    
    public void subscribeToNotifications(String serviceName, Consumer<String> handler) {
        // Implementation for testing change notifications
    }
}
```

### Build and Deployment Updates

#### Maven Build Enhancements
```xml
<build>
    <plugins>
        <!-- Spring AI MCP Plugin for code generation -->
        <plugin>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-mcp-maven-plugin</artifactId>
            <version>${spring-ai.version}</version>
            <executions>
                <execution>
                    <goals>
                        <goal>generate-mcp-specs</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        
        <!-- Enhanced testing for MCP -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-failsafe-plugin</artifactId>
            <configuration>
                <includes>
                    <include>**/*McpIT.java</include>
                    <include>**/*McpIntegrationTest.java</include>
                </includes>
            </configuration>
        </plugin>
    </plugins>
</build>
```

#### Docker Build Updates
```dockerfile
# Add MCP testing and monitoring tools
FROM eclipse-temurin:21-jre-alpine

# Add MCP health check script
COPY scripts/mcp-health-check.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/mcp-health-check.sh

# MCP-specific environment variables
ENV MCP_SERVER_ENABLED=true
ENV MCP_PROTOCOL=STREAMABLE
ENV MCP_ENDPOINT=/api/v1/mcp

# Health check including MCP endpoints
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /usr/local/bin/mcp-health-check.sh

COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Integration Testing Strategy

#### MCP Integration Tests
```java
@SpringBootTest
@TestMethodOrder(OrderAnnotation.class)
public class BookingServiceMcpIntegrationTest {
    
    @Autowired
    private McpTestClient mcpTestClient;
    
    @Test
    @Order(1)
    public void testToolDiscovery() {
        List<String> tools = mcpTestClient.discoverTools("booking-service");
        assertThat(tools).contains(
            "createBookingSaga",
            "cancelBookingSaga",
            "getBookingStatus"
        );
    }
    
    @Test
    @Order(2)
    public void testCreateBookingSaga() {
        String bookingRequest = """
            {
                "customerId": "test-customer",
                "flightId": "test-flight",
                "hotelId": "test-hotel"
            }
            """;
            
        String result = mcpTestClient.invoketool(
            "booking-service", 
            "createBookingSaga", 
            bookingRequest
        );
        
        assertThat(result).contains("sagaId");
    }
    
    @Test
    @Order(3)
    public void testResourceAccess() {
        String sagaStates = mcpTestClient.accessResource(
            "booking-service",
            "saga-states"
        );
        
        assertThat(sagaStates).isNotEmpty();
    }
}
```

## ✅ Success Criteria

### Functional Requirements
- [ ] **Tool Discovery**: AI assistants can discover available tools across all services
- [ ] **Tool Invocation**: Successfully invoke domain-specific tools with proper authentication
- [ ] **Resource Access**: Access service resources (data, configurations, states) via MCP
- [ ] **Change Notifications**: Real-time notifications for resource and tool changes
- [ ] **Saga Integration**: Saga workflows accessible and controllable via MCP tools
- [ ] **Cross-Service Communication**: MCP tools can coordinate across multiple services
- [ ] **Security Integration**: OAuth2/JWT authentication and role-based authorization working

### Performance Requirements
- [ ] **Response Time**: MCP tool invocations complete within service SLA (< 500ms for simple operations)
- [ ] **Throughput**: Handle at least 1000 MCP requests per minute per service
- [ ] **Concurrent Connections**: Support at least 50 concurrent MCP client connections per service
- [ ] **Resource Usage**: MCP overhead < 10% additional memory and CPU usage
- [ ] **Network Efficiency**: Efficient use of HTTP connections and streaming

### Reliability Requirements
- [ ] **Error Handling**: Graceful degradation when MCP tools fail
- [ ] **Circuit Breaker**: Protection against cascading failures
- [ ] **Retry Mechanisms**: Automatic retry for transient failures
- [ ] **Monitoring**: Comprehensive metrics and alerting for MCP operations
- [ ] **Health Checks**: MCP endpoint health monitoring

### Security Requirements
- [ ] **Authentication**: All MCP endpoints secured with OAuth2/JWT
- [ ] **Authorization**: Role-based access control for tools and resources
- [ ] **Audit Logging**: Complete audit trail for MCP operations
- [ ] **Data Protection**: Sensitive data properly masked in logs and traces
- [ ] **Rate Limiting**: Protection against abuse and DoS attacks

### Operational Requirements
- [ ] **Documentation**: Complete API documentation for all MCP endpoints
- [ ] **Deployment**: Automated deployment with MCP endpoint validation
- [ ] **Monitoring**: Dashboards and alerting for MCP metrics
- [ ] **Troubleshooting**: Tools and runbooks for MCP issue resolution
- [ ] **Scalability**: MCP servers scale with service instances

## 📅 Timeline

### Week 1-2: Foundation Setup
- **Week 1**: 
  - Update parent POM and dependencies
  - Create MCP base classes in common-lib
  - Set up development environment
- **Week 2**: 
  - Implement security integration
  - Create monitoring and metrics foundation
  - Initial documentation

### Week 3-4: Core Services Implementation
- **Week 3**: 
  - Implement booking-service MCP server
  - Add flight-service MCP capabilities
- **Week 4**: 
  - Add hotel-service MCP capabilities
  - Integration testing between core services

### Week 5-6: Supporting Services
- **Week 5**: 
  - Implement payment-service MCP server
  - Add customer-service MCP capabilities
- **Week 6**: 
  - Add notification-service MCP capabilities
  - End-to-end workflow testing

### Week 7-8: BFF and Integration
- **Week 7**: 
  - Implement MCP aggregation in BFF services
  - Update discovery service
- **Week 8**: 
  - Performance optimization
  - Final documentation and deployment guides

### Milestones
- **End of Week 2**: ✅ MCP foundation complete
- **End of Week 4**: ✅ Core services MCP-enabled
- **End of Week 6**: ✅ All services MCP-enabled
- **End of Week 8**: ✅ Production-ready MCP implementation

## 📝 Conclusion

This comprehensive plan provides a structured approach to implementing MCP servers across all BookingSmart services. The phased implementation ensures minimal disruption to existing functionality while adding powerful AI integration capabilities.

Key advantages of this approach:
- **Incremental Implementation**: Services can be updated gradually
- **Maintained Architecture**: Respects existing saga orchestration patterns
- **Comprehensive Security**: Integrates with existing OAuth2/JWT system
- **Operational Excellence**: Includes monitoring, logging, and troubleshooting
- **Scalable Design**: Works with current and future service scaling needs

The implementation will enable AI assistants to interact naturally with the BookingSmart platform, providing users with intelligent booking assistance while maintaining the robust, event-driven architecture that powers the system.
