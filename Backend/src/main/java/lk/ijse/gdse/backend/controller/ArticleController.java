package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.ArticleDTO;
import lk.ijse.gdse.backend.dto.GeneratedArticleDTO;
import lk.ijse.gdse.backend.dto.PagedResponse;
import lk.ijse.gdse.backend.service.AiContentService;
import lk.ijse.gdse.backend.service.ArticleService;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;
    private final UserRepository userRepository;
    private final AiContentService aiContentService;

    @GetMapping("/published")
    public ResponseEntity<List<ArticleDTO>> getAllPublishedArticles() {
        List<ArticleDTO> articles = articleService.listAllPublished();
        return ResponseEntity.ok(articles);
    }

    // ---- Create (Publish / Schedule) ----
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleDTO> create(
            Authentication authentication,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String publishDate, // if future -> Scheduled
            @RequestParam(required = false) MultipartFile image
    ) {
        String username = authentication.getName();

        UserEntity publisher = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime when = null;
        if (publishDate != null && !publishDate.isBlank()) {
            when = LocalDateTime.parse(publishDate);
        }

        ArticleDTO dto = articleService.createArticle(
                publisher.getId(), title, content, category, when, image
        );
        return ResponseEntity.ok(dto);
    }

    // ---- Get all my articles (by status) ----
    @GetMapping("/me")
    public ResponseEntity<PagedResponse<ArticleDTO>> myArticles(
            Authentication authentication,
            @RequestParam(required = false) String status, // PUBLISHED, SCHEDULED, DRAFT, ALL
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        String username = authentication.getName();

        UserEntity me = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(articleService.listMine(me.getId(), status, page, size));
    }

    // ---- Update (edit) ----
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleDTO> update(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String publishDate,
            @RequestParam(required = false) MultipartFile image
    ) {
        String username = authentication.getName();

        UserEntity publisher = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime when = null;
        if (publishDate != null && !publishDate.isBlank()) {
            when = LocalDateTime.parse(publishDate);
        }

        ArticleDTO dto = articleService.updateArticle(
                publisher.getId(), id, title, content, category, when, image
        );
        return ResponseEntity.ok(dto);
    }

    // ---- Delete ----
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable Long id
    ) {
        String username = authentication.getName();

        UserEntity me = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        articleService.deleteArticle(me.getId(), id);
        return ResponseEntity.noContent().build();
    }

    // ---- Single article (Read more) ----
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getOne(id));
    }

    // ---- Generate AI Article ----
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse> generateArticle(@RequestParam String title) {
        GeneratedArticleDTO dto = aiContentService.generateArticleContent(title);
        ApiResponse response = new ApiResponse(200, "Article content generated successfully", dto);

        return ResponseEntity.ok(response);
    }

}
