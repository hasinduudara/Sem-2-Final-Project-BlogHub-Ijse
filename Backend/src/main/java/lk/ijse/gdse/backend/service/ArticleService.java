package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.ArticleDTO;
import lk.ijse.gdse.backend.dto.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

public interface ArticleService {
    ArticleDTO createArticle(Long publisherId,
                             String title,
                             String content,
                             String category,
                             LocalDateTime publishDate, // nullable
                             MultipartFile image);      // nullable

    PagedResponse<ArticleDTO> listPublished(int page, int size);

    PagedResponse<ArticleDTO> listMine(Long publisherId, String status, int page, int size);

    ArticleDTO getOne(Long id);

    void runSchedulerOnce(); // to be used by @Scheduled
}
