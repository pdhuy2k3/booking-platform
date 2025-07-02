FROM eclipse-temurin:21-jre-alpine
COPY target/flight*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]