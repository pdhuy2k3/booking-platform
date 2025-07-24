# Phase 3: Enhanced Compensation (COMMON-LIB FOCUSED) - 0.5 Days

## 🎯 **Objective**
Enhance existing compensation logic using common-lib infrastructure, leveraging existing SagaState.java compensation states, ExtendedOutboxEvent.createSagaEvent(), and existing compensation methods.

## 🔍 **Leveraging Existing Common-Lib Infrastructure**

### **✅ Already Available (NO NEW CODE NEEDED):**
- **SagaState.java**: Complete compensation states already defined
- **ExtendedOutboxEvent.createSagaEvent()**: Saga event publishing with priority
- **Existing startCompensation()**: Basic compensation logic in BookingSagaOrchestrator
- **Existing compensation states**: COMPENSATION_PAYMENT_REFUND, COMPENSATION_HOTEL_CANCEL, etc.

## 📋 **Common-Lib Enhancements (2 files)**

### **1. Create CompensationPlan.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/saga/compensation/CompensationPlan.java`**

```java
package com.pdh.common.saga.compensation;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

/**
 * Compensation plan for saga orchestration
 * Centralized in common-lib for reuse across services
 */
@Data
@NoArgsConstructor
public class CompensationPlan {

    private Queue<CompensationStep> steps = new LinkedList<>();

    public void addStep(CompensationStep step) {
        steps.offer(step);
    }

    public CompensationStep getNextStep() {
        return steps.poll();
    }

    public boolean isEmpty() {
        return steps.isEmpty();
    }

    public int size() {
        return steps.size();
    }

    public List<CompensationStep> getRemainingSteps() {
        return new ArrayList<>(steps);
    }
}
```

### **2. Create CompensationStep.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/saga/compensation/CompensationStep.java`**

```java
package com.pdh.common.saga.compensation;

/**
 * Compensation steps enum - centralized in common-lib
 * Corresponds to existing SagaState compensation states
 */
public enum CompensationStep {
    REFUND_PAYMENT("Refund payment to customer"),
    CANCEL_HOTEL("Cancel hotel reservation"),
    CANCEL_FLIGHT("Cancel flight reservation");

    private final String description;

    CompensationStep(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

## 📋 **Service Files to Enhance (2 files)**

### **1. Enhance BookingSagaOrchestrator.java (USE EXISTING INFRASTRUCTURE)**

**File: `booking-service/src/main/java/com/pdh/booking/saga/BookingSagaOrchestrator.java`**

#### **Add Dependency (to existing class):**
```java
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingSagaOrchestrator {
    // ... existing dependencies remain unchanged

    // ADD THIS LINE (from common-lib):
    // Note: CompensationPlanService will be created as a simple service

    // ... rest of existing code unchanged
}
```

#### **Enhance Existing startCompensation Method (USE EXISTING SAGASTATE):**
```java
// REPLACE existing startCompensation() method
private void startCompensation(BookingSagaInstance saga, String reason) {
    log.warn("Starting enhanced compensation for saga: {}, reason: {}", saga.getSagaId(), reason);

    // Use existing compensation setup and SagaState enum
    saga.startCompensation(reason);
    saga.setCurrentState(SagaState.COMPENSATION_STARTED); // Use existing state from common-lib
    sagaRepository.save(saga);

    // NEW: Create and execute compensation plan using common-lib components
    executeStructuredCompensationFlow(saga);
}

// ADD this new method to existing class
private void executeStructuredCompensationFlow(BookingSagaInstance saga) {
    log.info("Executing structured compensation flow for saga: {}", saga.getSagaId());
    
    try {
        // Create compensation plan based on completed steps
        CompensationPlan plan = compensationPlanService.createCompensationPlan(saga);
        
        if (plan.isEmpty()) {
            log.info("No compensation needed for saga: {}", saga.getSagaId());
            completeCompensation(saga);
            return;
        }
        
        // Execute first compensation step
        executeNextCompensationStep(saga, plan);
        
    } catch (Exception e) {
        log.error("Error executing compensation flow for saga: {}", saga.getSagaId(), e);
        handleCompensationFailure(saga, "COMPENSATION_FLOW", e);
    }
}

// ADD this new method to existing class
private void executeNextCompensationStep(BookingSagaInstance saga, CompensationPlan plan) {
    CompensationStep nextStep = plan.getNextStep();
    
    if (nextStep == null) {
        completeCompensation(saga);
        return;
    }
    
    log.info("Executing compensation step: {} for saga: {}", nextStep, saga.getSagaId());
    
    try {
        switch (nextStep) {
            case REFUND_PAYMENT:
                executePaymentRefund(saga);
                break;
            case CANCEL_HOTEL:
                executeHotelCancellation(saga);
                break;
            case CANCEL_FLIGHT:
                executeFlightCancellation(saga);
                break;
        }
    } catch (Exception e) {
        log.error("Error executing compensation step: {} for saga: {}", nextStep, saga.getSagaId(), e);
        handleCompensationFailure(saga, nextStep.name(), e);
    }
}

// ADD these new compensation execution methods
private void executePaymentRefund(BookingSagaInstance saga) {
    log.info("Executing payment refund for saga: {}", saga.getSagaId());
    
    saga.setCurrentState(SagaState.COMPENSATION_PAYMENT_REFUND_PENDING);
    sagaRepository.save(saga);
    
    try {
        // Use existing ExtendedOutboxEvent.createSagaEvent() for compensation
        ExtendedOutboxEvent compensationEvent = ExtendedOutboxEvent.createSagaEvent(
            "REFUND_PAYMENT",
            saga.getSagaId(),
            saga.getBookingId(),
            getUserId(saga),
            createCompensationCommandPayload(saga, "REFUND_PAYMENT"),
            ExtendedOutboxEvent.Priority.HIGH // High priority for compensation
        );
        eventPublisher.publishEvent(compensationEvent);

        // Also send direct saga command if available
        if (sagaCommandKafkaTemplate != null) {
            SagaCommand command = createTypedSagaCommand(saga, "REFUND_PAYMENT");
            command.addMetadata("isCompensation", "true");
            sagaCommandKafkaTemplate.send("payment-saga-commands", saga.getSagaId(),
                objectMapper.writeValueAsString(command));
        }

    } catch (Exception e) {
        log.error("Failed to send payment refund command for saga: {}", saga.getSagaId(), e);
        handleCompensationFailure(saga, "REFUND_PAYMENT", e);
    }
}

private void executeHotelCancellation(BookingSagaInstance saga) {
    log.info("Executing hotel cancellation for saga: {}", saga.getSagaId());
    
    saga.setCurrentState(SagaState.COMPENSATION_HOTEL_CANCEL_PENDING);
    sagaRepository.save(saga);
    
    try {
        SagaCommand command = createTypedSagaCommand(saga, "CANCEL_HOTEL");
        sagaCommandValidator.validateCommand(command);
        
        String commandPayload = objectMapper.writeValueAsString(command);
        kafkaTemplate.send("booking-saga-commands", saga.getSagaId(), commandPayload);
        
    } catch (Exception e) {
        log.error("Failed to send hotel cancellation command for saga: {}", saga.getSagaId(), e);
        handleCompensationFailure(saga, "CANCEL_HOTEL", e);
    }
}

private void executeFlightCancellation(BookingSagaInstance saga) {
    log.info("Executing flight cancellation for saga: {}", saga.getSagaId());
    
    saga.setCurrentState(SagaState.COMPENSATION_FLIGHT_CANCEL_PENDING);
    sagaRepository.save(saga);
    
    try {
        SagaCommand command = createTypedSagaCommand(saga, "CANCEL_FLIGHT");
        sagaCommandValidator.validateCommand(command);
        
        String commandPayload = objectMapper.writeValueAsString(command);
        kafkaTemplate.send("booking-saga-commands", saga.getSagaId(), commandPayload);
        
    } catch (Exception e) {
        log.error("Failed to send flight cancellation command for saga: {}", saga.getSagaId(), e);
        handleCompensationFailure(saga, "CANCEL_FLIGHT", e);
    }
}

// ADD enhanced compensation completion method
private void completeCompensation(BookingSagaInstance saga) {
    log.info("Enhanced compensation completed for saga: {}", saga.getSagaId());
    
    // Use existing completion logic
    saga.completeCompensation();
    sagaRepository.save(saga);
    
    // Update booking entity to cancelled
    cancelBookingEntity(saga);
    
    // Publish booking cancellation event
    publishBookingCancellationEvent(saga);
}

// ADD compensation failure handling
private void handleCompensationFailure(BookingSagaInstance saga, String failedStep, Exception e) {
    log.error("Compensation step failed for saga: {}, step: {}", saga.getSagaId(), failedStep, e);
    
    // Mark saga as failed - may need manual intervention
    saga.setCurrentState(SagaState.SAGA_FAILED);
    sagaRepository.save(saga);
    
    // Publish compensation failure event for monitoring/alerting
    publishCompensationFailureEvent(saga, failedStep, e.getMessage());
}

private void publishCompensationFailureEvent(BookingSagaInstance saga, String failedStep, String errorMessage) {
    Map<String, Object> failurePayload = Map.of(
        "sagaId", saga.getSagaId(),
        "bookingId", saga.getBookingId(),
        "failedCompensationStep", failedStep,
        "errorMessage", errorMessage,
        "timestamp", Instant.now()
    );
    
    eventPublisher.publishEvent("CompensationFailed", "BookingSaga", saga.getSagaId(), failurePayload);
}
```

#### **Enhance Existing Event Handlers:**
```java
// ENHANCE existing handlePaymentRefunded method (if exists)
private void handlePaymentRefunded(PaymentOutboxEvent event) {
    String sagaId = event.getSagaId();
    if (sagaId == null) return;
    
    Optional<BookingSagaInstance> sagaOpt = sagaRepository.findById(sagaId);
    if (sagaOpt.isEmpty()) return;
    
    BookingSagaInstance saga = sagaOpt.get();
    log.info("Payment refunded for saga: {}", sagaId);
    
    saga.setCurrentState(SagaState.COMPENSATION_PAYMENT_REFUNDED);
    saga.addCompensationStep("PAYMENT_REFUNDED"); // Use existing method
    sagaRepository.save(saga);
    
    // Continue with next compensation step
    continueCompensationFlow(saga);
}

// ADD this new method
private void continueCompensationFlow(BookingSagaInstance saga) {
    try {
        CompensationPlan remainingPlan = compensationPlanService.createRemainingCompensationPlan(saga);
        executeNextCompensationStep(saga, remainingPlan);
    } catch (Exception e) {
        log.error("Error continuing compensation flow for saga: {}", saga.getSagaId(), e);
        handleCompensationFailure(saga, "CONTINUE_COMPENSATION", e);
    }
}
```

### **2. Enhance BookingSagaInstance.java**

**File: `booking-service/src/main/java/com/pdh/booking/model/BookingSagaInstance.java`**

#### **Add Step Tracking Fields (to existing entity):**
```java
@Entity
@Table(name = "booking_saga_instances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingSagaInstance extends AbstractAuditEntity {
    // ... existing fields remain unchanged
    
    // ADD these new fields for step tracking:
    
    @ElementCollection
    @CollectionTable(name = "saga_completed_steps", joinColumns = @JoinColumn(name = "saga_id"))
    @Column(name = "step_name")
    private Set<String> completedSteps = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "saga_compensation_steps", joinColumns = @JoinColumn(name = "saga_id"))
    @Column(name = "compensation_step")
    private Set<String> compensationSteps = new HashSet<>();
    
    // ADD these new helper methods:
    
    public void addCompletedStep(String stepName) {
        this.completedSteps.add(stepName);
    }

    public void addCompensationStep(String stepName) {
        this.compensationSteps.add(stepName);
    }

    public boolean hasCompletedStep(String stepName) {
        return this.completedSteps.contains(stepName);
    }

    public boolean needsCompensation(String stepName) {
        return hasCompletedStep(stepName) && !compensationSteps.contains(stepName);
    }
    
    // ... rest of existing code unchanged
}
```

## 📋 **New Files to Create (2 files)**

### **1. CompensationPlan (NEW FILE)**

**File: `booking-service/src/main/java/com/pdh/booking/saga/compensation/CompensationPlan.java`**

```java
@Data
@NoArgsConstructor
public class CompensationPlan {
    
    private Queue<CompensationStep> steps = new LinkedList<>();
    
    public void addStep(CompensationStep step) {
        steps.offer(step);
    }
    
    public CompensationStep getNextStep() {
        return steps.poll();
    }
    
    public boolean isEmpty() {
        return steps.isEmpty();
    }
    
    public int size() {
        return steps.size();
    }
    
    public List<CompensationStep> getRemainingSteps() {
        return new ArrayList<>(steps);
    }
}
```

### **2. CompensationStep Enum (NEW FILE)**

**File: `booking-service/src/main/java/com/pdh/booking/saga/compensation/CompensationStep.java`**

```java
public enum CompensationStep {
    REFUND_PAYMENT("Refund payment to customer"),
    CANCEL_HOTEL("Cancel hotel reservation"),
    CANCEL_FLIGHT("Cancel flight reservation");
    
    private final String description;
    
    CompensationStep(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
```

### **3. CompensationPlanService (NEW FILE)**

**File: `booking-service/src/main/java/com/pdh/booking/saga/compensation/CompensationPlanService.java`**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class CompensationPlanService {

    public CompensationPlan createCompensationPlan(BookingSagaInstance saga) {
        CompensationPlan plan = new CompensationPlan();
        
        // Add compensation steps in reverse order of execution
        if (saga.needsCompensation("PAYMENT_COMPLETED")) {
            plan.addStep(CompensationStep.REFUND_PAYMENT);
        }
        
        if (saga.needsCompensation("HOTEL_RESERVED")) {
            plan.addStep(CompensationStep.CANCEL_HOTEL);
        }
        
        if (saga.needsCompensation("FLIGHT_RESERVED")) {
            plan.addStep(CompensationStep.CANCEL_FLIGHT);
        }
        
        log.info("Created compensation plan with {} steps for saga: {}", plan.size(), saga.getSagaId());
        return plan;
    }

    public CompensationPlan createRemainingCompensationPlan(BookingSagaInstance saga) {
        CompensationPlan plan = new CompensationPlan();
        
        // Only add steps that haven't been compensated yet
        if (saga.needsCompensation("HOTEL_RESERVED") && !saga.getCompensationSteps().contains("HOTEL_CANCELLED")) {
            plan.addStep(CompensationStep.CANCEL_HOTEL);
        }
        
        if (saga.needsCompensation("FLIGHT_RESERVED") && !saga.getCompensationSteps().contains("FLIGHT_CANCELLED")) {
            plan.addStep(CompensationStep.CANCEL_FLIGHT);
        }
        
        log.info("Created remaining compensation plan with {} steps for saga: {}", plan.size(), saga.getSagaId());
        return plan;
    }
}
```

## 📊 **Database Schema Changes**

### **Add Step Tracking Tables:**
```sql
-- Add to existing migration
CREATE TABLE saga_completed_steps (
    saga_id VARCHAR(36) NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (saga_id, step_name),
    FOREIGN KEY (saga_id) REFERENCES booking_saga_instances(saga_id)
);

CREATE TABLE saga_compensation_steps (
    saga_id VARCHAR(36) NOT NULL,
    compensation_step VARCHAR(100) NOT NULL,
    PRIMARY KEY (saga_id, compensation_step),
    FOREIGN KEY (saga_id) REFERENCES booking_saga_instances(saga_id)
);
```

## ✅ **Phase 3 Success Criteria**

1. **Structured compensation flow working** ✅
2. **Step tracking and compensation plan execution** ✅
3. **Proper inventory release during compensation** ✅
4. **Payment refunds working correctly** ✅
5. **Leverages existing compensation infrastructure** ✅

## 🧪 **Testing Strategy**

### **Unit Tests:**
- Test CompensationPlanService logic
- Test compensation step execution
- Test step tracking functionality

### **Integration Tests:**
- Test end-to-end compensation flow
- Test compensation plan creation and execution
- Test failure handling and recovery

## 📊 **Deployment Notes**

- Enhance existing compensation without breaking changes
- Add database tables for step tracking
- Monitor compensation success rates
- Enable structured compensation with feature flag
