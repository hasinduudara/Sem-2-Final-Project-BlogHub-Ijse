package lk.ijse.gdse.backend.dto;

import lombok.Data;
import lk.ijse.gdse.backend.entity.UserEntity;

@Data
public class AdminProfileResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String role;

    public AdminProfileResponseDTO(UserEntity user) {
        this.id = user.getId();
        this.username = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
    }
}
