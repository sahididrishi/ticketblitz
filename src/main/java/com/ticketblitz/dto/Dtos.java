package com.ticketblitz.dto;

import java.time.LocalDateTime;

public class Dtos {
    public record BookingRequest(Long userId, Long seatId) {
    }

    public record EventRequest(String name, String description, LocalDateTime eventDate, String venueName,
            int totalSeats) {
    }

    public record RegisterRequest(String username, String email, String password) {
    }

    public record LoginRequest(String username, String password) {
    }
}
