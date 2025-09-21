curl -i -X PUT -H  "Content-Type:application/json" \
    http://localhost:8083/connectors/flight-connector/config \
    -d @debezium/flight-db-connector.json

curl -i -X PUT -H  "Content-Type:application/json" \
    http://localhost:8083/connectors/booking-connector/config \
    -d @debezium/booking-saga-outbox-connector.json

curl -i -X PUT -H  "Content-Type:application/json" \
    http://localhost:8083/connectors/hotel-connector/config \
    -d @debezium/hotel-db-connector.json

curl -i -X PUT -H  "Content-Type:application/json" \
    http://localhost:8083/connectors/payment-connector/config \
    -d @debezium/payment-db-connector.json

curl -i -X PUT -H  "Content-Type:application/json" \
    http://localhost:8083/connectors/notification-connector/config \
    -d @debezium/notification-db-connector.json