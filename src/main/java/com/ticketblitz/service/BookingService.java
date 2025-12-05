package com.ticketblitz.service;

import com.ticketblitz.exception.SeatAlreadyBookedException;
import com.ticketblitz.model.*;
import com.ticketblitz.repository.BookingRepository;
import com.ticketblitz.repository.SeatRepository;
import com.ticketblitz.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public Booking bookSeat(Long userId, Long seatId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (seat.getStatus() != SeatStatus.AVAILABLE) {
            throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is already booked.");
        }

        try {
            // Update seat status
            seat.setStatus(SeatStatus.BOOKED);
            seatRepository.save(seat); // This triggers version check

            // Create booking
            Booking booking = new Booking();
            booking.setUser(user);
            booking.setSeat(seat);
            booking.setBookingTime(LocalDateTime.now());
            booking.setStatus(BookingStatus.CONFIRMED);

            return bookingRepository.save(booking);

        } catch (ObjectOptimisticLockingFailureException e) {
            // This catches the race condition where another transaction modified the seat
            throw new SeatAlreadyBookedException("Seat was booked by another user just now. Please try another seat.");
        }
    }
}
