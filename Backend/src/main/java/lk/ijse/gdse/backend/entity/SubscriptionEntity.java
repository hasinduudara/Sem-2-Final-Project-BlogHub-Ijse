package lk.ijse.gdse.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions", uniqueConstraints = @UniqueConstraint(columnNames = "publisherEmail"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String publisherEmail;   // Publisher email (unique)
    private String plan;             // e.g. MONTHLY, YEARLY
    private double amount;           // e.g. 4999.0
    private LocalDateTime subscribedAt;
    private LocalDateTime expiryDate;
    private String orderId;          // PayHere order ID
    private String paymentStatus;    // PENDING, COMPLETED, FAILED
    private String paymentId;        // PayHere payment ID (when available)

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.PENDING;

    public enum SubscriptionStatus {
        PENDING, ACTIVE, EXPIRED, CANCELLED, FAILED
    }
}
