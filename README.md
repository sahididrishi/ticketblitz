# TicketBlitz 🎟️

**High-Performance Event Ticketing System**

TicketBlitz is a backend system designed to handle high-concurrency ticket booking scenarios. It solves the classic "double-booking" problem using Optimistic Locking and Database Transaction Isolation.

## Key Features
- **Concurrency Handling**: Prevents overbooking even when thousands of users click "Buy" at the exact same millisecond.
- **Optimistic Locking**: Uses JPA `@Version` to manage concurrent updates without heavy database locks.
- **Clean Architecture**: Follows Spring Boot best practices with a clear separation of concerns (Controller -> Service -> Repository).
- **Dockerized**: Ready to deploy with `docker-compose`.

## Tech Stack
- **Java 17**
- **Spring Boot 3** (Web, Data JPA)
- **PostgreSQL**
- **Docker & Testcontainers**
- **JUnit 5**

## How to Run

### Prerequisites
- Docker
- Java 17+

### Steps
1. **Start Database**:
   ```bash
   docker-compose up -d
   ```

2. **Run Application**:
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Run Tests (Verification)**:
   This runs the `ConcurrencyTest` which simulates 10 threads trying to book the *same* seat simultaneously.
   ```bash
   ./mvnw test
   ```

## API Endpoints

### Create Event
`POST /api/events`
```json
{
  "name": "Coldplay Live",
  "description": "World Tour 2025",
  "eventDate": "2025-12-25T20:00:00",
  "venueName": "Wembley",
  "totalSeats": 100
}
```

### Book Seat
`POST /api/bookings`
```json
{
  "userId": 1,
  "seatId": 5
}
```
