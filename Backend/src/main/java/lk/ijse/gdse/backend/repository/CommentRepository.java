package lk.ijse.gdse.backend.repository;

import lk.ijse.gdse.backend.entity.CommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByArticle_Id(Long articleId);
}
