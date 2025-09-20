package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.service.impl.PayHereServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://127.0.0.1:5500", "http://localhost:5500"})
public class PaymentController {

    private final PayHereServiceImpl payHereServiceImpl;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> paymentData) {
        try {
            String orderId = (String) paymentData.get("orderId");
            Object amountObj = paymentData.get("amount");
            Double amount = amountObj instanceof Number ? ((Number) amountObj).doubleValue() : Double.parseDouble(amountObj.toString());
            String currency = (String) paymentData.get("currency");

            // Generate hash for PayHere
            String hash = payHereServiceImpl.generatePaymentHash(orderId, amount.toString(), currency);

            Map<String, Object> response = new HashMap<>();
            Map<String, Object> data = new HashMap<>();
            data.put("hash", hash);
            data.put("orderId", orderId);

            response.put("success", true);
            response.put("message", "Payment created successfully");
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create payment: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/generate-hash")
    public Map<String, String> generateHash(
            @RequestParam String orderId,
            @RequestParam String amount,
            @RequestParam String currency) {
        System.out.println(orderId + " " + amount + " " + currency);

        String hash;
        try {
            hash = payHereServiceImpl.generatePaymentHash(orderId, amount, currency);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }

        Map<String, String> response = new HashMap<>();
        response.put("hash", hash);
        return response;
    }

    @PostMapping("/notify")
    public ResponseEntity<String> handlePayHereNotification(@RequestBody Map<String, Object> notificationData) {
        try {
            // Log the notification for debugging
            System.out.println("PayHere Notification received: " + notificationData);

            // Here you would typically validate the notification and update payment status
            // For now, just acknowledge receipt
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            System.err.println("Error processing PayHere notification: " + e.getMessage());
            return ResponseEntity.badRequest().body("ERROR");
        }
    }
}