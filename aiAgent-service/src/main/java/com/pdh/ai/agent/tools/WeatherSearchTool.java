package com.pdh.ai.agent.tools;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Weather search tool that integrates with Open Meteo API
 * Provides current weather and forecast data for locations
 */
@Component
public class WeatherSearchTool implements Function<WeatherSearchTool.WeatherRequest, WeatherSearchTool.WeatherResponse> {

    private final RestTemplate restTemplate;
    private static final String OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1";

    public WeatherSearchTool() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public WeatherResponse apply(WeatherRequest request) {
        try {
            // Validate required fields
            if (request.latitude() == 0.0 && request.longitude() == 0.0 && 
                (request.locationName() == null || request.locationName().trim().isEmpty())) {
                return new WeatherResponse(
                    0.0, 0.0, "Asia/Ho_Chi_Minh", null, List.of(), List.of(),
                    "Error: Either coordinates (latitude, longitude) or location name is required"
                );
            }

            // Build URL for Open Meteo API
            StringBuilder urlBuilder = new StringBuilder(OPEN_METEO_BASE_URL)
                    .append("/forecast")
                    .append("?latitude=").append(request.latitude())
                    .append("&longitude=").append(request.longitude())
                    .append("&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m")
                    .append("&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_1cm,soil_moisture_1_3cm,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_moisture_27_81cm")
                    .append("&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration")
                    .append("&timezone=").append(request.timezone() != null ? request.timezone() : "Asia/Ho_Chi_Minh");

            // Add date range if provided
            if (request.startDate() != null && !request.startDate().isEmpty()) {
                urlBuilder.append("&start_date=").append(request.startDate());
            }
            if (request.endDate() != null && !request.endDate().isEmpty()) {
                urlBuilder.append("&end_date=").append(request.endDate());
            }

            // Make API call
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(urlBuilder.toString(), Map.class);
            
            if (response == null) {
                return new WeatherResponse(
                    request.latitude(), request.longitude(), 
                    request.timezone() != null ? request.timezone() : "Asia/Ho_Chi_Minh",
                    null, List.of(), List.of(),
                    "Error: No response from weather service"
                );
            }
            
            // Format response for AI consumption
            return formatWeatherResponse(response, request);
            
        } catch (Exception e) {
            return new WeatherResponse(
                request.latitude(),
                request.longitude(),
                request.timezone() != null ? request.timezone() : "Asia/Ho_Chi_Minh",
                null,
                List.of(),
                List.of(),
                "Failed to fetch weather data: " + e.getMessage()
            );
        }
    }

    @SuppressWarnings("unchecked")
    private WeatherResponse formatWeatherResponse(Map<String, Object> apiResponse, WeatherRequest request) {
        try {
            Map<String, Object> current = (Map<String, Object>) apiResponse.get("current");
            Map<String, Object> daily = (Map<String, Object>) apiResponse.get("daily");
            Map<String, Object> hourly = (Map<String, Object>) apiResponse.get("hourly");

            CurrentWeather currentWeather = null;
            if (current != null) {
                currentWeather = new CurrentWeather(
                        (String) current.get("time"),
                        (Double) current.get("temperature_2m"),
                        (Double) current.get("apparent_temperature"),
                        (Double) current.get("relative_humidity_2m"),
                        (Double) current.get("precipitation"),
                        (Double) current.get("wind_speed_10m"),
                        (Double) current.get("wind_direction_10m"),
                        (Integer) current.get("weather_code"),
                        (Double) current.get("cloud_cover"),
                        getWeatherDescription((Integer) current.get("weather_code"))
                );
            }

            return new WeatherResponse(
                    request.latitude(),
                    request.longitude(),
                    request.timezone() != null ? request.timezone() : "Asia/Ho_Chi_Minh",
                    currentWeather,
                    formatDailyForecast(daily),
                    formatHourlyForecast(hourly),
                    null
            );
        } catch (Exception e) {
            return new WeatherResponse(
                request.latitude(),
                request.longitude(),
                request.timezone() != null ? request.timezone() : "Asia/Ho_Chi_Minh",
                null,
                List.of(),
                List.of(),
                "Failed to format weather response: " + e.getMessage()
            );
        }
    }

    @SuppressWarnings("unchecked")
    private List<DailyForecast> formatDailyForecast(Map<String, Object> daily) {
        if (daily == null) return List.of();
        
        List<String> times = (List<String>) daily.get("time");
        List<Double> maxTemps = (List<Double>) daily.get("temperature_2m_max");
        List<Double> minTemps = (List<Double>) daily.get("temperature_2m_min");
        List<Double> precipitationSum = (List<Double>) daily.get("precipitation_sum");
        List<Integer> weatherCodes = (List<Integer>) daily.get("weather_code");

        if (times == null) return List.of();

        return times.stream()
                .limit(7) // Limit to 7 days for brevity
                .map(time -> {
                    int index = times.indexOf(time);
                    return new DailyForecast(
                            time,
                            maxTemps != null && index < maxTemps.size() ? maxTemps.get(index) : null,
                            minTemps != null && index < minTemps.size() ? minTemps.get(index) : null,
                            precipitationSum != null && index < precipitationSum.size() ? precipitationSum.get(index) : null,
                            weatherCodes != null && index < weatherCodes.size() ? weatherCodes.get(index) : null,
                            weatherCodes != null && index < weatherCodes.size() ? 
                                getWeatherDescription(weatherCodes.get(index)) : null
                    );
                })
                .toList();
    }

    @SuppressWarnings("unchecked")
    private List<HourlyForecast> formatHourlyForecast(Map<String, Object> hourly) {
        if (hourly == null) return List.of();
        
        List<String> times = (List<String>) hourly.get("time");
        List<Double> temperatures = (List<Double>) hourly.get("temperature_2m");
        List<Double> precipitation = (List<Double>) hourly.get("precipitation");
        List<Integer> weatherCodes = (List<Integer>) hourly.get("weather_code");

        if (times == null) return List.of();

        return times.stream()
                .limit(24) // Limit to next 24 hours for brevity
                .map(time -> {
                    int index = times.indexOf(time);
                    return new HourlyForecast(
                            time,
                            temperatures != null && index < temperatures.size() ? temperatures.get(index) : null,
                            precipitation != null && index < precipitation.size() ? precipitation.get(index) : null,
                            weatherCodes != null && index < weatherCodes.size() ? weatherCodes.get(index) : null
                    );
                })
                .toList();
    }

    private String getWeatherDescription(Integer weatherCode) {
        if (weatherCode == null) return "Unknown";
        
        return switch (weatherCode) {
            case 0 -> "Clear sky";
            case 1, 2, 3 -> "Mainly clear, partly cloudy, and overcast";
            case 45, 48 -> "Fog and depositing rime fog";
            case 51, 53, 55 -> "Drizzle: Light, moderate, and dense intensity";
            case 56, 57 -> "Freezing Drizzle: Light and dense intensity";
            case 61, 63, 65 -> "Rain: Slight, moderate and heavy intensity";
            case 66, 67 -> "Freezing Rain: Light and heavy intensity";
            case 71, 73, 75 -> "Snow fall: Slight, moderate, and heavy intensity";
            case 77 -> "Snow grains";
            case 80, 81, 82 -> "Rain showers: Slight, moderate, and violent";
            case 85, 86 -> "Snow showers slight and heavy";
            case 95 -> "Thunderstorm: Slight or moderate";
            case 96, 99 -> "Thunderstorm with slight and heavy hail";
            default -> "Unknown weather condition";
        };
    }

    // Request DTO
    public record WeatherRequest(
            @JsonProperty("latitude")
            @JsonPropertyDescription("Latitude coordinate for the location (required if location_name not provided)")
            double latitude,
            
            @JsonProperty("longitude") 
            @JsonPropertyDescription("Longitude coordinate for the location (required if location_name not provided)")
            double longitude,
            
            @JsonProperty("start_date")
            @JsonPropertyDescription("Start date for weather data in YYYY-MM-DD format (optional). If not provided, returns current weather")
            String startDate,
            
            @JsonProperty("end_date")
            @JsonPropertyDescription("End date for weather data in YYYY-MM-DD format (optional). If not provided, returns forecast for next 7 days")  
            String endDate,
            
            @JsonProperty("location_name")
            @JsonPropertyDescription("Human readable location name for context (required if coordinates not provided). Examples: 'Ho Chi Minh City', 'Paris', 'New York'")
            String locationName,
            
            @JsonProperty("timezone")
            @JsonPropertyDescription("Timezone for the weather data (optional). Default is 'Asia/Ho_Chi_Minh'. Examples: 'Asia/Ho_Chi_Minh', 'Europe/Paris', 'America/New_York'")
            String timezone
    ) {}

    // Response DTOs
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record WeatherResponse(
            double latitude,
            double longitude,
            String timezone,
            CurrentWeather current,
            List<DailyForecast> daily,
            List<HourlyForecast> hourly,
            String error
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CurrentWeather(
            String time,
            Double temperature,
            Double apparentTemperature,
            Double humidity,
            Double precipitation,
            Double windSpeed,
            Double windDirection,
            Integer weatherCode,
            Double cloudCover,
            String description
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record DailyForecast(
            String date,
            Double maxTemperature,
            Double minTemperature,
            Double precipitationSum,
            Integer weatherCode,
            String description
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record HourlyForecast(
            String time,
            Double temperature,
            Double precipitation,
            Integer weatherCode
    ) {}
}