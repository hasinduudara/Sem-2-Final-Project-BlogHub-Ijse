package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.PaymentDTO;
import lk.ijse.gdse.backend.entity.PaymentEntity;
import lk.ijse.gdse.backend.entity.PaymentStatus;
import lk.ijse.gdse.backend.repository.PaymentRepository;
import lk.ijse.gdse.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;

    @Override
    public PaymentEntity savePayment(PaymentDTO paymentDTO) {
        PaymentEntity payment = new PaymentEntity();
        payment.setPayerId(paymentDTO.getPayerId());
        payment.setReceiverId(paymentDTO.getReceiverId() != null ?
                             paymentDTO.getReceiverId() : 1L); // Default to admin user ID 1
        payment.setExchangeId(paymentDTO.getExchangeId());
        payment.setAmount(paymentDTO.getAmount());
        payment.setPaymentMethod(paymentDTO.getPaymentMethod());
        payment.setPaymentStatus(paymentDTO.getPaymentStatus() != null ?
                                paymentDTO.getPaymentStatus() : PaymentStatus.COMPLETED);
        payment.setPaymentDate(paymentDTO.getPaymentDate() != null ?
                              paymentDTO.getPaymentDate() : LocalDateTime.now());
        payment.setTransactionId(paymentDTO.getTransactionId());
        payment.setPayHerePaymentId(paymentDTO.getPayHerePaymentId());
        payment.setDescription(paymentDTO.getDescription() != null ?
                              paymentDTO.getDescription() : "Subscription Payment");
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentEntity findById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentEntity> findByUserId(Long userId) {
        return paymentRepository.findByPayerId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentEntity findByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentEntity findByExchangeId(String exchangeId) {
        return paymentRepository.findByExchangeId(exchangeId).orElse(null);
    }

    @Override
    public PaymentEntity updatePaymentStatus(String transactionId, PaymentStatus status) {
        PaymentEntity payment = findByTransactionId(transactionId);
        if (payment != null) {
            payment.setPaymentStatus(status);
            payment.setUpdatedAt(LocalDateTime.now());
            return paymentRepository.save(payment);
        }
        throw new RuntimeException("Payment not found with transaction ID: " + transactionId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentEntity> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentEntity> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByPaymentStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentEntity> getPaymentsBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentEntity> getUserRecentPayments(Long userId) {
        return paymentRepository.findByPayerIdOrderByPaymentDateDesc(userId);
    }
}
