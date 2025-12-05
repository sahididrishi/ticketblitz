package com.ticketblitz.service;

import com.ticketblitz.model.Event;
import com.ticketblitz.model.Seat;
import com.ticketblitz.model.SeatStatus;
import com.ticketblitz.repository.EventRepository;
import com.ticketblitz.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public Event createEventWithSeats(Event event, int numberOfSeats) {
        Event savedEvent = eventRepository.save(event);

        List<Seat> seats = new ArrayList<>();
        for (int i = 1; i <= numberOfSeats; i++) {
            Seat seat = new Seat();
            seat.setSeatNumber("S" + i);
            seat.setEvent(savedEvent);
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setPrice(100.0); // Default price
            seats.add(seat);
        }
        seatRepository.saveAll(seats);

        return savedEvent;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Seat> getAvailableSeats(Long eventId) {
        return seatRepository.findByEventId(eventId);
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));
        event.setName(eventDetails.getName());
        event.setVenueName(eventDetails.getVenueName());
        event.setEventDate(eventDetails.getEventDate());
        return eventRepository.save(event);
    }
}
