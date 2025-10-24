<#ftl encoding="UTF-8">
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Booking Notification</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1f2933; line-height: 1.6; }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; }
        .header { border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; padding-bottom: 12px; }
        .footer { margin-top: 24px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { text-align: left; padding: 6px 0; }
        th { color: #475569; font-weight: 500; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h2>Booking update</h2>
        <p>Reference <strong>${bookingReference!bookingId!"N/A"}</strong></p>
    </div>

    <p>Hello ${contact.fullName!contact.firstName!'traveler'},</p>

    <p>
        We have an update for your booking. Please review the details below and reach out if anything looks incorrect.
    </p>

    <table>
        <tr>
            <th>Event Type</th>
            <td>${eventType!"N/A"}</td>
        </tr>
        <tr>
            <th>Status</th>
            <td>${status!"N/A"}</td>
        </tr>
        <tr>
            <th>Total amount</th>
            <td>${formattedTotalAmount!totalAmount!"N/A"}</td>
        </tr>
    </table>

    <div class="footer">
        Thank you for choosing BookingSmart. This email was sent to ${contact.email!""}.
    </div>
</div>
</body>
</html>
