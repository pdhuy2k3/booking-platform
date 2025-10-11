#!/bin/sh
set -e

echo "==================== DEPLOYING KAFKA CONNECTORS ===================="

connectors="
flight-connector=/tmp/connectors/flight-db-connector.json
booking-connector=/tmp/connectors/booking-saga-outbox-connector.json
hotel-connector=/tmp/connectors/hotel-db-connector.json
payment-connector=/tmp/connectors/payment-db-connector.json
"

deploy_connector() {
  name=$1
  file=$2

  if [ ! -f "$file" ]; then
    echo "File not found: $file"
    return 1
  fi

  echo "→ Deploying connector: $name"
  status_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PUT \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    --data-binary @"$file" \
    "http://connect:8083/connectors/${name}/config")

  if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    echo "✓ Success: $name ($status_code)"
  else
    echo "Failed: $name (HTTP $status_code)"
  fi
  echo "-------------------------------------------------------------------"
}

echo "Waiting 5s before deploying connectors..."
sleep 5

for entry in $connectors; do
  name=${entry%%=*} 
  file=${entry#*=} 
  deploy_connector "$name" "$file"
done

echo "==================== ALL CONNECTORS DEPLOYED ===================="
