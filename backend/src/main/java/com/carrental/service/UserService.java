package com.carrental.service;

import com.carrental.dto.UserDtos.*;
import com.carrental.entity.User;
import com.carrental.exception.*;
import com.carrental.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service public class UserService {
    private final UserRepository users;
    public UserService(UserRepository users) { this.users=users; }
    @Transactional(readOnly=true) public List<UserResponse> list() { return users.findAll().stream().map(this::dto).toList(); }
    @Transactional(readOnly=true) public UserResponse get(Long id) { return dto(find(id)); }
    @Transactional public UserResponse update(Long id,UserUpdateRequest r) {
        User user=find(id);
        if(!user.getEmail().equalsIgnoreCase(r.email().trim()) && users.existsByEmailIgnoreCase(r.email().trim())) throw new BadRequestException("An account with this email already exists");
        user.setName(r.name().trim()); user.setEmail(r.email().trim().toLowerCase()); user.setPhone(r.phone());
        if(r.status()!=null) user.setStatus(r.status());
        return dto(users.save(user));
    }
    @Transactional public void delete(Long id,String currentEmail) {
        User user=find(id);
        if(user.getEmail().equalsIgnoreCase(currentEmail)) throw new BadRequestException("You cannot delete your own account");
        users.delete(user);
    }
    private User find(Long id) { return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
    private UserResponse dto(User u) { return new UserResponse(u.getId(),u.getName(),u.getEmail(),u.getPhone(),u.getRole(),u.getStatus()); }
}
