#!/bin/sh

# Fix JDBC URL if needed
if [ -n "$RENDER_DB_URL" ]; then
    echo "Found RENDER_DB_URL, constructing SPRING_DATASOURCE_URL..."
    export SPRING_DATASOURCE_URL="jdbc:$RENDER_DB_URL"
elif [ -n "$SPRING_DATASOURCE_URL" ]; then
    # Check if it starts with jdbc:
    case "$SPRING_DATASOURCE_URL" in
        jdbc:*) 
            echo "SPRING_DATASOURCE_URL already has jdbc: prefix."
            ;;
        *) 
            echo "SPRING_DATASOURCE_URL missing jdbc: prefix. Fixing..."
            export SPRING_DATASOURCE_URL="jdbc:$SPRING_DATASOURCE_URL"
            ;;
    esac
fi

echo "Starting application..."
exec java -jar app.jar
