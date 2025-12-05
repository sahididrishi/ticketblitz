#!/bin/bash

# 1. Force Java 17
export JAVA_HOME="/opt/homebrew/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "🚀 Starting TicketBlitz..."
echo "Using Java: $(java -version 2>&1 | head -n 1)"

# 2. Check Docker
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running. Using PostgreSQL."
    docker-compose up -d
    echo "Waiting for DB..."
    sleep 5
    ./mvnw spring-boot:run
else
    echo "⚠️  Docker is NOT running."
    echo "🔄 Falling back to In-Memory Database (H2)."
    echo "   (Data will be lost when you stop the app)"
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
fi

echo "🎉 App is running! Access it at: http://localhost:9099"
