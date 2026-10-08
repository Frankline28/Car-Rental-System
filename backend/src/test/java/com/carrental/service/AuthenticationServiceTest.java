package com.carrental.service;

import com.carrental.dto.AuthDtos.LoginRequest;
import com.carrental.dto.AuthDtos.RegisterRequest;
import com.carrental.entity.User;
import com.carrental.exception.BadRequestException;
import com.carrental.repository.UserRepository;
import com.carrental.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {
    @Mock UserRepository users;
    @Mock AuthenticationManager authentication;
    @Mock JwtService jwt;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    AuthenticationService service;

    @BeforeEach
    void setUp() {
        service = new AuthenticationService(users, encoder, authentication, jwt);
    }

    @Test
    void registrationAlwaysCreatesCustomerWithHashedPasswordAndNoPasswordResponse() {
        when(users.existsByEmailIgnoreCase("customer@example.test")).thenReturn(false);
        when(users.save(any(User.class))).thenAnswer(call -> call.getArgument(0));
        when(jwt.generate(any(User.class))).thenReturn("test-token");

        var result = service.register(new RegisterRequest("Test Customer", "customer@example.test", "long-enough-password", "555"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertEquals(User.Role.CUSTOMER, saved.getValue().getRole());
        assertEquals(User.UserStatus.ACTIVE, saved.getValue().getStatus());
        assertTrue(encoder.matches("long-enough-password", saved.getValue().getPassword()));
        assertNotEquals("long-enough-password", saved.getValue().getPassword());
        assertEquals("CUSTOMER", result.user().role());
        assertEquals("test-token", result.token());
        assertFalse(result.user().toString().contains("password"));
        assertFalse(java.util.Arrays.stream(RegisterRequest.class.getRecordComponents())
            .anyMatch(component -> component.getName().equals("role")));
    }

    @Test
    void duplicateEmailIsRejectedBeforeSaving() {
        when(users.existsByEmailIgnoreCase("customer@example.test")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> service.register(
            new RegisterRequest("Customer", "customer@example.test", "long-enough-password", null)));
        verify(users, never()).save(any());
    }

    @Test
    void loginWithValidCredentialsReturnsUserAndToken() {
        User user = customer();
        when(users.findByEmailIgnoreCase("customer@example.test")).thenReturn(Optional.of(user));
        when(jwt.generate(user)).thenReturn("valid-token");

        var result = service.login(new LoginRequest("customer@example.test", "correct-password"));

        verify(authentication).authenticate(any());
        assertEquals("valid-token", result.token());
        assertEquals("CUSTOMER", result.user().role());
    }

    @Test
    void loginRejectsWrongPassword() {
        when(authentication.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));
        assertThrows(BadCredentialsException.class,
            () -> service.login(new LoginRequest("customer@example.test", "wrong-password")));
        verifyNoInteractions(jwt);
    }

    @Test
    void loginRejectsUnknownUser() {
        when(authentication.authenticate(any())).thenThrow(new BadCredentialsException("bad credentials"));
        assertThrows(BadCredentialsException.class,
            () -> service.login(new LoginRequest("unknown@example.test", "some-password")));
        verifyNoInteractions(jwt);
    }

    private User customer() {
        User user = new User();
        user.setId(17L);
        user.setName("Test Customer");
        user.setEmail("customer@example.test");
        user.setRole(User.Role.CUSTOMER);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setPassword(encoder.encode("correct-password"));
        return user;
    }
}
