FROM eclipse-temurin:21-jre-alpine
# Install necessary packages for Docker socket access
RUN apk add --no-cache bash netcat-openbsd docker-cli

# Copy and fix wait-for-it script
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh && \
    sed -i 's/\r$//' /wait-for-it.sh
COPY target/aiAgent*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]
