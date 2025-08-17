package lk.ijse.gdse.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "articles", indexes = {
        @Index(name="idx_status_pubdate", columnList = "status,publishAt")
})
public class ArticleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ---- Basics ----
    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(length = 60)
    private String category;

    // ---- Media ----
    @Column(length = 500)
    private String imageUrl;     // from imgbb data.url

    // ---- Status & Timestamps ----
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ArticleStatus status;   // DRAFT/SCHEDULED/PUBLISHED

    private LocalDateTime scheduleAt; // requested publish datetime (optional)
    private LocalDateTime publishAt;  // actual published datetime

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ---- Owner ----
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publisher_id", nullable = false)
    private UserEntity publisher;
}
