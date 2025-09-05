package lk.ijse.gdse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String username;
    private String token;
    private String role;  // ✅ Add role field

    // Keep the old constructor for backward compatibility
    public LoginResponse(String username, String token) {
        this.username = username;
        this.token = token;
        this.role = "USER"; // default value
    }
}