package com.carrental.controller;

import com.carrental.dto.BookingDtos.*;
import com.carrental.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService service;
    public BookingController(BookingService service) { this.service=service; }
    @GetMapping("/my") @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')") public List<BookingResponse> mine(Authentication auth) { return service.mine(auth.getName()); }
    @GetMapping @PreAuthorize("hasRole('ADMIN')") public List<BookingResponse> all() { return service.all(); }
    @GetMapping("/{id}") public BookingResponse get(@PathVariable Long id,Authentication auth) { return service.get(id,auth.getName(),isAdmin(auth)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')") public BookingResponse create(@Valid @RequestBody BookingRequest request,Authentication auth) { return service.create(request,auth.getName()); }
    @PutMapping("/{id}") @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')") public BookingResponse update(@PathVariable Long id,@Valid @RequestBody BookingRequest request,Authentication auth) { return service.update(id,request,auth.getName(),isAdmin(auth)); }
    @PatchMapping("/{id}/cancel") @PreAuthorize("hasAnyRole('CUSTOMER','ADMIN')") public BookingResponse cancel(@PathVariable Long id,Authentication auth) { return service.cancel(id,auth.getName(),isAdmin(auth)); }
    private boolean isAdmin(Authentication auth) { return auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")); }
}
