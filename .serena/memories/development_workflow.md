# Development Workflow and Task Completion Guidelines

## When a Task is Completed

### 1. Code Quality Checks
- **Compilation**: Ensure code compiles without errors using `mvn clean compile`
- **Testing**: Run relevant unit tests with `mvn test -pl {service-name}`
- **Code Style**: Follow established patterns in common-lib and existing services

### 2. Database Changes
- **Liquibase**: Create appropriate changesets for schema modifications
- **Migration Testing**: Test migrations on clean database
- **Rollback Planning**: Ensure migrations can be rolled back if needed

### 3. Integration Testing
- **Service Integration**: Test service-to-service communication
- **Event Flow**: Verify Kafka events are properly published and consumed
- **End-to-End**: Test complete user workflows through the system

### 4. Documentation Updates
- **API Documentation**: Update OpenAPI specifications if APIs changed
- **Code Comments**: Ensure complex logic is well-documented
- **README Updates**: Update service-specific README files if needed

## Development Best Practices

### Before Making Changes
1. **Understand Architecture**: Review existing patterns in common-lib
2. **Check Dependencies**: Understand service interactions and event flows
3. **Review Similar Code**: Look at existing implementations for consistency

### During Development
1. **Use Common Components**: Leverage shared utilities from common-lib
2. **Follow Patterns**: Implement outbox pattern for events, use standard DTOs
3. **Error Handling**: Use consistent exception handling and error responses
4. **Logging**: Add appropriate logging for debugging and monitoring

### Testing Strategy
1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test service interactions and database operations
3. **Contract Tests**: Verify API contracts between services
4. **End-to-End Tests**: Test complete business workflows

## Deployment Considerations
- **Environment Variables**: Ensure all configuration is externalized
- **Health Checks**: Verify actuator endpoints are working
- **Service Dependencies**: Check service startup order and dependencies
- **Database Connectivity**: Verify database connections and migrations