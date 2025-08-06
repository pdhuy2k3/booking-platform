package com.pdh.common.event;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, property = "@type")
public abstract class DomainEvent {
    private final String eventId = UUID.randomUUID().toString();
    private final LocalDateTime occurredAt = LocalDateTime.now();
    private final String eventType = this.getClass().getSimpleName();
    
    public abstract String getAggregateId();
    public abstract String getAggregateType();
}
