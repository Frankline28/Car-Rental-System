package com.carrental.security;

import com.carrental.entity.User;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private static final String SECRET_A = "local-test-key-with-at-least-32-bytes";

    @Test
    void acceptsTokenSignedWithConfiguredKey() {
        JwtService service = new JwtService(SECRET_A, 600);
        User user = new User();
        user.setEmail("customer@example.test");
        user.setRole(User.Role.CUSTOMER);

        String token = service.generate(user);

        assertEquals("customer@example.test", service.subject(token));
    }

    @Test
    void rejectsTokenSignedWithAnotherKey() {
        JwtService issuer = new JwtService(SECRET_A, 600);
        JwtService verifier = new JwtService("another-test-key-with-at-least-32-bytes", 600);
        User user = new User();
        user.setEmail("customer@example.test");
        user.setRole(User.Role.CUSTOMER);

        assertThrows(JwtException.class, () -> verifier.subject(issuer.generate(user)));
    }

    @Test
    void rejectsExpiredToken() {
        JwtService expiredIssuer = new JwtService(SECRET_A, -1);
        User user = new User();
        user.setEmail("customer@example.test");
        user.setRole(User.Role.CUSTOMER);

        assertThrows(JwtException.class, () -> expiredIssuer.subject(expiredIssuer.generate(user)));
    }
}
