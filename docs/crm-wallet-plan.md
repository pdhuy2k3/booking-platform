# Customer Wallet & Loyalty CRM Implementation Plan

## Objectives
- Introduce a cross-service wallet that stores customer reward points earned from bookings, refunds, and promotional campaigns.
- Enable point redemption during checkout to discount payments, alongside support for voucher purchases.
- Track customer tiers (Bronze, Silver, Gold, etc.) that unlock benefits and influence accrual/redemption rules.
- Provide administrative and customer-facing visibility into balances, transactions, and tier progress.

## Key Assumptions
- Stripe remains the primary payment processor. Points can offset a portion of payable amounts, with Stripe charging only the remainder.
- A new `loyalty-service` (or an extension to `customer-service`) will manage wallets, transactions, and tier logic.
- Booking, payment, and notification services emit reliable events (Kafka/outbox) to drive accrual and redemption updates.
- Wallet balances use integer “points” (1 point == 1 unit of local currency by default), but conversion rates can be configured later.

## Phase 1 – Foundation
1. **Data Model**
   - Wallet table (`wallets`): `wallet_id`, `user_id`, `balance`, `tier`, `lifetime_points`, `created_at`, `updated_at`.
   - Transaction table (`wallet_transactions`): `tx_id`, `wallet_id`, `type` (earn, burn, refund, adjustment), `amount`, `booking_id`, `payment_id`, `description`, `metadata`, timestamps.
   - Tier configuration table (`loyalty_tiers`): tier name, thresholds, benefits, earn multipliers, max redemption per booking.
2. **Service/API Layer**
   - REST endpoints:
     - `GET /wallets/{userId}` – current balance, tier, summary.
     - `GET /wallets/{userId}/transactions` with pagination/filtering.
     - `POST /wallets/{userId}/transactions` – admin adjustments.
     - `POST /wallets/{userId}/earn` – internal use (idempotent via booking/payment IDs).
     - `POST /wallets/{userId}/redeem` – locks points for pending payment.
     - `POST /wallets/{userId}/release` – unlocks points if payment fails/cancelled.
   - Kafka consumers for booking/payment events to trigger automatic earn/refund flows.
3. **Security & Auditing**
   - OAuth scopes for customer vs admin.
   - Immutable ledger design (never update transaction rows).
   - Idempotency keys to prevent double posting from event retries.

## Phase 2 – Earn & Burn Mechanics
1. **Point Accrual Rules**
   - Base earn rate (e.g., 1 point per 1,000 VND spent) configurable per tier.
   - Bonus multipliers for specific products or campaigns.
   - Accrual triggered on booking confirmation or payment success events.
2. **Redemption Workflow**
   - Checkout UI prompts: “Apply points” slider/input.
   - Booking service calls `redeem` before creating payment intent, receives “locked points” token.
   - Payment orchestration reduces charge amount by redeemed value; passes metadata to payment service.
   - Upon payment success, booking service confirms redemption (finalizes the transaction) via wallet API.
   - On failure/cancel, booking service releases the hold to restore points.
3. **Voucher & Discount Purchases**
   - Introduce `voucher-service` (or extend `media-service`) storing voucher inventory and price in points.
   - Wallet `burn` transaction issued when customer buys a voucher; service delivers voucher code via notification-service.

## Phase 3 – Tier Management
1. **Tier Definitions**
   - Bronze (default), Silver, Gold (extendable).
   - Thresholds based on lifetime points earned or spend in trailing 12 months.
   - Benefits: higher earn rate, higher max redemption, exclusive vouchers.
2. **Tier Evaluation**
   - Nightly job recalculates tiers based on thresholds.
   - Real-time evaluation on accrual events for immediate upgrades.
3. **Exposure**
   - Customer profile API/UI displays current tier, next-tier progress.
   - Backoffice UI lists customers by tier, filters for targeted campaigns.

## Phase 4 – Frontend & UX Integration
1. **Storefront Booking Flow**
   - Fetch wallet summary during review/payment steps.
   - UI to select points redemption amount with validation vs available balance and policy caps.
   - Update order summary totals to show original price, point deduction, final charge.
2. **Customer Dashboard**
   - New “Wallet” tab showing balance, recent transactions, tier status, voucher inventory.
3. **Backoffice Tools**
   - Admin screens to adjust balances, view customer histories, configure tiers and campaigns.

## Technical Considerations
- **Idempotency**: use booking/payment IDs to guard against duplicate point postings when sagas retry.
- **Concurrency**: surface wallet balance in booking flow with optimistic locking or distributed locks.
- **Currency Support**: store both point amount and underlying currency equivalence for reporting.
- **Notifications**: send emails/push when points earned, redeemed, or when tier changes via notification-service.
- **Testing**: contract tests for wallet API, end-to-end flows covering earn, redeem, cancel, and refunds.

## Open Questions
- Finalize conversion rate and whether it’s static or dynamic per campaign.
- Decide if points expire; if so, schedule expiry jobs and customer reminders.
- Determine tax/accounting treatment of points used in lieu of refunds.
- Clarify if redeemed points can combine with coupon codes or other promos.

## Next Steps
1. Review plan with product & finance stakeholders for approval of conversion rates and tier benefits.
2. Create `loyalty-service` skeleton with data model migrations.
3. Implement earn listeners for booking/payment events; add redemption APIs and locking.
4. Integrate wallet checks into storefront payment step and test full earn/burn cycle in staging.
