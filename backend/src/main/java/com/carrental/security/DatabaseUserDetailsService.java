package com.carrental.security;

import com.carrental.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.authentication.DisabledException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public DatabaseUserDetailsService(UserRepository users) { this.users = users; }
    @Override public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = users.findByEmailIgnoreCase(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (user.getStatus() != com.carrental.entity.User.UserStatus.ACTIVE) throw new DisabledException("User is blocked");
        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail()).password(user.getPassword())
            .authorities("ROLE_" + user.getRole().name()).build();
    }
}
