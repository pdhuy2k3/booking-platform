#!/bin/bash

# Deploy Debezium Connectors Script
# Usage: ./deploy-debezium-connectors.sh

set -e

CONNECT_URL="http://localhost:8083"
DEBEZIUM_DIR="./debezium"

echo "🚀 Deploying Debezium Connectors..."
echo "Connect URL: $CONNECT_URL"
echo "========================================"

# Function to deploy a connector
deploy_connector() {
    local connector_file=$1
    local connector_name=$(basename "$connector_file" .json)
    
    echo "📤 Deploying connector: $connector_name"
    
    # Use PUT request for connector deployment
    if curl -X PUT \
        -H "Content-Type: application/json" \
        -d @"$connector_file" \
        "$CONNECT_URL/connectors/$connector_name/config" \
        --silent --show-error; then
        echo "✅ Successfully deployed: $connector_name"
    else
        echo "❌ Failed to deploy: $connector_name"
        return 1
    fi
    echo ""
}

# Wait for Kafka Connect to be ready
wait_for_connect() {
    echo "⏳ Waiting for Kafka Connect to be ready..."
    
    for i in {1..30}; do
        if curl -s "$CONNECT_URL/connectors" > /dev/null 2>&1; then
            echo "✅ Kafka Connect is ready!"
            return 0
        fi
        echo "   Attempt $i/30 - Kafka Connect not ready yet..."
        sleep 5
    done
    
    echo "❌ Kafka Connect failed to start within 150 seconds"
    exit 1
}

# Main deployment process
main() {
    wait_for_connect
    
    # Deploy all connectors
    echo "🔧 Deploying connectors from: $DEBEZIUM_DIR"
    
    deploy_connector "$DEBEZIUM_DIR/booking-saga-outbox-connector.json"
    deploy_connector "$DEBEZIUM_DIR/flight-db-connector.json"
    deploy_connector "$DEBEZIUM_DIR/hotel-db-connector.json"
    deploy_connector "$DEBEZIUM_DIR/payment-db-connector.json"
    deploy_connector "$DEBEZIUM_DIR/notification-db-connector.json"
    
    echo "========================================"
    echo "🎉 All connectors deployed successfully!"
    echo ""
    echo "📊 Check connector status:"
    echo "   curl $CONNECT_URL/connectors"
    echo ""
    echo "🔍 Monitor Kafka topics:"
    echo "   Kafka UI: http://localhost:8090"
    echo "   Connect API: $CONNECT_URL"
}

main "$@"