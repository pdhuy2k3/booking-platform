#!/usr/bin/env bash


# Flight
curl -i -X PUT -H "Content-Type: application/json" --data-binary /tmp/connectors/flight-db-connector.json http://connect:8083/connectors/flight-connector/config

# Booking (saga outbox)
curl -i -X PUT -H "Content-Type: application/json" --data-binary /tmp/connectors/booking-saga-outbox-connector.json http://connect:8083/connectors/booking-connector/config

# Hotel
curl -i -X PUT -H "Content-Type: application/json" --data-binary /tmp/connectors/hotel-db-connector.json http://connect:8083/connectors/hotel-connector/config

# Payment
curl -i -X PUT -H "Content-Type: application/json" --data-binary /tmp/connectors/payment-db-connector.json http://connect:8083/connectors/payment-connector/config
