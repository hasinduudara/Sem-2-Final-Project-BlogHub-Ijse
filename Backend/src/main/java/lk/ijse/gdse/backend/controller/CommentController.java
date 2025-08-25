package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.CommentDTO;
import lk.ijse.gdse.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponse> addComment(@RequestBody CommentDTO dto, Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(new ApiResponse(200, "SUCCESS", commentService.addComment(dto, username)));
    }

    @GetMapping("/{articleId}")
    public ResponseEntity<ApiResponse> getComments(@PathVariable Long articleId) {
        return ResponseEntity.ok(new ApiResponse(200, "SUCCESS", commentService.getCommentsByArticle(articleId)));
    }
}
