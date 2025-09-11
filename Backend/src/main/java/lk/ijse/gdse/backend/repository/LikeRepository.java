package lk.ijse.gdse.backend.repository;

import lk.ijse.gdse.backend.entity.LikeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    Long countByArticleId(Long articleId);
    Optional<LikeEntity> findByArticleIdAndUserId(Long articleId, Long userId);

    @Modifying
    @Transactional
    void deleteByArticleId(Long articleId);
}
