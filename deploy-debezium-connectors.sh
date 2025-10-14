#!/usr/bin/env bash
# Script to deploy all Debezium connectors for the BookingSmart system

# Check if we're running inside Docker container or on host
if [ "$1" = "--docker" ]; then
  # Running inside Docker container
  CONNECT_HOST="connect:8083"
  CONNECTOR_PATH="/tmp/connectors"
else
  # Running on host
  CONNECT_HOST="${CONNECT_HOST:-localhost:8083}"
  if [ -d "/tmp/connectors" ]; then
    CONNECTOR_PATH="/tmp/connectors"
  else
    CONNECTOR_PATH="./debezium"
  fi
fi

CONNECT_URL="http://$CONNECT_HOST/connectors"

# Wait for Kafka Connect to be ready
echo "Waiting for Kafka Connect to be ready at $CONNECT_URL..."
until curl -s $CONNECT_URL > /dev/null; do
  echo "Kafka Connect not ready yet, waiting..."
  sleep 5
done
echo "Kafka Connect is ready!"

# Deploy existing connectors
echo "Deploy flight connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/flight-db-connector.json \
  $CONNECT_URL/flight-connector/config

echo "Deploy booking connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/booking-saga-outbox-connector.json \
  $CONNECT_URL/booking-connector/config

echo "Deploy hotel connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/hotel-db-connector.json \
  $CONNECT_URL/hotel-connector/config

echo "Deploy payment connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/payment-db-connector.json \
  $CONNECT_URL/payment-connector/config

echo "Deploy notification connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/notification-db-connector.json \
  $CONNECT_URL/notification-connector/config

# Deploy new CDC connectors for RAG
echo "Deploy flights CDC connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/flights-cdc-connector.json \
  $CONNECT_URL/flights-cdc-connector/config

echo "Deploy flight schedules CDC connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/flight-schedules-cdc-connector.json \
  $CONNECT_URL/flight-schedules-cdc-connector/config

echo "Deploy flight fares CDC connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/flight-fares-cdc-connector.json \
  $CONNECT_URL/flight-fares-cdc-connector/config

echo "Deploy hotels CDC connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/hotels-cdc-connector.json \
  $CONNECT_URL/hotels-cdc-connector/config

echo "Deploy room types CDC connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/room-types-cdc-connector.json \
  $CONNECT_URL/room-types-cdc-connector/config

echo "Deploy room availability CDC connector"
curl -i -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  --data-binary @$CONNECTOR_PATH/room-availability-cdc-connector.json \
  $CONNECT_URL/room-availability-cdc-connector/config

echo "All connectors deployed successfully!"