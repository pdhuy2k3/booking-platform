package com.pdh.gateway.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@ConfigurationProperties(prefix = "gateway.service-resources")
public class ServiceResourceProperties {

    private Map<String, String> mapping;
    private String defaultResource;
    private String baseUrl;
    private boolean useDynamicMapping = true;

    public Map<String, String> getMapping() {
        return mapping;
    }

    public void setMapping(Map<String, String> mapping) {
        this.mapping = mapping;
    }

    public String getDefaultResource() {
        return defaultResource;
    }

    public void setDefaultResource(String defaultResource) {
        this.defaultResource = defaultResource;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public boolean isUseDynamicMapping() {
        return useDynamicMapping;
    }

    public void setUseDynamicMapping(boolean useDynamicMapping) {
        this.useDynamicMapping = useDynamicMapping;
    }
}
