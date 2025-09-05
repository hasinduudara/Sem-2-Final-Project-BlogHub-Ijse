package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.CommentDTO;
import lk.ijse.gdse.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private static final Logger logger = LoggerFactory.getLogger(CommentController.class);

    @PostMapping
    public ResponseEntity<ApiResponse> addComment(@RequestBody CommentDTO dto, Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(new ApiResponse(401, "UNAUTHORIZED", null));
            }

            if (dto == null || dto.getContent() == null || dto.getContent().trim().isEmpty() || dto.getArticleId() == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(400, "Bad request: missing content or articleId", null));
            }

            String username = authentication.getName();
            return ResponseEntity.ok(new ApiResponse(200, "SUCCESS", commentService.addComment(dto, username)));
        } catch (Exception e) {
            logger.error("Error while adding comment", e);
            String msg = e.getMessage() == null ? "Internal Server Error" : e.getMessage();
            if (msg.contains("Article not found") || msg.contains("User not found")) {
                return ResponseEntity.status(404).body(new ApiResponse(404, msg, null));
            }
            return ResponseEntity.status(500).body(new ApiResponse(500, "Internal Server Error: " + msg, null));
        }
    }

    @GetMapping("/{articleId}")
    public ResponseEntity<ApiResponse> getComments(@PathVariable Long articleId) {
        return ResponseEntity.ok(new ApiResponse(200, "SUCCESS", commentService.getCommentsByArticle(articleId)));
    }
}
