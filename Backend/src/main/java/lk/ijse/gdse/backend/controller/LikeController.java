package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;

    @PostMapping("/{articleId}")
    public ResponseEntity<ApiResponse> toggleLike(@PathVariable Long articleId, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(new ApiResponse(401, "Unauthorized", null));
            }
            String username = authentication.getName();
            Object result = likeService.toggleLike(articleId, username);
            return ResponseEntity.ok(new ApiResponse(200, "SUCCESS", result));
        } catch (Exception e) {
            e.printStackTrace(); // see exact exception in console
            return ResponseEntity.status(500).body(new ApiResponse(500, "FAILED: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{articleId}")
    public ResponseEntity<ApiResponse> getLikes(@PathVariable Long articleId) {
        return ResponseEntity.ok(new ApiResponse(200, "SUCCESS", likeService.getLikes(articleId)));
    }
}
