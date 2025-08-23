package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ArticleDTO;
import lk.ijse.gdse.backend.dto.PagedResponse;
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

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5500") // no need allowCredentials since no cookies
public class ArticleController {

    private final ArticleService articleService;
    private final UserRepository userRepository;

    // ---- Create (multipart/form-data) ----
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ArticleDTO> create(
            Authentication authentication,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String publishDate, // ISO string
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

    // ---- Public feed for home page ----
    @GetMapping("/published")
    public ResponseEntity<PagedResponse<ArticleDTO>> listPublished(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(articleService.listPublished(page, size));
    }

    // ---- Publisher dashboard tabs ----
    @GetMapping("/me")
    public ResponseEntity<PagedResponse<ArticleDTO>> myArticles(
            Authentication authentication,
            @RequestParam String status, // PUBLISHED or SCHEDULED
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        String username = authentication.getName();
        
        UserEntity me = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(articleService.listMine(me.getId(), status, page, size));
    }

    // ---- Single article (for "Read more") ----
    @GetMapping("/{id}")
    public ResponseEntity<ArticleDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(articleService.getOne(id));
    }
}
