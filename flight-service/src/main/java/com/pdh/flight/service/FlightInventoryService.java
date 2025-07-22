package com.pdh.flight.service;

import com.pdh.flight.model.FlightInventory;
import com.pdh.flight.model.FlightLeg;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightInventoryRepository;
import com.pdh.flight.repository.FlightLegRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing flight inventory and seat reservations
 * Handles seat availability, reservations, and releases for flight bookings
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightInventoryService {

    private final FlightInventoryRepository flightInventoryRepository;
    private final FlightLegRepository flightLegRepository;

    /**
     * Reserve seats for a flight booking
     * 
     * @param flightId The flight ID
     * @param seatClass The seat class (ECONOMY, BUSINESS, FIRST)
     * @param passengerCount Number of passengers
     * @param departureDate Departure date
     * @return true if reservation successful, false otherwise
     */
    @Transactional
    public boolean reserveSeats(Long flightId, String seatClass, Integer passengerCount, LocalDate departureDate) {
        log.info("Attempting to reserve {} seats for flight {} in {} class on {}", 
                passengerCount, flightId, seatClass, departureDate);
        
        try {
            // Find flight legs for the given flight and date
            List<FlightLeg> flightLegs = flightLegRepository.findByFlightIdAndDepartureDate(flightId, departureDate);
            
            if (flightLegs.isEmpty()) {
                log.warn("No flight legs found for flight {} on date {}", flightId, departureDate);
                return false;
            }
            
            FareClass fareClass = FareClass.valueOf(seatClass.toUpperCase());
            
            // Check and reserve inventory for each flight leg
            for (FlightLeg flightLeg : flightLegs) {
                Optional<FlightInventory> inventoryOpt = flightInventoryRepository
                    .findByFlightLegIdAndFareClass(flightLeg.getLegId(), fareClass);
                
                if (inventoryOpt.isEmpty()) {
                    log.warn("No inventory found for flight leg {} and fare class {}",
                            flightLeg.getLegId(), fareClass);
                    return false;
                }

                FlightInventory inventory = inventoryOpt.get();

                // Check availability
                int availableSeats = inventory.getTotalSeats() - inventory.getReservedSeats();
                if (availableSeats < passengerCount) {
                    log.warn("Insufficient seats available. Required: {}, Available: {}",
                            passengerCount, availableSeats);
                    return false;
                }

                // Reserve seats
                inventory.setReservedSeats((short) (inventory.getReservedSeats() + passengerCount));
                flightInventoryRepository.save(inventory);

                log.info("Reserved {} seats for flight leg {} in {} class",
                        passengerCount, flightLeg.getLegId(), fareClass);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error reserving seats for flight {}: {}", flightId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Release seats for a flight booking (compensation action)
     * 
     * @param flightId The flight ID
     * @param seatClass The seat class
     * @param passengerCount Number of passengers
     * @param departureDate Departure date
     */
    @Transactional
    public void releaseSeats(Long flightId, String seatClass, Integer passengerCount, LocalDate departureDate) {
        log.info("Releasing {} seats for flight {} in {} class on {}", 
                passengerCount, flightId, seatClass, departureDate);
        
        try {
            // Find flight legs for the given flight and date
            List<FlightLeg> flightLegs = flightLegRepository.findByFlightIdAndDepartureDate(flightId, departureDate);
            
            if (flightLegs.isEmpty()) {
                log.warn("No flight legs found for flight {} on date {}", flightId, departureDate);
                return;
            }
            
            FareClass fareClass = FareClass.valueOf(seatClass.toUpperCase());
            
            // Release inventory for each flight leg
            for (FlightLeg flightLeg : flightLegs) {
                Optional<FlightInventory> inventoryOpt = flightInventoryRepository
                    .findByFlightLegIdAndFareClass(flightLeg.getLegId(), fareClass);

                if (inventoryOpt.isPresent()) {
                    FlightInventory inventory = inventoryOpt.get();

                    // Release seats (ensure we don't go below 0)
                    int newReservedSeats = Math.max(0, inventory.getReservedSeats() - passengerCount);
                    inventory.setReservedSeats((short) newReservedSeats);
                    flightInventoryRepository.save(inventory);

                    log.info("Released {} seats for flight leg {} in {} class",
                            passengerCount, flightLeg.getLegId(), fareClass);
                } else {
                    log.warn("No inventory found for flight leg {} and fare class {}",
                            flightLeg.getLegId(), fareClass);
                }
            }
            
        } catch (Exception e) {
            log.error("Error releasing seats for flight {}: {}", flightId, e.getMessage(), e);
        }
    }

    /**
     * Check seat availability for a flight
     * 
     * @param flightId The flight ID
     * @param seatClass The seat class
     * @param passengerCount Number of passengers
     * @param departureDate Departure date
     * @return true if seats are available, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long flightId, String seatClass, Integer passengerCount, LocalDate departureDate) {
        log.debug("Checking availability for {} seats on flight {} in {} class on {}", 
                passengerCount, flightId, seatClass, departureDate);
        
        try {
            // Find flight legs for the given flight and date
            List<FlightLeg> flightLegs = flightLegRepository.findByFlightIdAndDepartureDate(flightId, departureDate);
            
            if (flightLegs.isEmpty()) {
                return false;
            }
            
            FareClass fareClass = FareClass.valueOf(seatClass.toUpperCase());
            
            // Check availability for all flight legs
            for (FlightLeg flightLeg : flightLegs) {
                Optional<FlightInventory> inventoryOpt = flightInventoryRepository
                    .findByFlightLegIdAndFareClass(flightLeg.getLegId(), fareClass);
                
                if (inventoryOpt.isEmpty()) {
                    return false;
                }
                
                FlightInventory inventory = inventoryOpt.get();
                int availableSeats = inventory.getTotalSeats() - inventory.getReservedSeats();
                
                if (availableSeats < passengerCount) {
                    return false;
                }
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error checking availability for flight {}: {}", flightId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Get available seat count for a flight and fare class
     * 
     * @param flightId The flight ID
     * @param seatClass The seat class
     * @param departureDate Departure date
     * @return Available seat count (minimum across all legs)
     */
    @Transactional(readOnly = true)
    public int getAvailableSeats(Long flightId, String seatClass, LocalDate departureDate) {
        try {
            List<FlightLeg> flightLegs = flightLegRepository.findByFlightIdAndDepartureDate(flightId, departureDate);
            
            if (flightLegs.isEmpty()) {
                return 0;
            }
            
            FareClass fareClass = FareClass.valueOf(seatClass.toUpperCase());
            int minAvailable = Integer.MAX_VALUE;
            
            for (FlightLeg flightLeg : flightLegs) {
                Optional<FlightInventory> inventoryOpt = flightInventoryRepository
                    .findByFlightLegIdAndFareClass(flightLeg.getLegId(), fareClass);
                
                if (inventoryOpt.isEmpty()) {
                    return 0;
                }
                
                FlightInventory inventory = inventoryOpt.get();
                int availableSeats = inventory.getTotalSeats() - inventory.getReservedSeats();
                minAvailable = Math.min(minAvailable, availableSeats);
            }
            
            return minAvailable == Integer.MAX_VALUE ? 0 : minAvailable;
            
        } catch (Exception e) {
            log.error("Error getting available seats for flight {}: {}", flightId, e.getMessage(), e);
            return 0;
        }
    }



    /**
     * Check if inventory is reserved for a specific flight and booking
     * This is a simplified implementation for Listen to Yourself Pattern
     */
    @Transactional(readOnly = true)
    public boolean isInventoryReserved(String flightId, String bookingId) {
        log.debug("Checking if inventory is reserved for flight {} and booking {}", flightId, bookingId);

        try {
            Long flightIdLong = Long.parseLong(flightId);

            // Find flight legs for the given flight
            List<FlightLeg> flightLegs = flightLegRepository.findByFlightIdOrderByLegNumber(flightIdLong);

            if (flightLegs.isEmpty()) {
                log.debug("No flight legs found for flight {}", flightId);
                return false;
            }

            // Check if any inventory has reservations
            for (FlightLeg flightLeg : flightLegs) {
                List<FlightInventory> inventories = flightInventoryRepository.findByFlightLegId(flightLeg.getLegId());

                for (FlightInventory inventory : inventories) {
                    if (inventory.getReservedSeats() > 0) {
                        log.debug("Found reservations for flight leg {} in {} class: {} seats",
                                flightLeg.getLegId(), inventory.getFareClass(), inventory.getReservedSeats());
                        return true;
                    }
                }
            }

            log.debug("No reservations found for flight {}", flightId);
            return false;

        } catch (Exception e) {
            log.error("Error checking inventory reservation for flight {} and booking {}", flightId, bookingId, e);
            return false;
        }
    }

    /**
     * Check if flight has any reservations
     */
    @Transactional(readOnly = true)
    public boolean hasAnyReservation(String flightId) {
        log.debug("Checking if flight {} has any reservations", flightId);

        try {
            Long flightIdLong = Long.parseLong(flightId);

            // Find flight legs for the given flight
            List<FlightLeg> flightLegs = flightLegRepository.findByFlightIdOrderByLegNumber(flightIdLong);

            if (flightLegs.isEmpty()) {
                log.debug("No flight legs found for flight {}", flightId);
                return false;
            }

            // Check if any inventory has reservations
            for (FlightLeg flightLeg : flightLegs) {
                List<FlightInventory> inventories = flightInventoryRepository.findByFlightLegId(flightLeg.getLegId());

                for (FlightInventory inventory : inventories) {
                    if (inventory.getReservedSeats() > 0) {
                        log.debug("Found reservations for flight leg {} in {} class: {} seats",
                                flightLeg.getLegId(), inventory.getFareClass(), inventory.getReservedSeats());
                        return true;
                    }
                }
            }

            log.debug("No reservations found for flight {}", flightId);
            return false;

        } catch (Exception e) {
            log.error("Error checking reservations for flight {}", flightId, e);
            return false;
        }
    }
}
