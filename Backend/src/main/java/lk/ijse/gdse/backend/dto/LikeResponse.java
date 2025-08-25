package lk.ijse.gdse.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeResponse {
    private Long articleId;
    private int likeCount;
    private boolean likedByUser;
}
