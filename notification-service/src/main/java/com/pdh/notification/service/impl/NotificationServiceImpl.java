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

        Map<String, Object> contact = toMap(payload.get("contact"));
        String recipient = contact != null ? (String) contact.get("email") : null;
        if (StringUtils.isBlank(recipient)) {
            log.warn("No recipient email found in booking payload for event {}", eventType);
            return;
        }

        Map<String, Object> model = new HashMap<>(payload);
        model.put("contact", contact);
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
}
