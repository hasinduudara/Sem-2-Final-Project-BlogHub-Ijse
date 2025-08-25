package lk.ijse.gdse.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"article_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id", nullable = false)
    private ArticleEntity article;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}
