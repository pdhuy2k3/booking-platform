import type { Flight, FlightSchedule } from "@/types/api"

/**
 * Calculate duration in minutes between two datetime strings
 */
export function calculateDurationMinutes(departureTime: string, arrivalTime: string): number {
  const departure = new Date(departureTime)
  const arrival = new Date(arrivalTime)
  return Math.round((arrival.getTime() - departure.getTime()) / (1000 * 60))
}

/**
 * Format duration from minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours === 0) {
    return `${remainingMinutes}m`
  } else if (remainingMinutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${remainingMinutes}m`
  }
}

/**
 * Calculate average duration from flight schedules
 */
export function calculateAverageDuration(schedules: FlightSchedule[]): number | null {
  if (!schedules || schedules.length === 0) return null
  
  const durations = schedules
    .filter(schedule => schedule.departureTime && schedule.arrivalTime)
    .map(schedule => calculateDurationMinutes(schedule.departureTime, schedule.arrivalTime))
  
  if (durations.length === 0) return null
  
  return Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
}

/**
 * Calculate duration range from flight schedules
 */
export function calculateDurationRange(schedules: FlightSchedule[]): { min: number; max: number } | null {
  if (!schedules || schedules.length === 0) return null
  
  const durations = schedules
    .filter(schedule => schedule.departureTime && schedule.arrivalTime)
    .map(schedule => calculateDurationMinutes(schedule.departureTime, schedule.arrivalTime))
  
  if (durations.length === 0) return null
  
  return {
    min: Math.min(...durations),
    max: Math.max(...durations)
  }
}

/**
 * Get duration display text for flight
 */
export function getFlightDurationDisplay(flight: Flight): string {
  if (!flight.schedules || flight.schedules.length === 0) {
    return 'N/A'
  }
  
  const averageDuration = calculateAverageDuration(flight.schedules)
  if (!averageDuration) return 'N/A'
  
  return formatDuration(averageDuration)
}

/**
 * Get duration range display text for flight
 */
export function getFlightDurationRangeDisplay(flight: Flight): string {
  if (!flight.schedules || flight.schedules.length === 0) {
    return 'N/A'
  }
  
  const range = calculateDurationRange(flight.schedules)
  if (!range) return 'N/A'
  
  if (range.min === range.max) {
    return formatDuration(range.min)
  }
  
  return `${formatDuration(range.min)} - ${formatDuration(range.max)}`
}
