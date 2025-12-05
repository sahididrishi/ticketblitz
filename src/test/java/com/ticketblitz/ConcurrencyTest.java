package com.ticketblitz;

import com.ticketblitz.model.Event;
import com.ticketblitz.model.Seat;
import com.ticketblitz.model.User;
import com.ticketblitz.repository.BookingRepository;
import com.ticketblitz.repository.SeatRepository;
import com.ticketblitz.repository.UserRepository;
import com.ticketblitz.service.BookingService;
import com.ticketblitz.service.EventService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@Testcontainers
public class ConcurrencyTest {

    @Container
    public static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("ticketblitz")
            .withUsername("postgres")
            .withPassword("password");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    public void testConcurrentBooking() throws InterruptedException {
        // Setup
        User user1 = userRepository.save(new User(null, "u1", "u1@test.com", "pw", com.ticketblitz.model.Role.USER));
        User user2 = userRepository.save(new User(null, "u2", "u2@test.com", "pw", com.ticketblitz.model.Role.USER));
        // Create more users if needed, or reuse them (logic allows reuse)

        Event event = new Event();
        event.setName("Rock Concert");
        event.setEventDate(LocalDateTime.now().plusDays(10));
        event.setVenueName("Stadium");
        eventService.createEventWithSeats(event, 1); // Only 1 seat!

        List<Seat> seats = seatRepository.findByEventId(event.getId());
        Long seatId = seats.get(0).getId();

        int numberOfThreads = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (int i = 0; i < numberOfThreads; i++) {
            executorService.submit(() -> {
                try {
                    // Simulate simultaneous requests
                    bookingService.bookSeat(user1.getId(), seatId);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();

        System.out.println("Success: " + successCount.get());
        System.out.println("Fail: " + failCount.get());

        assertEquals(1, successCount.get());
        assertEquals(numberOfThreads - 1, failCount.get());
        assertEquals(1, bookingRepository.count());
    }
}
