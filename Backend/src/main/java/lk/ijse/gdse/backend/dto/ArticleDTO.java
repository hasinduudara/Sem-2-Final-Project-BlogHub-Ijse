package lk.ijse.gdse.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ArticleDTO {
    private Long id;
    private String title;
    private String imageUrl;
    private String category;
    private String excerpt;     // first ~200 chars
    private String status;
    private LocalDateTime scheduleAt;
    private LocalDateTime publishAt;
    private LocalDateTime createdAt;
    private String publisherName;
}
