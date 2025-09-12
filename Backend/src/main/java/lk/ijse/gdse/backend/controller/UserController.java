package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.LoginResponse;
import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.service.UserService;
import lk.ijse.gdse.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // ✅ User Registration
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody UserDTO userDTO) {
        System.out.println("Registration attempt for: " + userDTO.getEmail() + " with role: " + userDTO.getRole());

        String result = userService.registerUser(userDTO);

        if ("Registration Successful!".equals(result)) {
            // Get the registered user to include ID in response
            UserEntity registeredUser = userService.findByEmail(userDTO.getEmail());
            // ✅ Include role in JWT and response
            String token = jwtUtil.generateToken(userDTO.getEmail(), userDTO.getRole());
            System.out.println("Registration successful, generated token for role: " + userDTO.getRole());
            return ResponseEntity.ok(
                    new ApiResponse(201, "Registration Successful!",
                            new LoginResponse(registeredUser.getId(), userDTO.getUsername(), token, userDTO.getRole()))
            );
        }

        System.out.println("Registration failed: " + result);
        return ResponseEntity.ok(new ApiResponse(400, "Registration Failed", result));
    }

    // ✅ Enhanced User Login with detailed debugging
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody UserDTO userDTO) {
        System.out.println("=== LOGIN DEBUG INFO ===");
        System.out.println("Login attempt for: " + userDTO.getEmail());
        System.out.println("Password provided: " + (userDTO.getPassword() != null ? "Yes" : "No"));

        UserEntity user = userService.validateLogin(userDTO.getEmail(), userDTO.getPassword());

        System.out.println("User found: " + (user != null));
        if (user != null) {
            System.out.println("User ID: " + user.getId());
            System.out.println("Username: " + user.getUsername());
            System.out.println("Email: " + user.getEmail());
            System.out.println("User role (enum): " + user.getRole());
            System.out.println("User role (string): " + user.getRole().name());
            System.out.println("Role comparison - ADMIN: " + user.getRole().name().equals("ADMIN"));
            System.out.println("Role comparison - USER: " + user.getRole().name().equals("USER"));
            System.out.println("Role comparison - PUBLISHER: " + user.getRole().name().equals("PUBLISHER"));
        } else {
            System.out.println("LOGIN FAILED: User validation returned null");
            // Let's check if user exists at all
            UserEntity existingUser = userService.findByEmail(userDTO.getEmail());
            if (existingUser != null) {
                System.out.println("User exists in database with role: " + existingUser.getRole().name());
                System.out.println("Password validation failed");
            } else {
                System.out.println("User does not exist in database");
            }
        }
        System.out.println("========================");

        if (user == null) {
            return ResponseEntity.ok(new ApiResponse(401, "Login Failed", "Invalid email or password"));
        }

        String userRole = user.getRole().name();
        String token = jwtUtil.generateToken(user.getEmail(), userRole);

        System.out.println("Login successful - Generating token with role: " + userRole);
        System.out.println("Token generated successfully");

        return ResponseEntity.ok(
                new ApiResponse(200, "Login Successful",
                        new LoginResponse(user.getId(), user.getUsername(), token, userRole))
        );
    }

    // ✅ Get User by Email
    @GetMapping("/users/{email}")
    public UserEntity getUserByEmail(@PathVariable String email) {
        UserEntity user = userService.findByEmail(email);
        if (user == null) throw new UsernameNotFoundException("User not found");
        return user;
    }

    // ✅ Logout endpoint
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        return ResponseEntity.ok(
                new ApiResponse(200, "Logout Successful", null)
        );
    }

    // ✅ Add this endpoint to check all users in database (for debugging)
    @GetMapping("/debug/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        try {
            var users = userService.getAllUsers(); // You'll need to add this method
            System.out.println("Total users in database: " + users.size());
            users.forEach(user -> {
                System.out.println("User: " + user.getEmail() + " | Role: " + user.getRole().name());
            });
            return ResponseEntity.ok(new ApiResponse(200, "Users retrieved", users));
        } catch (Exception e) {
            System.out.println("Error retrieving users: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse(500, "Error retrieving users", e.getMessage()));
        }
    }
}