package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.dto.UserUpdateDTO;
import lk.ijse.gdse.backend.dto.UserProfileResponseDTO;
import lk.ijse.gdse.backend.entity.UserEntity;

import java.util.List;

public interface UserService {
    String registerUser(UserDTO userDTO);
    UserEntity validateLogin(String email, String rawPassword);
    UserEntity findByEmail(String email);
    List<UserEntity> getAllUsers();

    // New methods for user profile management
    UserProfileResponseDTO getUserProfile(String email);
    UserProfileResponseDTO updateUserProfile(String currentEmail, UserUpdateDTO userUpdateDTO);
    boolean validateCurrentPassword(String email, String currentPassword);
    String uploadProfileImage(String email, org.springframework.web.multipart.MultipartFile imageFile);
}
