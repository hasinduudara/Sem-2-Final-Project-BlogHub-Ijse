package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.CommentDTO;
import lk.ijse.gdse.backend.entity.ArticleEntity;
import lk.ijse.gdse.backend.entity.CommentEntity;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.repository.ArticleRepository;
import lk.ijse.gdse.backend.repository.CommentRepository;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Override
    public CommentDTO addComment(CommentDTO dto, String username) {
        ArticleEntity article = articleRepository.findById(dto.getArticleId())
                .orElseThrow(() -> new RuntimeException("Article not found"));

        // FIXED: Since JWT stores email, search by email instead of username
        UserEntity user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommentEntity comment = CommentEntity.builder()
                .content(dto.getContent())
                .article(article)
                .user(user)
                .build();

        commentRepository.save(comment);

        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .username(user.getUsername())
                .articleId(article.getId())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    @Override
    public List<CommentDTO> getCommentsByArticle(Long articleId) {
        return commentRepository.findByArticle_Id(articleId)
                .stream()
                .map(c -> CommentDTO.builder()
                        .id(c.getId())
                        .content(c.getContent())
                        .username(c.getUser().getUsername())
                        .articleId(c.getArticle().getId())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}