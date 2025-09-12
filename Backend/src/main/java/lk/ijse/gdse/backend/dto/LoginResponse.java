package lk.ijse.gdse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private Long userId;      // ✅ Add userId field
    private String username;
    private String token;
    private String role;

}