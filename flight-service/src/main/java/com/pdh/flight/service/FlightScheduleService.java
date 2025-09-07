package com.pdh.flight.service;

import com.pdh.flight.dto.response.FlightScheduleDto;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.repository.FlightScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing flight schedules
 * Handles schedule queries and operations for flights
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightScheduleService {
    
    private final FlightScheduleRepository flightScheduleRepository;
    
    /**
     * Get all schedules for a specific flight
     * 
     * @param flightId The flight ID
     * @return List of FlightScheduleDto
     */
    @Transactional(readOnly = true)
    public List<FlightScheduleDto> getSchedulesByFlightId(Long flightId) {
        log.debug("Fetching schedules for flight ID: {}", flightId);
        
        List<FlightSchedule> schedules = flightScheduleRepository.findByFlightId(flightId);
        return schedules.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get schedules for multiple flights (optimized for batch operations)
     * 
     * @param flightIds List of flight IDs
     * @return Map of flight ID to list of schedules
     */
    @Transactional(readOnly = true)
    public Map<Long, List<FlightScheduleDto>> getSchedulesByFlightIds(List<Long> flightIds) {
        log.debug("Fetching schedules for {} flights", flightIds.size());
        
        List<FlightSchedule> schedules = flightScheduleRepository.findByFlightIdIn(flightIds);
        
        return schedules.stream()
                .collect(Collectors.groupingBy(
                        FlightSchedule::getFlightId,
                        Collectors.mapping(this::toDto, Collectors.toList())
                ));
    }
    
    /**
     * Get schedules for a flight on a specific date
     * 
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return List of FlightScheduleDto
     */
    @Transactional(readOnly = true)
    public List<FlightScheduleDto> getSchedulesByFlightIdAndDate(Long flightId, LocalDate departureDate) {
        log.debug("Fetching schedules for flight ID: {} on date: {}", flightId, departureDate);
        
        List<FlightSchedule> schedules = flightScheduleRepository.findByFlightIdAndDate(flightId, departureDate);
        return schedules.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get active schedules for a flight
     * 
     * @param flightId The flight ID
     * @return List of active FlightScheduleDto
     */
    @Transactional(readOnly = true)
    public List<FlightScheduleDto> getActiveSchedulesByFlightId(Long flightId) {
        log.debug("Fetching active schedules for flight ID: {}", flightId);
        
        List<FlightSchedule> schedules = flightScheduleRepository.findActiveByFlightId(flightId);
        return schedules.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get schedule statistics for a flight
     * 
     * @param flightId The flight ID
     * @return Map with total and active schedule counts
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getScheduleStatistics(Long flightId) {
        log.debug("Fetching schedule statistics for flight ID: {}", flightId);
        
        Long totalSchedules = flightScheduleRepository.countByFlightId(flightId);
        Long activeSchedules = flightScheduleRepository.countByFlightIdAndStatus(flightId, "ACTIVE");
        
        return Map.of(
                "totalSchedules", totalSchedules,
                "activeSchedules", activeSchedules
        );
    }
    
    /**
     * Convert FlightSchedule entity to DTO
     */
    private FlightScheduleDto toDto(FlightSchedule schedule) {
        return FlightScheduleDto.builder()
                .scheduleId(schedule.getScheduleId())
                .flightId(schedule.getFlightId())
                .departureTime(schedule.getDepartureTime())
                .arrivalTime(schedule.getArrivalTime())
                .aircraftType(schedule.getAircraftType())
                .status(schedule.getStatus())
                .build();
    }
}
