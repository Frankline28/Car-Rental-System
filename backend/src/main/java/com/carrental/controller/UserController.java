package com.carrental.controller;

import com.carrental.dto.UserDtos.*;
import com.carrental.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/users") @PreAuthorize("hasRole('ADMIN')")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service=service; }
    @GetMapping public List<UserResponse> list() { return service.list(); }
    @GetMapping("/{id}") public UserResponse get(@PathVariable Long id) { return service.get(id); }
    @PutMapping("/{id}") public UserResponse update(@PathVariable Long id,@Valid @RequestBody UserUpdateRequest request) { return service.update(id,request); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id,Authentication auth) { service.delete(id,auth.getName()); }
}
