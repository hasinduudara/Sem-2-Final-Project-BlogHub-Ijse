package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.ArticleDTO;
import lk.ijse.gdse.backend.dto.PagedResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

public interface ArticleService {
    ArticleDTO createArticle(Long publisherId,
                             String title,
                             String content,
                             String category,
                             LocalDateTime publishDate,
                             MultipartFile image);

    List<ArticleDTO> listAllPublished();

    PagedResponse<ArticleDTO> listMine(Long publisherId, String status, int page, int size);

    ArticleDTO getOne(Long id);

    void runSchedulerOnce();

    // NEW ----
    ArticleDTO updateArticle(Long publisherId,
                             Long articleId,
                             String title,
                             String content,
                             String category,
                             LocalDateTime publishDate,
                             MultipartFile image);

    void deleteArticle(Long publisherId, Long articleId);
}