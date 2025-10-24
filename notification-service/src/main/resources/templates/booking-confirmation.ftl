<#ftl encoding="UTF-8">
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <title>Xác nhận đặt chỗ</title>
    <style>
        body { font-family: Arial, sans-serif; color: #1f2933; line-height: 1.6; }
        .wrapper { max-width: 640px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
        .header { border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; padding-bottom: 12px; }
        .section { margin-top: 18px; }
        .section-title { font-weight: 600; margin-bottom: 8px; color: #0f172a; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { text-align: left; padding: 6px 0; }
        th { color: #475569; font-weight: 500; }
        .badge { display: inline-block; background: #0b7285; color: white; padding: 4px 10px; border-radius: 999px; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; }
        .footer { margin-top: 24px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <span class="badge">Đặt chỗ đã được xác nhận</span>
        <h2>Mã tham chiếu ${bookingReference!bookingId}</h2>
        <p>Số xác nhận: <strong>${confirmationNumber!"Đang chờ cấp"}</strong></p>
    </div>

    <p>Kính gửi ${contact.fullName!contact.firstName!"khách du lịch"},</p>

    <p>
        Đặt chỗ của bạn đã được xác nhận. Chúng tôi rất vui được đồng hành cùng bạn trong chuyến đi và hy vọng bạn sẽ có một trải nghiệm tuyệt vời.
    </p>

    <div class="section">
        <div class="section-title">Tóm tắt đặt chỗ</div>
        <table>
            <tr>
                <th>Loại</th>
                <td>${bookingType!"Không có"}</td>
            </tr>
            <tr>
                <th>Tổng số tiền</th>
                <td>${formattedTotalAmount!"Không có"}</td>
            </tr>
            <tr>
                <th>Trạng thái</th>
             
                <td>${statusLabel}</td>
            </tr>
        </table>
    </div>

    <#if productDetails.flight??>
        <div class="section">
            <div class="section-title">Hành trình bay</div>
            <table>
                <tr>
                    <th>Chuyến bay</th>
                    <td>${productDetails.flight.flightNumber!"Không có"} · ${productDetails.flight.airline!"Không có"}</td>
                </tr>
                <tr>
                    <th>Tuyến đường</th>
                    <td>${productDetails.flight.originAirport!"??"} → ${productDetails.flight.destinationAirport!"??"}</td>
                </tr>
                <tr>
                    <th>Khởi hành</th>
                    <td>${productDetails.flight.departureDateTime!"Không có"}</td>
                </tr>
                <tr>
                    <th>Đến nơi</th>
                    <td>${productDetails.flight.arrivalDateTime!"Không có"}</td>
                </tr>
            </table>
        </div>
    </#if>

    <#if productDetails.hotel??>
        <div class="section">
            <div class="section-title">Hành trình khách sạn</div>
            <table>
                <tr>
                    <th>Khách sạn</th>
                    <td>${productDetails.hotel.hotelName!"Không có"} · ${productDetails.hotel.city!"Không có"}</td>
                </tr>
                <tr>
                    <th>Lưu trú</th>
                    <td>${productDetails.hotel.checkInDate!"Không có"} → ${productDetails.hotel.checkOutDate!"Không có"} (${productDetails.hotel.numberOfNights!"Không có"} đêm)</td>
                </tr>
                <tr>
                    <th>Khách</th>
                    <td>${productDetails.hotel.numberOfGuests!"Không có"} khách</td>
                </tr>
                <tr>
                    <th>Phòng</th>
                    <td>${productDetails.hotel.roomName!"Không có"} (${productDetails.hotel.bedType!"Không có"})</td>
                </tr>
            </table>
        </div>
    </#if>

    <#if productDetails.combo?? && (productDetails.combo.packageName?hasContent || productDetails.combo.comboDiscount?? || productDetails.combo.comboOffers?hasContent)>
        <div class="section">
            <div class="section-title">Gói kết hợp</div>
            <table>
                <#if productDetails.combo.packageName?hasContent>
                    <tr>
                        <th>Gói</th>
                        <td>${productDetails.combo.packageName}</td>
                    </tr>
                </#if>
                <#if productDetails.combo.comboDiscount??>
                    <tr>
                        <th>Giảm giá</th>
                        <td>${productDetails.combo.comboDiscount}</td>
                    </tr>
                </#if>
                <#if productDetails.combo.comboOffers?hasContent>
                    <tr>
                        <th>Ưu đãi</th>
                        <td>${productDetails.combo.comboOffers}</td>
                    </tr>
                </#if>
            </table>
        </div>
    </#if>

    <div class="section">
        <p>
            Bạn có thể tìm thấy toàn bộ hành trình của mình và quản lý các dịch vụ bổ sung trong tài khoản BookingSmart của mình.
            Nếu bạn cần thực hiện thay đổi hoặc có bất kỳ câu hỏi nào, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7.
        </p>
    </div>

    <div class="footer">
        Chúc quý khách có những chuyến đi an toàn!<br/>
        Đội ngũ BookingSmart<br/>
        Email này đã được gửi đến ${contact.email!""}.
    </div>
</div>
</body>
</html>