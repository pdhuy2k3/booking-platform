-- Sample payment_methods data
INSERT INTO payment_methods (provider_name, is_active) VALUES
('VNPAY', TRUE),
('MOMO', TRUE),
('ZALOPAY', TRUE),
('PAYPAL', TRUE),
('STRIPE', TRUE),
('BANK_TRANSFER', TRUE),
('CASH', FALSE);

-- Sample transactions data
INSERT INTO transactions (transaction_id, booking_id, amount, currency, status, payment_method_id, gateway_transaction_id, gateway_response_payload, created_at, updated_at) VALUES
(uuid_generate_v4(), uuid_generate_v4(), 1200000.00, 'VND', 'SUCCESS', 1, 'VNPAY_TXN_20250701_001', '{"gateway": "VNPAY", "response_code": "00", "message": "Transaction successful"}', '2025-07-01 10:05:00+07', '2025-07-01 10:05:00+07'),
(uuid_generate_v4(), uuid_generate_v4(), 4500000.00, 'VND', 'PENDING_GATEWAY', 2, 'MOMO_TXN_20250702_001', '{"gateway": "MOMO", "response_code": "PENDING", "message": "Payment processing"}', '2025-07-02 14:32:00+07', '2025-07-02 14:32:00+07'),
(uuid_generate_v4(), uuid_generate_v4(), 2800000.00, 'VND', 'SUCCESS', 3, 'ZALOPAY_TXN_20250703_001', '{"gateway": "ZALOPAY", "response_code": "1", "message": "Payment successful"}', '2025-07-03 09:20:00+07', '2025-07-03 09:20:00+07'),
(uuid_generate_v4(), uuid_generate_v4(), 850000.00, 'VND', 'FAILED', 1, 'VNPAY_TXN_20250704_001', '{"gateway": "VNPAY", "response_code": "05", "message": "Insufficient funds"}', '2025-07-04 11:15:00+07', '2025-07-04 11:15:00+07');

-- Sample refunds data
INSERT INTO refunds (refund_id, original_transaction_id, amount, reason, status, gateway_refund_id, created_at, updated_at) VALUES
(uuid_generate_v4(),
 (SELECT transaction_id FROM transactions WHERE gateway_transaction_id = 'VNPAY_TXN_20250701_001'),
 600000.00,
 'Partial refund requested by customer due to flight schedule change', 
 'COMPLETED', 
 'VNPAY_REFUND_20250705_001', 
 '2025-07-05 08:00:00+07', 
 '2025-07-05 08:30:00+07'),
 
(uuid_generate_v4(), 
 (SELECT transaction_id FROM transactions WHERE gateway_transaction_id = 'ZALOPAY_TXN_20250703_001'),
 2800000.00,
 'Full refund due to service cancellation', 
 'PROCESSING', 
 'ZALOPAY_REFUND_20250706_001', 
 '2025-07-06 10:00:00+07', 
 '2025-07-06 10:00:00+07');
