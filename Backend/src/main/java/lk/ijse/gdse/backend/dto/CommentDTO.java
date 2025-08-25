package lk.ijse.gdse.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentDTO {
    private Long id;
    private String content;
    private String username;
    private Long articleId;
    private LocalDateTime createdAt;
}
