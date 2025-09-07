package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public String registerUser(UserDTO userDTO) {
        System.out.println("=== REGISTRATION DEBUG ===");
        System.out.println("Attempting to register: " + userDTO.getEmail());
        System.out.println("Role provided: " + userDTO.getRole());

        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            System.out.println("Registration failed: Email already exists!");
            return "Email already exists!";
        }

        UserEntity user = new UserEntity();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        try {
            UserRole role = UserRole.valueOf(userDTO.getRole().toUpperCase());
            user.setRole(role);
            System.out.println("Role set successfully: " + role.name());
        } catch (IllegalArgumentException e) {
            System.out.println("Invalid role provided: " + userDTO.getRole());
            return "Invalid role selected!";
        }

        try {
            UserEntity savedUser = userRepository.save(user);
            System.out.println("User saved successfully with ID: " + savedUser.getId());
            System.out.println("Saved user role: " + savedUser.getRole().name());
            System.out.println("==========================");
            return "Registration Successful!";
        } catch (Exception e) {
            System.out.println("Error saving user: " + e.getMessage());
            return "Registration failed due to database error";
        }
    }

    @Override
    public UserEntity validateLogin(String email, String rawPassword) {
        System.out.println("=== LOGIN VALIDATION DEBUG ===");
        System.out.println("Validating login for: " + email);
        System.out.println("Raw password provided: " + (rawPassword != null && !rawPassword.isEmpty()));

        var userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            System.out.println("User not found in database");
            return null;
        }

        UserEntity user = userOptional.get();
        System.out.println("User found: " + user.getEmail());
        System.out.println("User role: " + user.getRole().name());
        System.out.println("Stored password hash length: " + (user.getPassword() != null ? user.getPassword().length() : 0));

        if (rawPassword == null || rawPassword.isEmpty()) {
            System.out.println("Password validation failed: No password provided");
            return null;
        }

        boolean passwordMatches = passwordEncoder.matches(rawPassword, user.getPassword());
        System.out.println("Password matches: " + passwordMatches);
        System.out.println("===============================");

        return passwordMatches ? user : null;
    }

    @Override
    public UserEntity findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
}