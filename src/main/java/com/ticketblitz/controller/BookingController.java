package com.ticketblitz.controller;

import com.ticketblitz.dto.Dtos;
import com.ticketblitz.model.Booking;
import com.ticketblitz.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> bookSeat(@RequestBody Dtos.BookingRequest request) {
        Booking booking = bookingService.bookSeat(request.userId(), request.seatId());
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Booking>> getUserBookings(@RequestParam Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

    // Exception Handler for this controller (or global)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleException(RuntimeException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}
