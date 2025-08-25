package lk.ijse.gdse.backend.repository;

import lk.ijse.gdse.backend.entity.LikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    Long countByArticleId(Long articleId);
    Optional<LikeEntity> findByArticleIdAndUserId(Long articleId, Long userId);
}
