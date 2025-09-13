package lk.ijse.gdse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for user profile information
 * Returns user data without sensitive information like password
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private java.time.LocalDateTime registeredAt;
    private String profileImageUrl; // ImgBB image URL
}
