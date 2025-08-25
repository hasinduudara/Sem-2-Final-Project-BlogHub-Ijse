package lk.ijse.gdse.backend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LikeDTO {
    private Long id;
    private Long articleId;
    private String username;
}
