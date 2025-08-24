package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ArticleDTO;
import lk.ijse.gdse.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/home")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"}) // allow CORS for your frontend
public class HomePageController {

    private final ArticleService articleService;

    @GetMapping("/articles")
    public ResponseEntity<List<ArticleDTO>> getAllPublishedArticles() {
        List<ArticleDTO> articles = articleService.listAllPublished(); // public endpoint
        return ResponseEntity.ok(articles);
    }
}
