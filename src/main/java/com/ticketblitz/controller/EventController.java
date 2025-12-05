package com.ticketblitz.controller;

import com.ticketblitz.dto.Dtos;
import com.ticketblitz.model.Event;
import com.ticketblitz.model.Seat;
import com.ticketblitz.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Dtos.EventRequest request) {
        Event event = new Event();
        event.setName(request.name());
        event.setDescription(request.description());
        event.setEventDate(request.eventDate());
        event.setVenueName(request.venueName());

        Event createdEvent = eventService.createEventWithSeats(event, request.totalSeats());
        return ResponseEntity.ok(createdEvent);
    }

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<Seat>> getAvailableSeats(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getAvailableSeats(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Dtos.EventRequest request) {
        Event eventDetails = new Event();
        eventDetails.setName(request.name());
        eventDetails.setVenueName(request.venueName());
        eventDetails.setEventDate(request.eventDate());
        return ResponseEntity.ok(eventService.updateEvent(id, eventDetails));
    }
}
