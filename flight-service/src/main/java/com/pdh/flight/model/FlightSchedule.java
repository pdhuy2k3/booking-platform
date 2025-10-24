package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.flight.model.enums.ScheduleStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "flight_schedules")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class FlightSchedule extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "schedule_id")
    private UUID scheduleId;

    @Column(name = "flight_id", nullable = false)
    @NotNull(message = "Flight ID is required")
    private Long flightId;

    @Column(name = "departure_time", nullable = false)
    @NotNull(message = "Departure time is required")
    @Future(message = "Departure time must be in the future")
    private ZonedDateTime departureTime;

    @Column(name = "arrival_time", nullable = false)
    @NotNull(message = "Arrival time is required")
    @Future(message = "Arrival time must be in the future")
    private ZonedDateTime arrivalTime;

    @Column(name = "aircraft_type", length = 100)
    private String aircraftType;

    @Column(name = "aircraft_id")
    private Long aircraftId;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status is required")
    private ScheduleStatus status = ScheduleStatus.SCHEDULED;

    // Reference entities   
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", insertable = false, updatable = false)
    private Flight flight;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aircraft_id", insertable = false, updatable = false)
    private Aircraft aircraft;
    
    @OneToMany(mappedBy = "flightSchedule", fetch = FetchType.LAZY)
    private Set<FlightFare> flightFares;
    // Validation methods
    @AssertTrue(message = "Arrival time must be after departure time")
    public boolean isArrivalTimeAfterDepartureTime() {
        if (departureTime == null || arrivalTime == null) {
            return true; // Let @NotNull handle null validation
        }
        return arrivalTime.isAfter(departureTime);
    }
    
    @AssertTrue(message = "Flight duration must be reasonable (between 30 minutes and 20 hours)")
    public boolean isReasonableFlightDuration() {
        if (departureTime == null || arrivalTime == null) {
            return true; // Let @NotNull handle null validation
        }
        long durationMinutes = java.time.Duration.between(departureTime, arrivalTime).toMinutes();
        return durationMinutes >= 30 && durationMinutes <= 1200; // 30 minutes to 20 hours
    }
}
