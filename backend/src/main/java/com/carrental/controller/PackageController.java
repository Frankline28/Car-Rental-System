package com.carrental.controller;

import com.carrental.dto.PackageDtos.*;
import com.carrental.service.PackageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/packages")
public class PackageController {
    private final PackageService service;
    public PackageController(PackageService service) { this.service=service; }
    @GetMapping public List<PackageResponse> list() { return service.list(); }
    @GetMapping("/{id}") public PackageResponse get(@PathVariable String id) { return service.get(id); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) @PreAuthorize("hasRole('ADMIN')") public PackageResponse create(@Valid @RequestBody PackageRequest request) { return service.create(request); }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')") public PackageResponse update(@PathVariable String id,@Valid @RequestBody PackageRequest request) { return service.update(id,request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) @PreAuthorize("hasRole('ADMIN')") public void delete(@PathVariable String id) { service.delete(id); }
}
