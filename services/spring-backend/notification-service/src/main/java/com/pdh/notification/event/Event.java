package com.pdh.notification.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Base class for all events in the notification service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public abstract class Event {
    private String id;
    private String type;
    private String timestamp;
}
