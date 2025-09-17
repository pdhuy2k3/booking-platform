-- liquibase formatted sql

-- changeset PhamDuyHuy:1758114365993-1
CREATE INDEX idx_payment_booking_id ON payments (booking_id);

-- changeset PhamDuyHuy:1758114365993-2
CREATE INDEX idx_payment_created_at ON payments (created_at);

-- changeset PhamDuyHuy:1758114365993-3
CREATE INDEX idx_payment_gateway_txn_id ON payments (gateway_transaction_id);

-- changeset PhamDuyHuy:1758114365993-4
CREATE INDEX idx_payment_method_type ON payments (method_type);

-- changeset PhamDuyHuy:1758114365993-5
CREATE INDEX idx_payment_provider ON payments (provider);

-- changeset PhamDuyHuy:1758114365993-6
CREATE INDEX idx_payment_saga_id ON payments (saga_id);

-- changeset PhamDuyHuy:1758114365993-7
CREATE INDEX idx_payment_status ON payments (status);

-- changeset PhamDuyHuy:1758114365993-8
CREATE INDEX idx_payment_user_id ON payments (user_id);

-- changeset PhamDuyHuy:1758114365993-9
CREATE INDEX idx_pm_created_at ON payment_methods (created_at);

-- changeset PhamDuyHuy:1758114365993-10
CREATE INDEX idx_pm_fingerprint ON payment_methods (fingerprint);

-- changeset PhamDuyHuy:1758114365993-11
CREATE INDEX idx_pm_is_active ON payment_methods (is_active);

-- changeset PhamDuyHuy:1758114365993-12
CREATE INDEX idx_pm_is_default ON payment_methods (is_default);

-- changeset PhamDuyHuy:1758114365993-13
CREATE INDEX idx_pm_method_type ON payment_methods (method_type);

-- changeset PhamDuyHuy:1758114365993-14
CREATE INDEX idx_pm_provider ON payment_methods (provider);

-- changeset PhamDuyHuy:1758114365993-15
CREATE INDEX idx_pm_user_id ON payment_methods (user_id);

-- changeset PhamDuyHuy:1758114365993-16
CREATE INDEX idx_txn_created_at ON payment_transactions (created_at);

-- changeset PhamDuyHuy:1758114365993-17
CREATE INDEX idx_txn_gateway_id ON payment_transactions (gateway_transaction_id);

-- changeset PhamDuyHuy:1758114365993-19
CREATE INDEX idx_txn_payment_id ON payment_transactions (payment_id);

-- changeset PhamDuyHuy:1758114365993-20
CREATE INDEX idx_txn_provider ON payment_transactions (provider);

-- changeset PhamDuyHuy:1758114365993-21
CREATE INDEX idx_txn_saga_id ON payment_transactions (saga_id);

-- changeset PhamDuyHuy:1758114365993-22
CREATE INDEX idx_txn_status ON payment_transactions (status);

-- changeset PhamDuyHuy:1758114365993-23
CREATE INDEX idx_txn_type ON payment_transactions (transaction_type);

-- changeset PhamDuyHuy:1758114365993-24
ALTER TABLE payment_transactions
    ADD CONSTRAINT FK_PAYMENT_TRANSACTIONS_ON_ORIGINAL_TRANSACTION FOREIGN KEY (original_transaction_id) REFERENCES payment_transactions (transaction_id);
CREATE INDEX idx_txn_original_id ON payment_transactions (original_transaction_id);

-- changeset PhamDuyHuy:1758114365993-25
ALTER TABLE payment_transactions
    ADD CONSTRAINT FK_PAYMENT_TRANSACTIONS_ON_PARENT_TRANSACTION FOREIGN KEY (parent_transaction_id) REFERENCES payment_transactions (transaction_id);

