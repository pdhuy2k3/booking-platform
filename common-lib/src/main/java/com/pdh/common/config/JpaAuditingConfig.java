package com.pdh.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing Configuration
 * Enables automatic auditing of JPA entities
 */
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
}