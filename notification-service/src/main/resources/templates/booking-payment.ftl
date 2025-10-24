<#ftl encoding="UTF-8">
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Payment Received</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1f2933; line-height: 1.6; }
        .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; }
        .header { border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; padding-bottom: 12px; }
        .amount { font-size: 20px; font-weight: 600; color: #0b7285; }
        .section { margin-top: 18px; }
        .section-title { font-weight: 600; margin-bottom: 8px; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { text-align: left; padding: 6px 0; }
        th { color: #475569; font-weight: 500; }
        .footer { margin-top: 24px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h2>Payment Received</h2>
        <p>Booking reference <strong>${bookingReference!bookingId}</strong></p>
    </div>

    <p>Hi ${contact.fullName!contact.firstName!'there'},</p>

    <p>
        We have received your payment for booking <strong>${bookingReference!bookingId}</strong>.
        Thank you for choosing BookingSmart for your travel plans.
    </p>

    <p class="amount">
        ${formattedTotalAmount!}
    </p>

    <#if payment??>
        <div class="section">
            <div class="section-title">Payment summary</div>
            <table>
                <tr>
                    <th>Transaction</th>
                    <td>${payment.transactionId!"N/A"}</td>
                </tr>
                <tr>
                    <th>Provider</th>
                    <td>${payment.provider!"N/A"}</td>
                </tr>
                <tr>
                    <th>Status</th>
                    <td>${payment.status!"COMPLETED"}</td>
                </tr>
                <tr>
                    <th>Processed At</th>
                    <td>${payment.processedAt!"N/A"}</td>
                </tr>
            </table>
        </div>
    </#if>

    <#if productDetails.flight??>
        <div class="section">
            <div class="section-title">Flight details</div>
            <table>
                <tr>
                    <th>Flight</th>
                    <td>${productDetails.flight.flightNumber!"N/A"} · ${productDetails.flight.airline!"N/A"}</td>
                </tr>
                <tr>
                    <th>Route</th>
                    <td>${productDetails.flight.originAirport!"??"} → ${productDetails.flight.destinationAirport!"??"}</td>
                </tr>
                <tr>
                    <th>Departure</th>
                    <td>${productDetails.flight.departureDateTime!"N/A"}</td>
                </tr>
                <tr>
                    <th>Arrival</th>
                    <td>${productDetails.flight.arrivalDateTime!"N/A"}</td>
                </tr>
                <tr>
                    <th>Seat class</th>
                    <td>${productDetails.flight.seatClass!"N/A"}</td>
                </tr>
            </table>
        </div>
    </#if>

    <#if productDetails.hotel??>
        <div class="section">
            <div class="section-title">Hotel details</div>
            <table>
                <tr>
                    <th>Hotel</th>
                    <td>${productDetails.hotel.hotelName!"N/A"}</td>
                </tr>
                <tr>
                    <th>Room</th>
                    <td>${productDetails.hotel.roomName!"N/A"} · ${productDetails.hotel.roomType!"N/A"}</td>
                </tr>
                <tr>
                    <th>Check-in</th>
                    <td>${productDetails.hotel.checkInDate!"N/A"}</td>
                </tr>
                <tr>
                    <th>Check-out</th>
                    <td>${productDetails.hotel.checkOutDate!"N/A"}</td>
                </tr>
                <tr>
                    <th>Guests</th>
                    <td>${productDetails.hotel.numberOfGuests!"N/A"}</td>
                </tr>
            </table>
        </div>
    </#if>

    <div class="section">
        <p>
            You can review your booking anytime by visiting your BookingSmart dashboard.
            If you have questions, just reply to this email and we will gladly help.
        </p>
    </div>

    <div class="footer">
        &copy; ${.now?string('yyyy')} BookingSmart. This email was sent to ${contact.email!""}.
    </div>
</div>
</body>
</html>
