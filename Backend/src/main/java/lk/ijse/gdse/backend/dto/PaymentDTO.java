package lk.ijse.gdse.backend.dto;

import lk.ijse.gdse.backend.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private Long payerId;
    private Long receiverId; // Add receiverId field
    private String exchangeId;
    private Double amount;
    private String paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime paymentDate;
    private String transactionId;
    private String payHerePaymentId;
    private String description;

    // Constructor for frontend payment data
    public PaymentDTO(Long payerId, String exchangeId, Double amount,
                      String paymentMethod, String transactionId) {
        this.payerId = payerId;
        this.exchangeId = exchangeId;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.transactionId = transactionId;
        this.paymentStatus = PaymentStatus.PENDING;
        this.paymentDate = LocalDateTime.now();
        // Set default receiver ID (you can change this to your system/admin user ID)
        this.receiverId = 1L; // Assuming admin user has ID 1
    }
}