package com.carrental.service;

import com.carrental.dto.AuthDtos.*;
import com.carrental.entity.User;
import com.carrental.exception.BadRequestException;
import com.carrental.repository.UserRepository;
import com.carrental.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service public class AuthenticationService {
    private final UserRepository users; private final PasswordEncoder encoder; private final AuthenticationManager authentication; private final JwtService jwt;
    public AuthenticationService(UserRepository users,PasswordEncoder encoder,AuthenticationManager authentication,JwtService jwt) { this.users=users; this.encoder=encoder; this.authentication=authentication; this.jwt=jwt; }
    @Transactional public AuthResponse register(RegisterRequest r) {
        if(users.existsByEmailIgnoreCase(r.email().trim())) throw new BadRequestException("An account with this email already exists");
        User user=new User(); user.setName(r.name().trim()); user.setEmail(r.email().trim().toLowerCase()); user.setPhone(r.phone());
        user.setPassword(encoder.encode(r.password())); user.setRole(User.Role.CUSTOMER); user.setStatus(User.UserStatus.ACTIVE);
        user=users.save(user); return new AuthResponse(jwt.generate(user), dto(user));
    }
    @Transactional(readOnly=true) public AuthResponse login(LoginRequest r) {
        authentication.authenticate(new UsernamePasswordAuthenticationToken(r.email().trim(),r.password()));
        User user=users.findByEmailIgnoreCase(r.email().trim()).orElseThrow(() -> new BadRequestException("Invalid email or password"));
        return new AuthResponse(jwt.generate(user),dto(user));
    }
    private UserResponse dto(User u) { return new UserResponse(u.getId(),u.getName(),u.getEmail(),u.getPhone(),u.getRole().name(),u.getStatus().name()); }
}
