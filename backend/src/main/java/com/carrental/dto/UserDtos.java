package com.carrental.dto;

import com.carrental.entity.User;
import jakarta.validation.constraints.*;

public final class UserDtos {
    private UserDtos() {}
    public record UserUpdateRequest(@NotBlank @Size(max=120) String name, @NotBlank @Email @Size(max=190) String email,
        @Size(max=32) String phone, User.UserStatus status) {}
    public record UserResponse(Long id, String name, String email, String phone, User.Role role, User.UserStatus status) {}
}
