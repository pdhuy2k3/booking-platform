# Task Completion Guidelines

## When a Development Task is Completed

### 1. Code Verification
- **Compilation Check**: Ensure the code compiles successfully
  ```powershell
  mvn clean compile -DskipTests
  ```
- **Syntax Validation**: Verify no compilation errors or warnings
- **Dependency Resolution**: Ensure all dependencies are properly resolved

### 2. Testing Requirements
- **Unit Tests**: Run and verify unit tests pass
  ```powershell
  mvn test -Dtest=*[ModifiedClass]*Test
  ```
- **Integration Tests**: For changes affecting service integration
  ```powershell
  mvn test -Dtest=*IntegrationTest
  ```
- **Saga Flow Tests**: For changes to saga orchestration
  ```powershell
  mvn test -Dtest=*SagaTest
  ```

### 3. Configuration Validation
- **Application Properties**: Verify configuration changes are valid
- **Kafka Topics**: Ensure new topics are properly configured
- **Database Migrations**: Run Liquibase migrations if schema changed
  ```powershell
  mvn liquibase:update
  ```

### 4. Service Integration Checks
- **Component Scanning**: Verify `@ComponentScan` includes necessary packages
- **Bean Dependencies**: Ensure all required beans are available
- **Kafka Consumer/Producer**: Test message flow between services
- **Database Connectivity**: Verify database connections work

### 5. Code Quality Assurance
- **Code Formatting**: Apply consistent formatting
  ```powershell
  mvn spotless:apply  # if configured
  ```
- **Static Analysis**: Run code quality checks
  ```powershell
  mvn checkstyle:check
  mvn spotbugs:check
  ```
- **Code Coverage**: Ensure adequate test coverage
  ```powershell
  mvn jacoco:report
  ```

### 6. Documentation Updates
- **JavaDoc**: Update method and class documentation
- **API Documentation**: Update SpringDoc annotations if needed
- **README**: Update service-specific README files
- **Architecture Documentation**: Update if architectural changes made

### 7. Common Issue Prevention

#### Kafka Configuration Issues
- Verify `sagaCommandListenerContainerFactory` bean availability
- Check `@ComponentScan` includes `com.pdh.common.kafka.config`
- Ensure Kafka consumer groups are properly configured

#### Database Issues  
- Run database migrations before testing
- Verify connection strings and credentials
- Check for constraint violations in test data

#### Service Discovery Issues
- Ensure Eureka client is properly configured
- Verify service names and ports are consistent
- Check network connectivity between services

### 8. Deployment Readiness
- **Profile Configuration**: Ensure proper profile settings
- **Environment Variables**: Document any new environment variables needed
- **Docker Configuration**: Update Docker files if needed
- **Health Checks**: Verify actuator endpoints work properly

### 9. Rollback Preparation
- **Backup Procedures**: Document what needs to be backed up
- **Rollback Steps**: Document how to rollback changes if needed
- **Compatibility**: Ensure backward compatibility with existing data

### 10. Monitoring and Observability
- **Logging**: Add appropriate log statements for debugging
- **Metrics**: Add custom metrics if needed
- **Tracing**: Ensure distributed tracing context is maintained
- **Error Handling**: Proper exception handling and error responses

## Specific Checks for Saga-Related Changes

### Saga Orchestration
- Test complete saga flows (happy path and compensation)
- Verify state transitions are properly logged
- Check timeout and retry mechanisms
- Validate distributed lock management

### Event Processing
- Test event publishing and consumption
- Verify event deduplication works
- Check outbox pattern implementation
- Validate CDC event processing

## Pre-Production Checklist

### Security
- No hardcoded credentials or secrets
- Proper input validation and sanitization
- Secure communication between services
- Proper authentication and authorization

### Performance
- Database query optimization
- Proper connection pool configuration
- Cache utilization where appropriate
- Memory leak prevention

### Reliability
- Circuit breaker implementation
- Proper error handling and retry logic
- Graceful degradation capabilities
- Resource cleanup (connections, threads)

## Final Verification
- All tests pass (unit, integration, end-to-end)
- No compilation warnings or errors
- Service starts successfully and registers with Eureka
- Health check endpoints respond properly
- Saga flows complete successfully
- Event processing works as expected

Remember: **Always test the complete user journey** after making changes to ensure the entire booking workflow still functions correctly.