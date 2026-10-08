package com.carrental.controller;

import com.carrental.dto.AuthDtos.*;
import com.carrental.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationService service;
    public AuthController(AuthenticationService service) { this.service=service; }
    @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public AuthResponse register(@Valid @RequestBody RegisterRequest request) { return service.register(request); }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest request) { return service.login(request); }
}
