package lk.ijse.gdse.backend.repository;

import lk.ijse.gdse.backend.entity.SubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, Long> {
    Optional<SubscriptionEntity> findByPublisherEmail(String email);
    Optional<SubscriptionEntity> findByOrderId(String orderId);
    boolean existsByPublisherEmail(String email);
    boolean existsByOrderId(String orderId);
}
