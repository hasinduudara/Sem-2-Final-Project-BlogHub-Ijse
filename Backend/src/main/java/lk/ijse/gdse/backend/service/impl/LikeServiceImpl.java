package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.entity.ArticleEntity;
import lk.ijse.gdse.backend.entity.LikeEntity;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.repository.ArticleRepository;
import lk.ijse.gdse.backend.repository.LikeRepository;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {
    private final LikeRepository likeRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Override
    public String toggleLike(Long articleId, String username) {
        ArticleEntity article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return likeRepository.findByArticleIdAndUserId(articleId, user.getId())
                .map(existingLike -> {
                    likeRepository.delete(existingLike);
                    return "Unliked";
                }).orElseGet(() -> {
                    LikeEntity like = LikeEntity.builder()
                            .article(article)
                            .user(user)
                            .build();
                    likeRepository.save(like);
                    return "Liked";
                });
    }

    @Override
    public Long getLikes(Long articleId) {
        return likeRepository.countByArticleId(articleId);
    }
}
