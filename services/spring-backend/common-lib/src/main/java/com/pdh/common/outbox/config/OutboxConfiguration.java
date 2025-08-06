package com.pdh.common.outbox.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Outbox Configuration
 * Provides configuration for outbox pattern implementation
 */
@Configuration
public class OutboxConfiguration {
    
    /**
     * Outbox properties configuration
     */
    @Bean
    @ConfigurationProperties(prefix = "outbox")
    public OutboxProperties outboxProperties() {
        return new OutboxProperties();
    }
    
    /**
     * Outbox properties class
     */
    public static class OutboxProperties {
        
        private Relay relay = new Relay();
        private Topics topics = new Topics();
        private Cleanup cleanup = new Cleanup();
        
        public Relay getRelay() {
            return relay;
        }
        
        public void setRelay(Relay relay) {
            this.relay = relay;
        }
        
        public Topics getTopics() {
            return topics;
        }
        
        public void setTopics(Topics topics) {
            this.topics = topics;
        }
        
        public Cleanup getCleanup() {
            return cleanup;
        }
        
        public void setCleanup(Cleanup cleanup) {
            this.cleanup = cleanup;
        }
        
        public static class Relay {
            private long fixedDelayMs = 5000;
            private long retryDelayMs = 10000;
            private int maxRetries = 3;
            private int batchSize = 50;
            private boolean enabled = false; // Disabled by default (using Debezium)
            
            public long getFixedDelayMs() {
                return fixedDelayMs;
            }
            
            public void setFixedDelayMs(long fixedDelayMs) {
                this.fixedDelayMs = fixedDelayMs;
            }
            
            public long getRetryDelayMs() {
                return retryDelayMs;
            }
            
            public void setRetryDelayMs(long retryDelayMs) {
                this.retryDelayMs = retryDelayMs;
            }
            
            public int getMaxRetries() {
                return maxRetries;
            }
            
            public void setMaxRetries(int maxRetries) {
                this.maxRetries = maxRetries;
            }
            
            public int getBatchSize() {
                return batchSize;
            }
            
            public void setBatchSize(int batchSize) {
                this.batchSize = batchSize;
            }
            
            public boolean isEnabled() {
                return enabled;
            }
            
            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }
        }
        
        public static class Topics {
            private String bookingEvents = "booking.events";
            private String paymentEvents = "payment.events";
            private String flightEvents = "flight.events";
            private String hotelEvents = "hotel.events";
            private String notificationEvents = "notification.events";
            private String sagaEvents = "saga.events";
            
            public String getBookingEvents() {
                return bookingEvents;
            }
            
            public void setBookingEvents(String bookingEvents) {
                this.bookingEvents = bookingEvents;
            }
            
            public String getPaymentEvents() {
                return paymentEvents;
            }
            
            public void setPaymentEvents(String paymentEvents) {
                this.paymentEvents = paymentEvents;
            }
            
            public String getFlightEvents() {
                return flightEvents;
            }
            
            public void setFlightEvents(String flightEvents) {
                this.flightEvents = flightEvents;
            }
            
            public String getHotelEvents() {
                return hotelEvents;
            }
            
            public void setHotelEvents(String hotelEvents) {
                this.hotelEvents = hotelEvents;
            }
            
            public String getNotificationEvents() {
                return notificationEvents;
            }
            
            public void setNotificationEvents(String notificationEvents) {
                this.notificationEvents = notificationEvents;
            }
            
            public String getSagaEvents() {
                return sagaEvents;
            }
            
            public void setSagaEvents(String sagaEvents) {
                this.sagaEvents = sagaEvents;
            }
        }
        
        public static class Cleanup {
            private boolean enabled = true;
            private long processedEventsRetentionHours = 168; // 7 days
            private long expiredEventsRetentionHours = 24; // 1 day
            private String cronExpression = "0 0 2 * * ?"; // Daily at 2 AM
            
            public boolean isEnabled() {
                return enabled;
            }
            
            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }
            
            public long getProcessedEventsRetentionHours() {
                return processedEventsRetentionHours;
            }
            
            public void setProcessedEventsRetentionHours(long processedEventsRetentionHours) {
                this.processedEventsRetentionHours = processedEventsRetentionHours;
            }
            
            public long getExpiredEventsRetentionHours() {
                return expiredEventsRetentionHours;
            }
            
            public void setExpiredEventsRetentionHours(long expiredEventsRetentionHours) {
                this.expiredEventsRetentionHours = expiredEventsRetentionHours;
            }
            
            public String getCronExpression() {
                return cronExpression;
            }
            
            public void setCronExpression(String cronExpression) {
                this.cronExpression = cronExpression;
            }
        }
    }
}
