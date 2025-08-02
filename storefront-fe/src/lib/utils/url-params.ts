import { FlightSearchRequest } from "@/types/api/flight";
import { SearchFilters } from "@/types/api/common";

// URL parameter keys
export const URL_PARAMS = {
  // Search parameters
  ORIGIN: "from",
  DESTINATION: "to", 
  DEPARTURE_DATE: "depart",
  RETURN_DATE: "return",
  ADULTS: "adults",
  CHILDREN: "children",
  INFANTS: "infants",
  CLASS: "class",
  TRIP_TYPE: "type",
  
  // Filter parameters
  PRICE_MIN: "priceMin",
  PRICE_MAX: "priceMax",
  DURATION_MIN: "durationMin",
  DURATION_MAX: "durationMax",
  STOPS: "stops",
  AIRLINES: "airlines",
  DEPARTURE_TIME_EARLIEST: "departEarliest",
  DEPARTURE_TIME_LATEST: "departLatest",
  ARRIVAL_TIME_EARLIEST: "arriveEarliest",
  ARRIVAL_TIME_LATEST: "arriveLatest",
  SORT: "sort",
  PAGE: "page",
} as const;

/**
 * Serialize flight search request to URL search parameters
 */
export function serializeSearchToParams(search: FlightSearchRequest): URLSearchParams {
  const params = new URLSearchParams();
  
  if (search.origin) params.set(URL_PARAMS.ORIGIN, encodeURIComponent(search.origin));
  if (search.destination) params.set(URL_PARAMS.DESTINATION, encodeURIComponent(search.destination));
  if (search.departureDate) params.set(URL_PARAMS.DEPARTURE_DATE, search.departureDate);
  if (search.returnDate) params.set(URL_PARAMS.RETURN_DATE, search.returnDate);
  
  params.set(URL_PARAMS.ADULTS, search.passengers.adults.toString());
  params.set(URL_PARAMS.CHILDREN, search.passengers.children.toString());
  params.set(URL_PARAMS.INFANTS, search.passengers.infants.toString());
  
  params.set(URL_PARAMS.CLASS, search.class);
  params.set(URL_PARAMS.TRIP_TYPE, search.tripType);
  
  return params;
}

/**
 * Deserialize URL search parameters to flight search request
 */
export function deserializeSearchFromParams(searchParams: URLSearchParams): Partial<FlightSearchRequest> {
  const search: Partial<FlightSearchRequest> = {
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    class: "economy",
    tripType: "round-trip",
  };
  
  const origin = searchParams.get(URL_PARAMS.ORIGIN);
  if (origin) search.origin = decodeURIComponent(origin);
  
  const destination = searchParams.get(URL_PARAMS.DESTINATION);
  if (destination) search.destination = decodeURIComponent(destination);
  
  const departureDate = searchParams.get(URL_PARAMS.DEPARTURE_DATE);
  if (departureDate) search.departureDate = departureDate;
  
  const returnDate = searchParams.get(URL_PARAMS.RETURN_DATE);
  if (returnDate) search.returnDate = returnDate;
  
  const adults = searchParams.get(URL_PARAMS.ADULTS);
  if (adults && !isNaN(Number(adults))) {
    search.passengers!.adults = Math.max(1, Math.min(9, Number(adults)));
  }
  
  const children = searchParams.get(URL_PARAMS.CHILDREN);
  if (children && !isNaN(Number(children))) {
    search.passengers!.children = Math.max(0, Math.min(9, Number(children)));
  }
  
  const infants = searchParams.get(URL_PARAMS.INFANTS);
  if (infants && !isNaN(Number(infants))) {
    search.passengers!.infants = Math.max(0, Math.min(9, Number(infants)));
  }
  
  const travelClass = searchParams.get(URL_PARAMS.CLASS);
  if (travelClass && ["economy", "premium-economy", "business", "first"].includes(travelClass)) {
    search.class = travelClass as FlightSearchRequest["class"];
  }
  
  const tripType = searchParams.get(URL_PARAMS.TRIP_TYPE);
  if (tripType && ["one-way", "round-trip"].includes(tripType)) {
    search.tripType = tripType as FlightSearchRequest["tripType"];
  }
  
  return search;
}

/**
 * Serialize search filters to URL search parameters
 */
export function serializeFiltersToParams(filters: SearchFilters, sort?: string, page?: number): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.priceRange) {
    if (filters.priceRange.min !== undefined) {
      params.set(URL_PARAMS.PRICE_MIN, filters.priceRange.min.toString());
    }
    if (filters.priceRange.max !== undefined) {
      params.set(URL_PARAMS.PRICE_MAX, filters.priceRange.max.toString());
    }
  }
  
  if (filters.duration) {
    if (filters.duration.min !== undefined) {
      params.set(URL_PARAMS.DURATION_MIN, filters.duration.min.toString());
    }
    if (filters.duration.max !== undefined) {
      params.set(URL_PARAMS.DURATION_MAX, filters.duration.max.toString());
    }
  }
  
  if (filters.stops && filters.stops.length > 0) {
    params.set(URL_PARAMS.STOPS, filters.stops.join(","));
  }
  
  if (filters.airlines && filters.airlines.length > 0) {
    params.set(URL_PARAMS.AIRLINES, filters.airlines.map(encodeURIComponent).join(","));
  }
  
  if (filters.departureTime) {
    if (filters.departureTime.earliest) {
      params.set(URL_PARAMS.DEPARTURE_TIME_EARLIEST, filters.departureTime.earliest);
    }
    if (filters.departureTime.latest) {
      params.set(URL_PARAMS.DEPARTURE_TIME_LATEST, filters.departureTime.latest);
    }
  }
  
  if (filters.arrivalTime) {
    if (filters.arrivalTime.earliest) {
      params.set(URL_PARAMS.ARRIVAL_TIME_EARLIEST, filters.arrivalTime.earliest);
    }
    if (filters.arrivalTime.latest) {
      params.set(URL_PARAMS.ARRIVAL_TIME_LATEST, filters.arrivalTime.latest);
    }
  }
  
  if (sort) {
    params.set(URL_PARAMS.SORT, sort);
  }
  
  if (page && page > 1) {
    params.set(URL_PARAMS.PAGE, page.toString());
  }
  
  return params;
}

/**
 * Deserialize URL search parameters to search filters
 */
export function deserializeFiltersFromParams(searchParams: URLSearchParams): {
  filters: SearchFilters;
  sort?: string;
  page: number;
} {
  const filters: SearchFilters = {};
  
  const priceMin = searchParams.get(URL_PARAMS.PRICE_MIN);
  const priceMax = searchParams.get(URL_PARAMS.PRICE_MAX);
  if (priceMin || priceMax) {
    filters.priceRange = {};
    if (priceMin && !isNaN(Number(priceMin))) {
      filters.priceRange.min = Number(priceMin);
    }
    if (priceMax && !isNaN(Number(priceMax))) {
      filters.priceRange.max = Number(priceMax);
    }
  }
  
  const durationMin = searchParams.get(URL_PARAMS.DURATION_MIN);
  const durationMax = searchParams.get(URL_PARAMS.DURATION_MAX);
  if (durationMin || durationMax) {
    filters.duration = {};
    if (durationMin && !isNaN(Number(durationMin))) {
      filters.duration.min = Number(durationMin);
    }
    if (durationMax && !isNaN(Number(durationMax))) {
      filters.duration.max = Number(durationMax);
    }
  }
  
  const stops = searchParams.get(URL_PARAMS.STOPS);
  if (stops) {
    filters.stops = stops.split(",").map(Number).filter(n => !isNaN(n));
  }
  
  const airlines = searchParams.get(URL_PARAMS.AIRLINES);
  if (airlines) {
    filters.airlines = airlines.split(",").map(decodeURIComponent);
  }
  
  const departEarliest = searchParams.get(URL_PARAMS.DEPARTURE_TIME_EARLIEST);
  const departLatest = searchParams.get(URL_PARAMS.DEPARTURE_TIME_LATEST);
  if (departEarliest || departLatest) {
    filters.departureTime = {};
    if (departEarliest) filters.departureTime.earliest = departEarliest;
    if (departLatest) filters.departureTime.latest = departLatest;
  }
  
  const arriveEarliest = searchParams.get(URL_PARAMS.ARRIVAL_TIME_EARLIEST);
  const arriveLatest = searchParams.get(URL_PARAMS.ARRIVAL_TIME_LATEST);
  if (arriveEarliest || arriveLatest) {
    filters.arrivalTime = {};
    if (arriveEarliest) filters.arrivalTime.earliest = arriveEarliest;
    if (arriveLatest) filters.arrivalTime.latest = arriveLatest;
  }
  
  const sort = searchParams.get(URL_PARAMS.SORT) || undefined;
  const page = Number(searchParams.get(URL_PARAMS.PAGE)) || 1;
  
  return { filters, sort, page };
}

/**
 * Merge URL parameters without losing existing ones
 */
export function mergeUrlParams(
  currentParams: URLSearchParams,
  newParams: URLSearchParams
): URLSearchParams {
  const merged = new URLSearchParams(currentParams);
  
  for (const [key, value] of newParams.entries()) {
    merged.set(key, value);
  }
  
  return merged;
}

/**
 * Check if search parameters are valid for performing a search
 */
export function isValidSearchParams(search: Partial<FlightSearchRequest>): search is FlightSearchRequest {
  return !!(
    search.origin &&
    search.destination &&
    search.departureDate &&
    search.passengers &&
    search.class &&
    search.tripType
  );
}
