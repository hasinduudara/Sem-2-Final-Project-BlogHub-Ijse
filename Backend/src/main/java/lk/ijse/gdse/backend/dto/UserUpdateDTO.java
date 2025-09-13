package lk.ijse.gdse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for updating user information
 * Contains only fields that can be updated by the user
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateDTO {
    private String username;
    private String email;
    private String currentPassword; // Required for validation
    private String newPassword; // Optional - only if user wants to change password
}
