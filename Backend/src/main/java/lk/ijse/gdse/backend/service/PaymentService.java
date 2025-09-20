package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.PaymentDTO;
import lk.ijse.gdse.backend.entity.PaymentEntity;
import lk.ijse.gdse.backend.entity.PaymentStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {

    // Save a new payment
    PaymentEntity savePayment(PaymentDTO paymentDTO);

    // Find payment by ID
    PaymentEntity findById(Long id);

    // Find payments by user ID
    List<PaymentEntity> findByUserId(Long userId);

    // Find payment by transaction ID
    PaymentEntity findByTransactionId(String transactionId);

    // Find payment by exchange ID (PayHere order ID)
    PaymentEntity findByExchangeId(String exchangeId);

    // Update payment status
    PaymentEntity updatePaymentStatus(String transactionId, PaymentStatus status);

    // Get all payments
    List<PaymentEntity> getAllPayments();

    // Get payments by status
    List<PaymentEntity> getPaymentsByStatus(PaymentStatus status);

    // Get payments between dates
    List<PaymentEntity> getPaymentsBetweenDates(LocalDateTime startDate, LocalDateTime endDate);

    // Get user's recent payments
    List<PaymentEntity> getUserRecentPayments(Long userId);
}