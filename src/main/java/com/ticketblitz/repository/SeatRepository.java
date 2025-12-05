package com.ticketblitz.repository;

import com.ticketblitz.model.Seat;
import com.ticketblitz.model.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByEventId(Long eventId);

    // Find available seats for an event
    @Query("SELECT s FROM Seat s WHERE s.event.id = :eventId AND s.status = 'AVAILABLE'")
    List<Seat> findAvailableSeats(@Param("eventId") Long eventId);

    // Pessimistic Lock example (alternative to Optimistic) - just for demonstration
    // if needed
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdWithPessimisticLock(@Param("id") Long id);
}
