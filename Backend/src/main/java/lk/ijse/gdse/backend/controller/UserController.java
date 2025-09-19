package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.LoginResponse;
import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.dto.UserUpdateDTO;
import lk.ijse.gdse.backend.dto.UserProfileResponseDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.service.UserService;
import lk.ijse.gdse.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    // ✅ Get User Profile
    @GetMapping("/profile/{email}")
    public ResponseEntity<ApiResponse> getUserProfile(@PathVariable String email) {
        try {
            UserProfileResponseDTO profile = userService.getUserProfile(email);
            return ResponseEntity.ok(new ApiResponse(200, "Profile retrieved successfully", profile));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(new ApiResponse(404, "Profile not found", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse(500, "Error retrieving profile", e.getMessage()));
        }
    }

    // ✅ Update User Profile
    @PutMapping("/profile/{email}")
    public ResponseEntity<ApiResponse> updateUserProfile(
            @PathVariable String email,
            @RequestBody UserUpdateDTO userUpdateDTO) {
        try {
            System.out.println("=== PROFILE UPDATE DEBUG ===");
            System.out.println("Updating profile for: " + email);
            System.out.println("New username: " + userUpdateDTO.getUsername());
            System.out.println("New email: " + userUpdateDTO.getEmail());
            System.out.println("Password change requested: " + (userUpdateDTO.getNewPassword() != null && !userUpdateDTO.getNewPassword().isEmpty()));

            UserProfileResponseDTO updatedProfile = userService.updateUserProfile(email, userUpdateDTO);

            System.out.println("Profile updated successfully for: " + updatedProfile.getEmail());
            System.out.println("============================");

            return ResponseEntity.ok(new ApiResponse(200, "Profile updated successfully", updatedProfile));
        } catch (RuntimeException e) {
            System.out.println("Profile update failed: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse(400, "Profile update failed", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Unexpected error during profile update: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse(500, "Internal server error", e.getMessage()));
        }
    }

    // ✅ Validate Current Password (for security verification)
    @PostMapping("/validate-password/{email}")
    public ResponseEntity<ApiResponse> validateCurrentPassword(
            @PathVariable String email,
            @RequestBody String currentPassword) {
        try {
            boolean isValid = userService.validateCurrentPassword(email, currentPassword);
            if (isValid) {
                return ResponseEntity.ok(new ApiResponse(200, "Password validated", true));
            } else {
                return ResponseEntity.ok(new ApiResponse(401, "Invalid password", false));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(new ApiResponse(500, "Error validating password", e.getMessage()));
        }
    }

    // ✅ Upload Profile Image
    @PostMapping("/profile/{email}/upload-image")
    public ResponseEntity<ApiResponse> uploadProfileImage(
            @PathVariable String email,
            @RequestParam("image") MultipartFile imageFile) {
        try {
            System.out.println("=== PROFILE IMAGE UPLOAD DEBUG ===");
            System.out.println("Uploading image for user: " + email);
            System.out.println("File name: " + imageFile.getOriginalFilename());
            System.out.println("File size: " + imageFile.getSize() + " bytes");
            System.out.println("File type: " + imageFile.getContentType());

            // Validate file
            if (imageFile.isEmpty()) {
                return ResponseEntity.ok(new ApiResponse(400, "No image file provided", null));
            }

            // Validate file type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.ok(new ApiResponse(400, "File must be an image", null));
            }

            // Validate file size (max 5MB)
            if (imageFile.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.ok(new ApiResponse(400, "Image size must be less than 5MB", null));
            }

            String imageUrl = userService.uploadProfileImage(email, imageFile);

            System.out.println("Image uploaded successfully: " + imageUrl);
            System.out.println("=====================================");

            return ResponseEntity.ok(new ApiResponse(200, "Profile image uploaded successfully", imageUrl));
        } catch (RuntimeException e) {
            System.out.println("Profile image upload failed: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse(400, "Upload failed", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Unexpected error during image upload: " + e.getMessage());
            return ResponseEntity.ok(new ApiResponse(500, "Internal server error", e.getMessage()));
        }
    }
}

// ✅ New controller for profile endpoints that match frontend expectations
@RestController
@RequestMapping("/getprofile")
@RequiredArgsConstructor
class ProfileController {

    private final UserService userService;

    @GetMapping("/getprofildetails")
    public ResponseEntity<UserProfileResponseDTO> getProfileDetails(@RequestParam Long userId) {
        try {
            UserEntity user = userService.findById(userId);
            if (user == null) {
                throw new RuntimeException("User not found with ID: " + userId);
            }

            UserProfileResponseDTO profile = new UserProfileResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getRegisteredAt(),
                user.getProfileImageUrl()
            );

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving profile: " + e.getMessage());
        }
    }
}
