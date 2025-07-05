-- liquibase formatted sql

-- changeset pdhuy2k3:001-create-payment-enums
CREATE TYPE transaction_status_enum AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE refund_status_enum AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- changeset pdhuy2k3:001-create-payment-tables
-- Bảng Payment Methods: Các phương thức thanh toán được hỗ trợ
CREATE TABLE payment_methods (
                                 id UUID PRIMARY KEY,
                                 name VARCHAR(255) NOT NULL,
                                 code VARCHAR(50) UNIQUE,
                                 provider VARCHAR(255)
);

-- Bảng Transactions: Giao dịch thanh toán
CREATE TABLE transactions (
                              id UUID PRIMARY KEY,
                              booking_id UUID NOT NULL,
                              payment_method_id UUID NOT NULL REFERENCES payment_methods(id),
                              amount DECIMAL(19, 2) NOT NULL,
                              currency VARCHAR(10) NOT NULL,
                              status transaction_status_enum,
                              provider_transaction_id VARCHAR(255),
                              created_on TIMESTAMPTZ,
                              created_by VARCHAR(255),
                              last_modified_on TIMESTAMPTZ,
                              last_modified_by VARCHAR(255),
                              deleted BOOLEAN DEFAULT FALSE,
                              is_active BOOLEAN DEFAULT TRUE
);

-- Bảng Refunds: Giao dịch hoàn tiền
CREATE TABLE refunds (
                         id UUID PRIMARY KEY,
                         transaction_id UUID NOT NULL REFERENCES transactions(id),
                         amount DECIMAL(19, 2) NOT NULL,
                         reason TEXT,
                         status refund_status_enum,
                         created_on TIMESTAMPTZ,
                         created_by VARCHAR(255),
                         last_modified_on TIMESTAMPTZ,
                         last_modified_by VARCHAR(255),
                         deleted BOOLEAN DEFAULT FALSE,
                         is_active BOOLEAN DEFAULT TRUE
);
