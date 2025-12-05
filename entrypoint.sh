#!/bin/sh

# Parse the Render database URL and construct proper JDBC connection properties
# Render provides: postgresql://user:password@host/database
# JDBC needs: jdbc:postgresql://host:5432/database (with user/pass separate)

if [ -n "$RENDER_DB_URL" ]; then
    echo "Found RENDER_DB_URL, parsing database connection..."
    
    # Remove the postgresql:// prefix
    DB_URL_WITHOUT_PREFIX=$(echo "$RENDER_DB_URL" | sed 's|^postgresql://||')
    
    # Extract user:password part (before @)
    USER_PASS=$(echo "$DB_URL_WITHOUT_PREFIX" | cut -d'@' -f1)
    
    # Extract host/database part (after @)
    HOST_DB=$(echo "$DB_URL_WITHOUT_PREFIX" | cut -d'@' -f2)
    
    # Extract username (before :)
    DB_USER=$(echo "$USER_PASS" | cut -d':' -f1)
    
    # Extract password (after :)
    DB_PASS=$(echo "$USER_PASS" | cut -d':' -f2)
    
    # Extract host (before /)
    DB_HOST=$(echo "$HOST_DB" | cut -d'/' -f1)
    
    # Extract database name (after /)
    DB_NAME=$(echo "$HOST_DB" | cut -d'/' -f2)
    
    # Construct proper JDBC URL (Render PostgreSQL uses default port 5432)
    export SPRING_DATASOURCE_URL="jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}"
    export SPRING_DATASOURCE_USERNAME="$DB_USER"
    export SPRING_DATASOURCE_PASSWORD="$DB_PASS"
    
    echo "Configured database connection:"
    echo "  URL: jdbc:postgresql://${DB_HOST}:5432/${DB_NAME}"
    echo "  User: $DB_USER"
    echo "  (password hidden)"
fi

echo "Starting application..."
exec java -jar app.jar
