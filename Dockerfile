# ====================================================
# Chameleon Spring Boot Backend - Root Dockerfile
# Enables direct Docker builds and Render deployment from repo root
# ====================================================
FROM eclipse-temurin:25-jdk-noble AS builder

WORKDIR /app

# Copy Maven wrapper and POM from backend directory
COPY Backend/Chameleon/.mvn/ .mvn/
COPY Backend/Chameleon/mvnw Backend/Chameleon/pom.xml ./

# Normalize line endings and permissions
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

# Resolve dependencies
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production jar
COPY Backend/Chameleon/src/ ./src/
RUN ./mvnw clean package -DskipTests -B

# ====================================================
# Stage 2: Minimal runtime image
# ====================================================
FROM eclipse-temurin:25-jre-noble

WORKDIR /app

RUN groupadd -r chameleon && useradd -r -g chameleon chameleon

COPY --from=builder /app/target/*.jar app.jar
RUN chown -R chameleon:chameleon /app

USER chameleon

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
