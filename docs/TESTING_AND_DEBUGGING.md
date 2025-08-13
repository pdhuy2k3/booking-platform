# Testing & Debugging Aids

## 1. Saga Mock Mode

The Saga orchestration supports a mock mode for testing distributed transactions without requiring all services to be operational.

### Enabling Mock Mode

```yaml
# application-test.yml
saga:
  mock:
    enabled: true
    mode: PARTIAL  # FULL, PARTIAL, or DISABLED
    services:
      - flight-service
      - hotel-service
    default-delay: 500ms
    failure-scenarios:
      payment-service:
        enabled: true
        failure-rate: 0.2  # 20% failure rate
        compensation-delay: 1000ms
```

### Mock Mode Configuration

```java
// Enable mock mode via environment variable
export SAGA_MOCK_ENABLED=true
export SAGA_MOCK_SERVICES=flight-service,hotel-service

// Or via command line
java -jar booking-service.jar --saga.mock.enabled=true
```

### Testing Saga Compensation

```bash
# Trigger a mock failure to test compensation
curl -X POST http://localhost:8081/api/bookings/test-saga \
  -H "Content-Type: application/json" \
  -H "X-Mock-Failure: payment-service" \
  -d '{
    "flightId": "MOCK-FL-001",
    "hotelId": "MOCK-HT-001",
    "customerId": "TEST-USER-001",
    "mockScenario": "PAYMENT_FAILURE"
  }'
```

## 2. Spring Boot Actuator Endpoints

### Essential Actuator Endpoints

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,env,loggers,threaddump,heapdump,kafka,sagas
      base-path: /actuator
  endpoint:
    health:
      show-details: always
      show-components: always
  metrics:
    enable:
      jvm: true
      kafka: true
      saga: true
```

### Health Check Endpoints

```bash
# Overall health status
curl http://localhost:8081/actuator/health

# Detailed component health
curl http://localhost:8081/actuator/health/liveness
curl http://localhost:8081/actuator/health/readiness

# Kafka connectivity health
curl http://localhost:8081/actuator/health/kafka

# Database health
curl http://localhost:8081/actuator/health/db

# Saga orchestration health
curl http://localhost:8081/actuator/health/saga
```

### Custom Saga Actuator Endpoint

```bash
# View active sagas
curl http://localhost:8081/actuator/sagas

# View saga by transaction ID
curl http://localhost:8081/actuator/sagas/{transactionId}

# Retry failed saga
curl -X POST http://localhost:8081/actuator/sagas/{transactionId}/retry

# Force compensate saga
curl -X POST http://localhost:8081/actuator/sagas/{transactionId}/compensate
```

### Metrics Endpoints

```bash
# All metrics
curl http://localhost:8081/actuator/metrics

# Saga-specific metrics
curl http://localhost:8081/actuator/metrics/saga.transactions.active
curl http://localhost:8081/actuator/metrics/saga.transactions.completed
curl http://localhost:8081/actuator/metrics/saga.transactions.failed
curl http://localhost:8081/actuator/metrics/saga.compensation.triggered

# Kafka metrics
curl http://localhost:8081/actuator/metrics/kafka.consumer.lag
curl http://localhost:8081/actuator/metrics/kafka.producer.record.send.total
```

## 3. Kafka UI for Event Monitoring

### Accessing Kafka UI

```bash
# Kafka UI is available at:
http://localhost:8080

# Direct topic viewing
http://localhost:8080/ui/clusters/local/topics

# View specific topic messages
http://localhost:8080/ui/clusters/local/topics/booking-events/messages
http://localhost:8080/ui/clusters/local/topics/payment-events/messages
http://localhost:8080/ui/clusters/local/topics/saga-events/messages
```

### Kafka Command-Line Tools

```bash
# List all topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# View messages in a topic
docker exec -it kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic booking-events \
  --from-beginning \
  --property print.headers=true \
  --property print.key=true

# Monitor consumer lag
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --describe \
  --group booking-service-group

# View topic configuration
docker exec -it kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic saga-events
```

### Producing Test Events

```bash
# Send test event to Kafka
docker exec -it kafka kafka-console-producer \
  --bootstrap-server localhost:9092 \
  --topic test-events \
  --property "parse.key=true" \
  --property "key.separator=:" << EOF
test-key-1:{"eventType":"TEST","payload":{"id":"123","status":"INITIATED"}}
EOF

# Using kafkacat for JSON events
echo '{"transactionId":"test-123","status":"STARTED"}' | \
  kafkacat -P -b localhost:9092 -t saga-events -k test-123
```

## 4. Virtual Threads Debugging

### Enabling Virtual Thread Debugging

```java
// JVM arguments for virtual thread debugging
-Djdk.virtualThreadScheduler.parallelism=1
-Djdk.virtualThreadScheduler.maxPoolSize=256
-Djdk.tracePinnedThreads=full
```

### Virtual Thread Monitoring via JMX

```bash
# Connect JConsole with virtual thread support
jconsole -J-Djdk.virtualThreadScheduler.debugMode=true

# Using JVisualVM
jvisualvm --jdkhome $JAVA_HOME \
  -J-Djdk.virtualThread.monitorVirtualThreads=true
```

### Thread Dump with Virtual Threads

```bash
# Get thread dump including virtual threads
curl http://localhost:8081/actuator/threaddump | jq '.threads[] | select(.threadName | startswith("VirtualThread"))'

# Full thread dump to file
curl http://localhost:8081/actuator/threaddump > threaddump.json

# Using jcmd
jcmd <PID> Thread.dump_to_file -format=json threaddump.json
```

### Virtual Thread Metrics

```bash
# Custom virtual thread metrics endpoint
curl http://localhost:8081/actuator/metrics/jvm.threads.virtual.count
curl http://localhost:8081/actuator/metrics/jvm.threads.virtual.pinned
curl http://localhost:8081/actuator/metrics/jvm.threads.carrier.count
```

### Debugging Pinned Virtual Threads

```java
// Add to application.properties
logging.level.jdk.internal.vm.Continuation=DEBUG
jdk.tracePinnedThreads=full

// Programmatic detection
@Component
public class VirtualThreadMonitor {
    
    @EventListener(ApplicationReadyEvent.class)
    public void monitorPinnedThreads() {
        Thread.startVirtualThread(() -> {
            while (true) {
                try {
                    Thread.getAllStackTraces().forEach((thread, stack) -> {
                        if (thread.isVirtual() && isPinned(thread)) {
                            log.warn("Pinned virtual thread detected: {}", thread.getName());
                            Arrays.stream(stack).forEach(element -> 
                                log.warn("  at {}", element));
                        }
                    });
                    Thread.sleep(5000);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
    }
}
```

## 5. Distributed Tracing

### Enabling Distributed Tracing

```yaml
# application.yml
management:
  tracing:
    sampling:
      probability: 1.0  # Sample all requests in dev
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans
```

### Viewing Traces

```bash
# Access Zipkin UI
http://localhost:9411

# Query traces by service
http://localhost:9411/zipkin/?serviceName=booking-service

# Find saga transaction traces
http://localhost:9411/zipkin/?annotationQuery=saga.transaction.id=<transactionId>
```

## 6. Log Aggregation & Analysis

### Dynamic Log Level Management

```bash
# View current log levels
curl http://localhost:8081/actuator/loggers

# Change log level at runtime
curl -X POST http://localhost:8081/actuator/loggers/com.bookingsmart.saga \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": "DEBUG"}'

# Enable SQL logging
curl -X POST http://localhost:8081/actuator/loggers/org.hibernate.SQL \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": "DEBUG"}'
```

### Structured Logging for Sagas

```yaml
# logback-spring.xml
<configuration>
    <appender name="SAGA_APPENDER" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <customFields>{"service":"${spring.application.name}","profile":"${spring.profiles.active}"}</customFields>
            <includeMdcKeyName>transactionId</includeMdcKeyName>
            <includeMdcKeyName>sagaStep</includeMdcKeyName>
            <includeMdcKeyName>compensating</includeMdcKeyName>
        </encoder>
    </appender>
    
    <logger name="com.bookingsmart.saga" level="DEBUG">
        <appender-ref ref="SAGA_APPENDER"/>
    </logger>
</configuration>
```

## 7. Database Debugging

### Viewing Outbox Table

```sql
-- Check pending outbox events
SELECT * FROM saga_outbox 
WHERE processed = false 
ORDER BY created_at DESC;

-- View failed saga states
SELECT * FROM saga_state 
WHERE status IN ('FAILED', 'COMPENSATING')
ORDER BY updated_at DESC;

-- Analyze saga performance
SELECT 
    saga_type,
    status,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration_seconds
FROM saga_state
GROUP BY saga_type, status;
```

### Liquibase Debugging

```bash
# View migration status
curl http://localhost:8081/actuator/liquibase

# Generate SQL for pending changes
mvn liquibase:updateSQL

# Rollback last change
mvn liquibase:rollback -Dliquibase.rollbackCount=1
```

## 8. Performance Profiling

### Async Profiler Integration

```bash
# Start profiling
curl http://localhost:8081/actuator/profiler/start?event=cpu&duration=30

# Download flame graph
curl http://localhost:8081/actuator/profiler/flamegraph > flamegraph.html

# Profile virtual threads specifically
curl http://localhost:8081/actuator/profiler/start?event=cpu&filter=VirtualThread
```

### JFR (Java Flight Recorder)

```bash
# Start JFR recording
jcmd <PID> JFR.start name=SagaProfile settings=profile duration=60s filename=saga-profile.jfr

# Custom JFR events for Sagas
curl -X POST http://localhost:8081/actuator/jfr/start \
  -H "Content-Type: application/json" \
  -d '{
    "name": "saga-recording",
    "duration": "PT1M",
    "events": ["jdk.VirtualThreadStart", "jdk.VirtualThreadEnd", "custom.SagaEvent"]
  }'
```

## 9. Integration Test Helpers

### TestContainers Setup

```java
@SpringBootTest
@Testcontainers
class SagaIntegrationTest {
    
    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));
    
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine");
    
    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
```

### Mock Saga Test Utility

```bash
# Run saga test suite
mvn test -Dtest=SagaTestSuite -Dsaga.mock.enabled=true

# Generate test report
mvn surefire-report:report
open target/site/surefire-report.html
```

## 10. Quick Debugging Commands

### One-liner Health Check
```bash
curl -s http://localhost:8081/actuator/health | jq '.status'
```

### Monitor Active Sagas
```bash
watch -n 2 'curl -s http://localhost:8081/actuator/metrics/saga.transactions.active | jq .measurements[0].value'
```

### Tail Saga Logs
```bash
docker logs -f booking-service 2>&1 | grep -E "SAGA|COMPENSATION|transactionId"
```

### Check Kafka Consumer Lag
```bash
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --all-groups | grep -v "STABLE"
```

### Virtual Thread Count
```bash
curl -s http://localhost:8081/actuator/metrics/jvm.threads.virtual.count | jq '.measurements[0].value'
```

## Troubleshooting Common Issues

### Saga Stuck in PENDING
```bash
# Check outbox for unprocessed events
curl http://localhost:8081/actuator/sagas/pending

# Force retry
curl -X POST http://localhost:8081/actuator/sagas/retry-pending
```

### Virtual Thread Pinning
```bash
# Enable pinning detection
export JDK_TRACE_PINNED_THREADS=full
java -jar booking-service.jar
```

### Kafka Connection Issues
```bash
# Test Kafka connectivity
docker exec -it kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Reset consumer group offset
docker exec -it kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group booking-service-group \
  --reset-offsets --to-earliest --execute --all-topics
```

This comprehensive testing and debugging setup ensures full observability and control over the Saga orchestration system, making it easy to diagnose issues and test various failure scenarios.
