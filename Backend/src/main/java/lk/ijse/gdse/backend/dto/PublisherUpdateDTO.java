package lk.ijse.gdse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublisherUpdateDTO {
    private String publisherName;   // basically username
    private String email;
    private String currentPassword;
    private String newPassword;     // optional password change
    private String logoUrl;         // profile logo (from ImgBB)
}
