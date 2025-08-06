package com.pdh.booking.repository;

import com.pdh.booking.model.SagaStateLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface SagaStateLogRepository extends JpaRepository<SagaStateLog, Long> {
    List<SagaStateLog> findBySagaIdOrderByCreatedAtDesc(String sagaId);
    List<SagaStateLog> findByBookingIdOrderByCreatedAtDesc(String bookingId);
}
