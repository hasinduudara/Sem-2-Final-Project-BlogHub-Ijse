package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.dto.UserUpdateDTO;
import lk.ijse.gdse.backend.dto.UserProfileResponseDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.UserService;
import lk.ijse.gdse.backend.util.ImgBBClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImgBBClient imgBBClient;

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

    @Override
    public UserProfileResponseDTO getUserProfile(String email) {
        Optional<UserEntity> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        UserEntity user = userOptional.get();
        return new UserProfileResponseDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name(),
            user.getRegisteredAt(),
            user.getProfileImageUrl()
        );
    }

    @Override
    public UserProfileResponseDTO updateUserProfile(String currentEmail, UserUpdateDTO userUpdateDTO) {
        Optional<UserEntity> userOptional = userRepository.findByEmail(currentEmail);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with email: " + currentEmail);
        }

        UserEntity user = userOptional.get();

        // Validate current password
        if (!validateCurrentPassword(currentEmail, userUpdateDTO.getCurrentPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Check if email is being changed and if new email already exists
        if (!user.getEmail().equals(userUpdateDTO.getEmail())) {
            if (userRepository.findByEmail(userUpdateDTO.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists: " + userUpdateDTO.getEmail());
            }
        }

        // Update user information
        user.setUsername(userUpdateDTO.getUsername());
        user.setEmail(userUpdateDTO.getEmail());

        // Update password if new password is provided
        if (userUpdateDTO.getNewPassword() != null && !userUpdateDTO.getNewPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userUpdateDTO.getNewPassword()));
        }

        try {
            UserEntity updatedUser = userRepository.save(user);
            return new UserProfileResponseDTO(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole().name(),
                updatedUser.getRegisteredAt(),
                updatedUser.getProfileImageUrl()
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user profile: " + e.getMessage());
        }
    }

    @Override
    public boolean validateCurrentPassword(String email, String currentPassword) {
        if (currentPassword == null || currentPassword.isEmpty()) {
            return false;
        }

        Optional<UserEntity> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            return false;
        }

        UserEntity user = userOptional.get();
        return passwordEncoder.matches(currentPassword, user.getPassword());
    }

    @Override
    public String uploadProfileImage(String email, org.springframework.web.multipart.MultipartFile imageFile) {
        Optional<UserEntity> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found with email: " + email);
        }

        try {
            // Upload image to ImgBB and get the URL
            String imageUrl = imgBBClient.uploadToImgBB(imageFile);

            // Update user's profile image URL
            UserEntity user = userOptional.get();
            user.setProfileImageUrl(imageUrl);
            userRepository.save(user);

            System.out.println("Profile image uploaded successfully for user: " + email);
            System.out.println("Image URL: " + imageUrl);

            return imageUrl;
        } catch (Exception e) {
            System.err.println("Failed to upload profile image for user: " + email);
            System.err.println("Error: " + e.getMessage());
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage());
        }
    }
}