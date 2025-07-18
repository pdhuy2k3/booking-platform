package com.pdh.common.kafka.cdc;

import com.pdh.common.kafka.cdc.message.Operation;
import lombok.extern.slf4j.Slf4j;

/**
 * Base CDC Consumer
 */
@Slf4j
public abstract class BaseCdcConsumer<K, V> {

    /**
     * Handle CDC message based on operation type
     */
    protected void handleCdcMessage(K key, V message, Operation operation) {
        log.debug("Processing CDC message with key: {} and operation: {}", key, operation);
        
        try {
            switch (operation) {
                case CREATE -> handleCreate(key, message);
                case UPDATE -> handleUpdate(key, message);
                case DELETE -> handleDelete(key, message);
                case READ -> handleRead(key, message);
                default -> log.warn("Unknown operation: {}", operation);
            }
        } catch (Exception e) {
            log.error("Error processing CDC message with key: {} and operation: {}", key, operation, e);
            throw e; // Re-throw để Kafka retry mechanism xử lý
        }
    }

    /**
     * Handle CREATE operation
     */
    protected abstract void handleCreate(K key, V message);

    /**
     * Handle UPDATE operation
     */
    protected abstract void handleUpdate(K key, V message);

    /**
     * Handle DELETE operation
     */
    protected abstract void handleDelete(K key, V message);

    /**
     * Handle READ operation (optional, có thể override nếu cần)
     */
    protected void handleRead(K key, V message) {
        log.debug("READ operation for key: {}, message: {}", key, message);
        // Default implementation - do nothing
    }
}
