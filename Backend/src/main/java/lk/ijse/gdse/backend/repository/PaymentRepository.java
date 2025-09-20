package lk.ijse.gdse.backend.repository;

import lk.ijse.gdse.backend.entity.PaymentEntity;
import lk.ijse.gdse.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    // Find payments by payer ID
    List<PaymentEntity> findByPayerId(Long payerId);

    // Find payment by transaction ID
    Optional<PaymentEntity> findByTransactionId(String transactionId);

    // Find payment by exchange ID (PayHere order ID)
    Optional<PaymentEntity> findByExchangeId(String exchangeId);

    // Find payments by status
    List<PaymentEntity> findByPaymentStatus(PaymentStatus status);

    // Find payments by payer ID and status
    List<PaymentEntity> findByPayerIdAndPaymentStatus(Long payerId, PaymentStatus status);

    // Find payments between dates
    List<PaymentEntity> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find recent payments by payer
    List<PaymentEntity> findByPayerIdOrderByPaymentDateDesc(Long payerId);
}