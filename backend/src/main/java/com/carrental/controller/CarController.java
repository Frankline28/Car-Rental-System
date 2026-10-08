package com.carrental.controller;

import com.carrental.dto.CarDtos.*;
import com.carrental.service.CarService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController @RequestMapping("/api/cars")
public class CarController {
    private final CarService service;
    public CarController(CarService service) { this.service=service; }
    @GetMapping public List<CarResponse> list(@RequestParam(required=false) String location, @RequestParam(required=false) String type,
        @RequestParam(name="q", required=false) String query, @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) Instant start,
        @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) Instant end) { return service.list(location,type,query,start,end); }
    @GetMapping("/{id}") public CarResponse get(@PathVariable Long id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')") public CarResponse create(@Valid @RequestBody CarRequest request) { return service.create(request); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public CarResponse update(@PathVariable Long id,@Valid @RequestBody CarRequest request) { return service.update(id,request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('ADMIN')") public void delete(@PathVariable Long id) { service.delete(id); }
}
