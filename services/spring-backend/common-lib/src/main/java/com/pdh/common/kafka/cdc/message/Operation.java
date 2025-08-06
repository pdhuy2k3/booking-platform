package com.pdh.common.kafka.cdc.message;

/**
 * Operation types for CDC messages
 */
public enum Operation {
    CREATE("c"),
    UPDATE("u"), 
    DELETE("d"),
    READ("r");
    
    private final String value;
    
    Operation(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
