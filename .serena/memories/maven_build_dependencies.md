# Maven Build Dependencies and Redis Configuration Fix

## Redis Bean Configuration Issue - RESOLVED

### Original Problem
```
Parameter 0 of method distributedLockManager in com.pdh.common.lock.LockManagerConfiguration
required a bean of type 'org.springframework.data.redis.core.RedisTemplate' that could not be found.
```

### Root Cause
The `LockManagerConfiguration` in `common-lib` was trying to inject a `RedisTemplate` bean that wasn't available when Redis wasn't configured in some services.

### Solution Applied
1. **Made Redis Configuration Conditional**: Updated `LockManagerConfiguration` with `@ConditionalOnClass(RedisConnectionFactory.class)` to only activate when Redis is available.

2. **Fixed Dependency Injection**: Changed `InventoryLockService` to inject `DistributedLockManager` interface instead of concrete `RedisDistributedLockManager` class.

3. **Made Kafka Validation Optional**: Updated `AppKafkaListenerConfigurer` to use `@Autowired(required = false)` for `LocalValidatorFactoryBean` to handle cases where validation isn't available.

4. **Added Redis Configuration**: Added Redis configuration to services that need distributed locking:
   - `flight-service`
   - `hotel-service`
   - `payment-service`
   - `booking-service` (already had it)

5. **Updated Docker Compose**: Added Redis environment variables and dependencies for the services.

## Maven Build Order Considerations

When building services that depend on `common-lib`, you need to ensure the dependencies are built in the correct order to avoid dependency resolution errors.

### Key Build Commands

#### Building Multiple Modules Together (RECOMMENDED)
```bash
# Build a service
mvn clean install -pl booking-service -am

# Build multiple services 
mvn clean install -pl booking-service,flight-service,hotel-service -am
```


```

### Why This is Necessary

- **Dependency Resolution**: Services depend on `common-lib` artifacts that must be available in the local Maven repository
- **Multi-Module Structure**: Maven needs to resolve inter-module dependencies before compilation
- **Avoid Cached Failures**: Prevents "artifact not found" errors when Maven has cached failed dependency lookups

### Common Error Pattern
```
Failed to read artifact descriptor for com.pdh:common-lib:jar:0.0.1-SNAPSHOT
Caused by: com.pdh:bookingsmart:pom:${revision} was not found
```

**Solution**: Always build `common-lib` together with dependent services using the `-pl` flag.

### Best Practices

1. **Always include common-lib** when building any service that depends on it
2. **Use comma-separated module list** with `-pl` flag for efficiency
3. **Install parent POM first** if building from scratch
4. **Prefer multi-module builds** over sequential builds for faster compilation