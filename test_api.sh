#!/bin/bash

BASE_URL="http://localhost:9099/api"

echo "🧪 Testing TicketBlitz API..."

# 1. Create User (We need a user first, but for simplicity we'll assume user ID 1 exists or create one if we had a user endpoint. 
# Wait, looking at code, we didn't make a User Controller.
# But we have data.sql or we can rely on H2 in-memory? 
# Actually, the BookingService looks up User by ID.
# Since we are using H2 in-memory, the DB is empty on start!
# We need to insert a user first. 
# Ah, I didn't create a UserController to create users. 
# I should probably add a CommandLineRunner to seed some data or add a User endpoint.
# For now, let's add a simple data seeder to the main app or a configuration.

# Let's check if I can just insert via a new endpoint or if I should modify the app to seed data.
# Modifying the app to seed data on startup is better for the user experience.

echo "⚠️  Note: Ensure the app is running in another terminal!"

# 2. Create Event
echo -e "\n1️⃣  Creating Event..."
RESPONSE=$(curl -s -X POST $BASE_URL/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coldplay Live",
    "description": "World Tour 2025",
    "eventDate": "2025-12-25T20:00:00",
    "venueName": "Wembley",
    "totalSeats": 10
  }')
echo "Response: $RESPONSE"

# Extract Event ID (simple grep/sed, assuming JSON response)
EVENT_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ Created Event ID: $EVENT_ID"

# 3. Get Available Seats
echo -e "\n2️⃣  Getting Available Seats..."
SEATS=$(curl -s -X GET $BASE_URL/events/$EVENT_ID/seats)
echo "Seats: $SEATS"

# Extract first Seat ID
SEAT_ID=$(echo $SEATS | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "💺 Found Seat ID: $SEAT_ID"

# 4. Book Seat
# Wait, we need a valid User ID. 
# Since I didn't create a create-user endpoint, I will assume the app has seeded data or I need to fix this.
# Let's assume I'll fix the app to seed a user.
USER_ID=1

echo -e "\n3️⃣  Booking Seat $SEAT_ID for User $USER_ID..."
BOOKING=$(curl -s -X POST $BASE_URL/bookings \
  -H "Content-Type: application/json" \
  -d "{\"userId\": $USER_ID, \"seatId\": $SEAT_ID}")
echo "Response: $BOOKING"

echo -e "\n🎉 Test Complete!"
