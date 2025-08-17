package lk.ijse.gdse.backend.repository;

import lk.ijse.gdse.backend.entity.ArticleEntity;
import lk.ijse.gdse.backend.entity.ArticleStatus;
import lk.ijse.gdse.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ArticleRepository extends JpaRepository<ArticleEntity, Long> {

    Page<ArticleEntity> findByStatusOrderByPublishAtDesc(ArticleStatus status, Pageable pageable);

    Page<ArticleEntity> findByPublisherAndStatus(UserEntity publisher, ArticleStatus status, Pageable pageable);

    List<ArticleEntity> findByStatusAndScheduleAtLessThanEqual(ArticleStatus status, LocalDateTime now);
}
