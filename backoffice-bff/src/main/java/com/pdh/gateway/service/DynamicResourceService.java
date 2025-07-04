package com.pdh.gateway.service;

import com.pdh.gateway.config.ServiceResourceProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DynamicResourceService {

    private final ServiceResourceProperties serviceResourceProperties;

    @Autowired
    public DynamicResourceService(ServiceResourceProperties serviceResourceProperties) {
        this.serviceResourceProperties = serviceResourceProperties;
    }

    public String getResourceUrl(String requestPath) {
        // Nếu không sử dụng dynamic mapping, dùng static mapping
        if (!serviceResourceProperties.isUseDynamicMapping()) {
            return getStaticResourceUrl(requestPath);
        }

        // Tạo resource URL động từ base URL + path
        String dynamicResource = getDynamicResourceUrl(requestPath);
        if (dynamicResource != null) {
            return dynamicResource;
        }

        // Fallback to static mapping
        return getStaticResourceUrl(requestPath);
    }

    private String getDynamicResourceUrl(String requestPath) {
        String baseUrl = serviceResourceProperties.getBaseUrl();
        if (baseUrl == null || baseUrl.isEmpty()) {
            return null;
        }

        // Tìm service path pattern từ request path
        // Ví dụ: /api/flight-service/flights -> /api/flight-service
        String servicePath = extractServicePath(requestPath);
        if (servicePath != null) {
            // Tạo resource URL: baseUrl + servicePath
            return baseUrl + servicePath;
        }

        return null;
    }

    private String extractServicePath(String requestPath) {
        // Pattern: /api/{service-name}/... -> /api/{service-name}
        if (requestPath.startsWith("/api/")) {
            String[] pathSegments = requestPath.split("/");
            if (pathSegments.length >= 3) {
                // pathSegments[0] = "", pathSegments[1] = "api", pathSegments[2] = "service-name"
                return "/api/" + pathSegments[2];
            }
        }
        return null;
    }

    private String getStaticResourceUrl(String requestPath) {
        Map<String, String> mapping = serviceResourceProperties.getMapping();

        if (mapping != null) {
            for (Map.Entry<String, String> entry : mapping.entrySet()) {
                if (requestPath.startsWith(entry.getKey())) {
                    return entry.getValue();
                }
            }
        }

        // Fallback to default resource
        return serviceResourceProperties.getDefaultResource() != null
            ? serviceResourceProperties.getDefaultResource()
            : "https://api.bookingsmart.huypd.me";
    }
}
