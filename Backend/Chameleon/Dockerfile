# ====================================================
# Stage 1: Build the Spring Boot application
# ====================================================
FROM eclipse-temurin:25-jdk-noble AS builder

WORKDIR /app

# Copy Maven wrapper and POM first for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Fix Windows CRLF line endings on mvnw and make executable
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and package executable JAR
COPY src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# ====================================================
# Stage 2: Minimal, secure runtime image
# ====================================================
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

# Run as non-root user for security
RUN groupadd -r chameleon && useradd -r -g chameleon chameleon

# Copy built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar
RUN chown -R chameleon:chameleon /app

USER chameleon

# Dynamic port binding: Render injects PORT (e.g. 10000), defaults to 8080 locally
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
