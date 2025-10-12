package com.pdh.notification.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.notification.service.NotificationService;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final OutboxEventService eventPublisher;
    private final JavaMailSender mailSender;
    private final Configuration freemarkerConfiguration;
    private final ObjectMapper objectMapper;

    @Value("${notification.mail.sender:no-reply@bookingsmart.local}")
    private String defaultSender;

    @Override
    @Transactional
    public boolean sendNotification(String recipientId, String type, String subject, String message, String bookingId) {
        log.info("Sending {} notification to {}: {}", type, recipientId, subject);
        try {
            sendPlainTextEmail(recipientId, subject, message);
            publishOutboxEvent("NotificationSent", Map.of(
                    "notificationId", UUID.randomUUID().toString(),
                    "recipientId", recipientId,
                    "type", type,
                    "subject", subject,
                    "message", message,
                    "bookingId", bookingId,
                    "sentTime", LocalDateTime.now().toString(),
                    "status", "sent"
            ));
            return true;
        } catch (Exception ex) {
            log.error("Failed to send notification email to {}", recipientId, ex);
            return false;
        }
    }

    @Override
    public Object getNotificationStatus(String notificationId) {
        log.info("Getting notification status for ID: {}", notificationId);
        Map<String, Object> status = new HashMap<>();
        status.put("notificationId", notificationId);
        status.put("status", "queued");
        status.put("checkedAt", LocalDateTime.now().toString());
        return status;
    }

    @Override
    @Transactional
    public void handleBookingEvent(String eventType, Map<String, Object> payload) {
        if (payload == null || payload.isEmpty()) {
            log.warn("Skipping notification for event {} due to empty payload", eventType);
            return;
        }

        String recipient = findRecipientEmail(payload, eventType);
        if (StringUtils.isBlank(recipient)) {
            log.warn("No recipient email found in booking payload for event {}", eventType);
            return;
        }

        Map<String, Object> model = new HashMap<>(payload);
        model.put("recipientEmail", recipient); // Maintain for backward compatibility
        
        // Extract contact information if available in nested structures
        Map<String, Object> contactInfo = extractContactInfo(payload, eventType);
        model.put("contact", contactInfo);
        model.put("eventType", eventType);
        model.put("formattedTotalAmount", formatCurrency(payload.get("totalAmount"), (String) payload.get("currency")));

        String template = resolveTemplate(eventType, payload);
        String subject = resolveSubject(eventType, payload);

        try {
            String body = renderTemplate(template, model);
            sendHtmlEmail(recipient, subject, body);
            publishOutboxEvent("NotificationSent", Map.of(
                    "eventType", eventType,
                    "template", template,
                    "recipient", recipient,
                    "bookingId", payload.get("bookingId"),
                    "bookingReference", payload.get("bookingReference"),
                    "sentTime", LocalDateTime.now().toString(),
                    "status", "sent"
            ));
        } catch (Exception ex) {
            log.error("Failed to send {} email for booking {}", eventType, payload.get("bookingId"), ex);
            publishOutboxEvent("NotificationFailed", Map.of(
                    "eventType", eventType,
                    "recipient", recipient,
                    "bookingId", payload.get("bookingId"),
                    "error", ex.getMessage(),
                    "sentTime", LocalDateTime.now().toString(),
                    "status", "failed"
            ));
        }
    }

    private void sendPlainTextEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        message.setFrom(defaultSender);
        mailSender.send(message);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setFrom(defaultSender);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    private String renderTemplate(String templateName, Map<String, Object> model) throws IOException, TemplateException {
        Template template = freemarkerConfiguration.getTemplate(templateName);
        try (StringWriter writer = new StringWriter()) {
            template.process(model, writer);
            return writer.toString();
        }
    }

    private void publishOutboxEvent(String eventType, Map<String, Object> payload) {
        try {
            String aggregateId = payload.getOrDefault("bookingId", UUID.randomUUID().toString()).toString();
            eventPublisher.publishEvent(eventType, "Notification", aggregateId, payload);
        } catch (Exception ex) {
            log.warn("Failed to publish notification outbox event {}", eventType, ex);
        }
    }

    private Map<String, Object> toMap(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> result = new HashMap<>();
            map.forEach((k, v) -> result.put(String.valueOf(k), v));
            return result;
        }
        try {
            return objectMapper.convertValue(value, MAP_TYPE);
        } catch (IllegalArgumentException ex) {
            log.debug("Failed to convert value to map: {}", value, ex);
            return null;
        }
    }

    private String resolveTemplate(String eventType, Map<String, Object> payload) {
        Object templateFromPayload = payload.get("emailTemplate");
        if (templateFromPayload instanceof String template && StringUtils.isNotBlank(template)) {
            return template;
        }
        return switch (eventType) {
            case "BookingPaymentSucceeded" -> "booking-payment.ftl";
            case "BookingConfirmed" -> "booking-confirmation.ftl";
            default -> "booking-generic.ftl";
        };
    }

    private String resolveSubject(String eventType, Map<String, Object> payload) {
        String bookingReference = payload.get("bookingReference") != null
                ? payload.get("bookingReference").toString()
                : String.valueOf(payload.getOrDefault("bookingId", ""));
        return switch (eventType) {
            case "BookingPaymentSucceeded" ->
                    "Payment received for booking " + bookingReference;
            case "BookingConfirmed" ->
                    "Booking confirmed - " + bookingReference;
            default ->
                    "Booking update - " + bookingReference;
        };
    }

    private String formatCurrency(Object amount, String currency) {
        BigDecimal numeric = toBigDecimal(amount);
        if (numeric == null) {
            return null;
        }
        NumberFormat format = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        format.setMaximumFractionDigits(0);
        return format.format(numeric) + (StringUtils.isNotBlank(currency) ? " " + currency : "");
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        if (value instanceof String str && StringUtils.isNotBlank(str)) {
            try {
                return new BigDecimal(str);
            } catch (NumberFormatException ignored) {
                log.debug("Unable to parse amount '{}'", str);
            }
        }
        return null;
    }

    /**
     * Extract recipient email from the event payload considering different event types and data structures
     */
    private String findRecipientEmail(Map<String, Object> payload, String eventType) {
        // First, try the original location (for backward compatibility)
        Map<String, Object> contact = toMap(payload.get("contact"));
        if (contact != null) {
            String email = (String) contact.get("email");
            if (StringUtils.isNotBlank(email)) {
                return email;
            }
        }

        // Try to find email in the root level of payload
        if (payload.containsKey("email")) {
            String email = (String) payload.get("email");
            if (StringUtils.isNotBlank(email)) {
                return email;
            }
        }

        // Handle FlightReserved, FlightReservationFailed, etc. events
        if (eventType.contains("Flight")) {
            Object flightDetails = payload.get("flightDetails");
            if (flightDetails instanceof Map) {
                Map<String, Object> flightDetailsMap = (Map<String, Object>) flightDetails;
                Object passengersObj = flightDetailsMap.get("passengers");
                if (passengersObj instanceof java.util.List) {
                    java.util.List<?> passengers = (java.util.List<?>) passengersObj;
                    if (!passengers.isEmpty() && passengers.get(0) instanceof Map) {
                        Map<String, Object> firstPassenger = (Map<String, Object>) passengers.get(0);
                        String email = (String) firstPassenger.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            return email;
                        }
                    }
                }
            }
        }

        // Handle HotelReserved, HotelReservationFailed, etc. events
        if (eventType.contains("Hotel")) {
            Object hotelDetails = payload.get("hotelDetails");
            if (hotelDetails instanceof Map) {
                Map<String, Object> hotelDetailsMap = (Map<String, Object>) hotelDetails;
                Object guestsObj = hotelDetailsMap.get("guests");
                if (guestsObj instanceof java.util.List) {
                    java.util.List<?> guests = (java.util.List<?>) guestsObj;
                    if (!guests.isEmpty() && guests.get(0) instanceof Map) {
                        Map<String, Object> firstGuest = (Map<String, Object>) guests.get(0);
                        String email = (String) firstGuest.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            return email;
                        }
                    }
                }
            }

            // Also check for guestEmail in hotel details
            if (hotelDetails instanceof Map) {
                Map<String, Object> hotelDetailsMap = (Map<String, Object>) hotelDetails;
                String guestEmail = (String) hotelDetailsMap.get("guestEmail");
                if (StringUtils.isNotBlank(guestEmail)) {
                    return guestEmail;
                }
            }
        }

        // Handle combo bookings
        if (eventType.contains("Combo")) {
            // Check for passengers in combo details
            Object comboDetails = payload.get("comboDetails");
            if (comboDetails instanceof Map) {
                Map<String, Object> comboDetailsMap = (Map<String, Object>) comboDetails;
                Object passengersObj = comboDetailsMap.get("passengers");
                if (passengersObj instanceof java.util.List) {
                    java.util.List<?> passengers = (java.util.List<?>) passengersObj;
                    if (!passengers.isEmpty() && passengers.get(0) instanceof Map) {
                        Map<String, Object> firstPassenger = (Map<String, Object>) passengers.get(0);
                        String email = (String) firstPassenger.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            return email;
                        }
                    }
                }

                // Also check for guests in hotel part of combo
                Object hotelPart = comboDetailsMap.get("hotelDetails");
                if (hotelPart instanceof Map) {
                    Map<String, Object> hotelPartMap = (Map<String, Object>) hotelPart;
                    Object guestsObj = hotelPartMap.get("guests");
                    if (guestsObj instanceof java.util.List) {
                        java.util.List<?> guests = (java.util.List<?>) guestsObj;
                        if (!guests.isEmpty() && guests.get(0) instanceof Map) {
                            Map<String, Object> firstGuest = (Map<String, Object>) guests.get(0);
                            String email = (String) firstGuest.get("email");
                            if (StringUtils.isNotBlank(email)) {
                                return email;
                            }
                        }
                    }
                }
            }
        }

        // Handle PaymentProcessed, PaymentFailed, etc. events
        if (eventType.contains("Payment")) {
            Object customerInfo = payload.get("customerInfo");
            if (customerInfo instanceof Map) {
                Map<String, Object> customerMap = (Map<String, Object>) customerInfo;
                String email = (String) customerMap.get("email");
                if (StringUtils.isNotBlank(email)) {
                    return email;
                }
            }
        }

        // Check for guest details in root payload
        Object guestDetails = payload.get("guestDetails");
        if (guestDetails instanceof Map) {
            Map<String, Object> guestMap = (Map<String, Object>) guestDetails;
            String email = (String) guestMap.get("email");
            if (StringUtils.isNotBlank(email)) {
                return email;
            }
        }

        return null;
    }
    
    /**
     * Extract contact information from the event payload considering different event types and data structures
     */
    private Map<String, Object> extractContactInfo(Map<String, Object> payload, String eventType) {
        // First, try the original location (for backward compatibility)
        Map<String, Object> contact = toMap(payload.get("contact"));
        if (contact != null) {
            String email = (String) contact.get("email");
            if (StringUtils.isNotBlank(email)) {
                return contact;
            }
        }

        // Handle FlightReserved, FlightReservationFailed, etc. events
        if (eventType.contains("Flight")) {
            Object flightDetails = payload.get("flightDetails");
            if (flightDetails instanceof Map) {
                Map<String, Object> flightDetailsMap = (Map<String, Object>) flightDetails;
                Object passengersObj = flightDetailsMap.get("passengers");
                if (passengersObj instanceof java.util.List) {
                    java.util.List<?> passengers = (java.util.List<?>) passengersObj;
                    if (!passengers.isEmpty() && passengers.get(0) instanceof Map) {
                        Map<String, Object> firstPassenger = (Map<String, Object>) passengers.get(0);
                        String email = (String) firstPassenger.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            Map<String, Object> contactInfo = new HashMap<>();
                            contactInfo.put("email", email);
                            contactInfo.put("firstName", firstPassenger.get("firstName"));
                            contactInfo.put("lastName", firstPassenger.get("lastName"));
                            String fullName = String.join(" ", 
                                (String) firstPassenger.getOrDefault("firstName", ""),
                                (String) firstPassenger.getOrDefault("lastName", "")).trim();
                            contactInfo.put("fullName", fullName);
                            return contactInfo;
                        }
                    }
                }
            }
        }

        // Handle HotelReserved, HotelReservationFailed, etc. events
        if (eventType.contains("Hotel")) {
            Object hotelDetails = payload.get("hotelDetails");
            if (hotelDetails instanceof Map) {
                Map<String, Object> hotelDetailsMap = (Map<String, Object>) hotelDetails;
                Object guestsObj = hotelDetailsMap.get("guests");
                if (guestsObj instanceof java.util.List) {
                    java.util.List<?> guests = (java.util.List<?>) guestsObj;
                    if (!guests.isEmpty() && guests.get(0) instanceof Map) {
                        Map<String, Object> firstGuest = (Map<String, Object>) guests.get(0);
                        String email = (String) firstGuest.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            Map<String, Object> contactInfo = new HashMap<>();
                            contactInfo.put("email", email);
                            contactInfo.put("firstName", firstGuest.get("firstName"));
                            contactInfo.put("lastName", firstGuest.get("lastName"));
                            String fullName = String.join(" ", 
                                (String) firstGuest.getOrDefault("firstName", ""),
                                (String) firstGuest.getOrDefault("lastName", "")).trim();
                            contactInfo.put("fullName", fullName);
                            return contactInfo;
                        }
                    }
                }
            }
        }

        // Handle combo bookings
        if (eventType.contains("Combo")) {
            // Check for passengers in combo details
            Object comboDetails = payload.get("comboDetails");
            if (comboDetails instanceof Map) {
                Map<String, Object> comboDetailsMap = (Map<String, Object>) comboDetails;
                Object passengersObj = comboDetailsMap.get("passengers");
                if (passengersObj instanceof java.util.List) {
                    java.util.List<?> passengers = (java.util.List<?>) passengersObj;
                    if (!passengers.isEmpty() && passengers.get(0) instanceof Map) {
                        Map<String, Object> firstPassenger = (Map<String, Object>) passengers.get(0);
                        String email = (String) firstPassenger.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            Map<String, Object> contactInfo = new HashMap<>();
                            contactInfo.put("email", email);
                            contactInfo.put("firstName", firstPassenger.get("firstName"));
                            contactInfo.put("lastName", firstPassenger.get("lastName"));
                            String fullName = String.join(" ", 
                                (String) firstPassenger.getOrDefault("firstName", ""),
                                (String) firstPassenger.getOrDefault("lastName", "")).trim();
                            contactInfo.put("fullName", fullName);
                            return contactInfo;
                        }
                    }
                }

                // Also check for guests in hotel part of combo
                Object hotelPart = comboDetailsMap.get("hotelDetails");
                if (hotelPart instanceof Map) {
                    Map<String, Object> hotelPartMap = (Map<String, Object>) hotelPart;
                    Object guestsObj = hotelPartMap.get("guests");
                    if (guestsObj instanceof java.util.List) {
                        java.util.List<?> guests = (java.util.List<?>) guestsObj;
                        if (!guests.isEmpty() && guests.get(0) instanceof Map) {
                            Map<String, Object> firstGuest = (Map<String, Object>) guests.get(0);
                            String email = (String) firstGuest.get("email");
                            if (StringUtils.isNotBlank(email)) {
                                Map<String, Object> contactInfo = new HashMap<>();
                                contactInfo.put("email", email);
                                contactInfo.put("firstName", firstGuest.get("firstName"));
                                contactInfo.put("lastName", firstGuest.get("lastName"));
                                String fullName = String.join(" ", 
                                    (String) firstGuest.getOrDefault("firstName", ""),
                                    (String) firstGuest.getOrDefault("lastName", "")).trim();
                                contactInfo.put("fullName", fullName);
                                return contactInfo;
                            }
                        }
                    }
                }
            }
        }

        // Handle PaymentProcessed, PaymentFailed, etc. events
        if (eventType.contains("Payment")) {
            Object customerInfo = payload.get("customerInfo");
            if (customerInfo instanceof Map) {
                Map<String, Object> customerMap = (Map<String, Object>) customerInfo;
                String email = (String) customerMap.get("email");
                if (StringUtils.isNotBlank(email)) {
                    Map<String, Object> contactInfo = new HashMap<>();
                    contactInfo.put("email", email);
                    contactInfo.put("firstName", customerMap.get("firstName"));
                    contactInfo.put("lastName", customerMap.get("lastName"));
                    String fullName = String.join(" ", 
                        (String) customerMap.getOrDefault("firstName", ""),
                        (String) customerMap.getOrDefault("lastName", "")).trim();
                    contactInfo.put("fullName", fullName);
                    return contactInfo;
                }
            }
        }

        // Check for guest details in root payload
        Object guestDetails = payload.get("guestDetails");
        if (guestDetails instanceof Map) {
            Map<String, Object> guestMap = (Map<String, Object>) guestDetails;
            String email = (String) guestMap.get("email");
            if (StringUtils.isNotBlank(email)) {
                Map<String, Object> contactInfo = new HashMap<>();
                contactInfo.put("email", email);
                contactInfo.put("firstName", guestMap.get("firstName"));
                contactInfo.put("lastName", guestMap.get("lastName"));
                String fullName = String.join(" ", 
                    (String) guestMap.getOrDefault("firstName", ""),
                    (String) guestMap.getOrDefault("lastName", "")).trim();
                contactInfo.put("fullName", fullName);
                return contactInfo;
            }
        }

        // Return empty contact info map if no contact details found
        return new HashMap<>();
    }

    /**
     * Extract contact information from the event payload considering different event types and data structures
     */
    private Map<String, Object> extractContactInfo(Map<String, Object> payload, String eventType) {
        // First, try the original location (for backward compatibility)
        Map<String, Object> contact = toMap(payload.get("contact"));
        if (contact != null) {
            String email = (String) contact.get("email");
            if (StringUtils.isNotBlank(email)) {
                return contact;
            }
        }

        // Handle FlightReserved, FlightReservationFailed, etc. events
        if (eventType.contains("Flight")) {
            Object flightDetails = payload.get("flightDetails");
            if (flightDetails instanceof Map) {
                Map<String, Object> flightDetailsMap = (Map<String, Object>) flightDetails;
                Object passengersObj = flightDetailsMap.get("passengers");
                if (passengersObj instanceof java.util.List) {
                    java.util.List<?> passengers = (java.util.List<?>) passengersObj;
                    if (!passengers.isEmpty() && passengers.get(0) instanceof Map) {
                        Map<String, Object> firstPassenger = (Map<String, Object>) passengers.get(0);
                        String email = (String) firstPassenger.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            Map<String, Object> contactInfo = new HashMap<>();
                            contactInfo.put("email", email);
                            contactInfo.put("firstName", firstPassenger.get("firstName"));
                            contactInfo.put("lastName", firstPassenger.get("lastName"));
                            String fullName = String.join(" ", 
                                (String) firstPassenger.getOrDefault("firstName", ""),
                                (String) firstPassenger.getOrDefault("lastName", "")).trim();
                            contactInfo.put("fullName", fullName.isEmpty() ? 
                                firstPassenger.getOrDefault("firstName", "traveler").toString() : fullName);
                            return contactInfo;
                        }
                    }
                }
            }
        }

        // Handle HotelReserved, HotelReservationFailed, etc. events
        if (eventType.contains("Hotel")) {
            Object hotelDetails = payload.get("hotelDetails");
            if (hotelDetails instanceof Map) {
                Map<String, Object> hotelDetailsMap = (Map<String, Object>) hotelDetails;
                Object guestsObj = hotelDetailsMap.get("guests");
                if (guestsObj instanceof java.util.List) {
                    java.util.List<?> guests = (java.util.List<?>) guestsObj;
                    if (!guests.isEmpty() && guests.get(0) instanceof Map) {
                        Map<String, Object> firstGuest = (Map<String, Object>) guests.get(0);
                        String email = (String) firstGuest.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            Map<String, Object> contactInfo = new HashMap<>();
                            contactInfo.put("email", email);
                            contactInfo.put("firstName", firstGuest.get("firstName"));
                            contactInfo.put("lastName", firstGuest.get("lastName"));
                            String fullName = String.join(" ", 
                                (String) firstGuest.getOrDefault("firstName", ""),
                                (String) firstGuest.getOrDefault("lastName", "")).trim();
                            contactInfo.put("fullName", fullName.isEmpty() ? 
                                firstGuest.getOrDefault("firstName", "traveler").toString() : fullName);
                            return contactInfo;
                        }
                    }
                }
            }
        }

        // Handle combo bookings
        if (eventType.contains("Combo")) {
            // Check for passengers in combo details
            Object comboDetails = payload.get("comboDetails");
            if (comboDetails instanceof Map) {
                Map<String, Object> comboDetailsMap = (Map<String, Object>) comboDetails;
                Object passengersObj = comboDetailsMap.get("passengers");
                if (passengersObj instanceof java.util.List) {
                    java.util.List<?> passengers = (java.util.List<?>) passengersObj;
                    if (!passengers.isEmpty() && passengers.get(0) instanceof Map) {
                        Map<String, Object> firstPassenger = (Map<String, Object>) passengers.get(0);
                        String email = (String) firstPassenger.get("email");
                        if (StringUtils.isNotBlank(email)) {
                            Map<String, Object> contactInfo = new HashMap<>();
                            contactInfo.put("email", email);
                            contactInfo.put("firstName", firstPassenger.get("firstName"));
                            contactInfo.put("lastName", firstPassenger.get("lastName"));
                            String fullName = String.join(" ", 
                                (String) firstPassenger.getOrDefault("firstName", ""),
                                (String) firstPassenger.getOrDefault("lastName", "")).trim();
                            contactInfo.put("fullName", fullName.isEmpty() ? 
                                firstPassenger.getOrDefault("firstName", "traveler").toString() : fullName);
                            return contactInfo;
                        }
                    }
                }

                // Also check for guests in hotel part of combo
                Object hotelPart = comboDetailsMap.get("hotelDetails");
                if (hotelPart instanceof Map) {
                    Map<String, Object> hotelPartMap = (Map<String, Object>) hotelPart;
                    Object guestsObj = hotelPartMap.get("guests");
                    if (guestsObj instanceof java.util.List) {
                        java.util.List<?> guests = (java.util.List<?>) guestsObj;
                        if (!guests.isEmpty() && guests.get(0) instanceof Map) {
                            Map<String, Object> firstGuest = (Map<String, Object>) guests.get(0);
                            String email = (String) firstGuest.get("email");
                            if (StringUtils.isNotBlank(email)) {
                                Map<String, Object> contactInfo = new HashMap<>();
                                contactInfo.put("email", email);
                                contactInfo.put("firstName", firstGuest.get("firstName"));
                                contactInfo.put("lastName", firstGuest.get("lastName"));
                                String fullName = String.join(" ", 
                                    (String) firstGuest.getOrDefault("firstName", ""),
                                    (String) firstGuest.getOrDefault("lastName", "")).trim();
                                contactInfo.put("fullName", fullName.isEmpty() ? 
                                    firstGuest.getOrDefault("firstName", "traveler").toString() : fullName);
                                return contactInfo;
                            }
                        }
                    }
                }
            }
        }

        // Handle PaymentProcessed, PaymentFailed, etc. events
        if (eventType.contains("Payment")) {
            Object customerInfo = payload.get("customerInfo");
            if (customerInfo instanceof Map) {
                Map<String, Object> customerMap = (Map<String, Object>) customerInfo;
                String email = (String) customerMap.get("email");
                if (StringUtils.isNotBlank(email)) {
                    Map<String, Object> contactInfo = new HashMap<>();
                    contactInfo.put("email", email);
                    contactInfo.put("firstName", customerMap.get("firstName"));
                    contactInfo.put("lastName", customerMap.get("lastName"));
                    String fullName = String.join(" ", 
                        (String) customerMap.getOrDefault("firstName", ""),
                        (String) customerMap.getOrDefault("lastName", "")).trim();
                    contactInfo.put("fullName", fullName.isEmpty() ? 
                        customerMap.getOrDefault("firstName", "traveler").toString() : fullName);
                    return contactInfo;
                }
            }
        }

        // Check for guest details in root payload
        Object guestDetails = payload.get("guestDetails");
        if (guestDetails instanceof Map) {
            Map<String, Object> guestMap = (Map<String, Object>) guestDetails;
            String email = (String) guestMap.get("email");
            if (StringUtils.isNotBlank(email)) {
                Map<String, Object> contactInfo = new HashMap<>();
                contactInfo.put("email", email);
                contactInfo.put("firstName", guestMap.get("firstName"));
                contactInfo.put("lastName", guestMap.get("lastName"));
                String fullName = String.join(" ", 
                    (String) guestMap.getOrDefault("firstName", ""),
                    (String) guestMap.getOrDefault("lastName", "")).trim();
                contactInfo.put("fullName", fullName.isEmpty() ? 
                    guestMap.getOrDefault("firstName", "traveler").toString() : fullName);
                return contactInfo;
            }
        }

        // Return empty contact info map if no contact details found
        return new HashMap<>();
    }
}
