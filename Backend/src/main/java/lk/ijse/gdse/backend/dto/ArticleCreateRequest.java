package lk.ijse.gdse.backend.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ArticleCreateRequest {
    private String title;
    private String content;
    private String category;
    private String publishDate; // ISO string; optional. If future => schedule, if empty/now => publish
    private MultipartFile image; // optional
}
