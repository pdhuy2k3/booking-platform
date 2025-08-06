## start with a base image
FROM eclipse-temurin:21-jre-alpine
COPY target/discovery*.jar app.jar
ENTRYPOINT ["java", "-jar", "/app.jar"]