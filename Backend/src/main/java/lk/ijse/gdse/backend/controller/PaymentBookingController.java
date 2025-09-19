package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.PaymentDTO;
import lk.ijse.gdse.backend.entity.PaymentEntity;
import lk.ijse.gdse.backend.entity.PaymentStatus;
import lk.ijse.gdse.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mybookings")
@RequiredArgsConstructor
public class PaymentBookingController {

    private final PaymentService paymentService;

    @PostMapping("/paymentdone")
    public ResponseEntity<Map<String, Object>> savePaymentDetails(@RequestBody Map<String, Object> paymentData) {
        try {
            // Extract payment data from request
            Long payerId = Long.valueOf(paymentData.get("payerId").toString());
            String exchangeId = paymentData.get("exchangeId").toString();
            Double amount = Double.valueOf(paymentData.get("amount").toString());
            String paymentMethod = paymentData.get("paymentMethod").toString();
            String transactionId = paymentData.get("transactionId").toString();

            // Parse payment date
            LocalDateTime paymentDate = LocalDateTime.now();
            if (paymentData.get("paymentDate") != null) {
                try {
                    paymentDate = LocalDateTime.parse(paymentData.get("paymentDate").toString().substring(0, 19));
                } catch (Exception e) {
                    System.out.println("Date parsing failed, using current time: " + e.getMessage());
                }
            }

            // Create PaymentDTO
            PaymentDTO paymentDTO = new PaymentDTO();
            paymentDTO.setPayerId(payerId);
            paymentDTO.setReceiverId(1L); // Set default receiver ID (admin/system user)
            paymentDTO.setExchangeId(exchangeId);
            paymentDTO.setAmount(amount);
            paymentDTO.setPaymentMethod(paymentMethod);
            paymentDTO.setPaymentStatus(PaymentStatus.COMPLETED);
            paymentDTO.setPaymentDate(paymentDate);
            paymentDTO.setTransactionId(transactionId);
            paymentDTO.setDescription("Subscription Payment - PayHere Gateway");

            // Save payment to database
            PaymentEntity savedPayment = paymentService.savePayment(paymentDTO);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment details saved successfully");
            response.put("paymentId", savedPayment.getId());
            response.put("transactionId", savedPayment.getTransactionId());
            response.put("status", savedPayment.getPaymentStatus().name());

            System.out.println("✅ Payment saved successfully: " + savedPayment.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error saving payment: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to save payment details: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());

            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentEntity>> getAllPayments() {
        try {
            List<PaymentEntity> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            System.err.println("Error fetching all payments: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/payments/{userId}")
    public ResponseEntity<List<PaymentEntity>> getUserPayments(@PathVariable Long userId) {
        try {
            List<PaymentEntity> payments = paymentService.findByUserId(userId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            System.err.println("Error fetching user payments: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/payments/transaction/{transactionId}")
    public ResponseEntity<PaymentEntity> getPaymentByTransactionId(@PathVariable String transactionId) {
        try {
            PaymentEntity payment = paymentService.findByTransactionId(transactionId);
            if (payment != null) {
                return ResponseEntity.ok(payment);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching payment by transaction ID: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
