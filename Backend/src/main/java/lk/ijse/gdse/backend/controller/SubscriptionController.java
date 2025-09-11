package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    // PayHere Merchant Secret
    private static final String MERCHANT_SECRET = "MzM1NTQ4NzQzMjE4MDE4ODU5NjY4MDE0NjY3NzgzMTM3MDc0OTAy";

    @PostMapping("/{email}")
    public ResponseEntity<ApiResponse> subscribe(
            @PathVariable String email,
            @RequestParam(defaultValue = "MONTHLY") String plan,
            @RequestBody Map<String, Object> paymentData) {

        String orderId = (String) paymentData.get("orderId");
        String paymentStatus = (String) paymentData.get("paymentStatus");

        ApiResponse response = subscriptionService.subscribePublisher(email, plan, orderId, paymentStatus);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/notify")
    public ResponseEntity<String> handlePayHereNotification(@RequestBody Map<String, String> notification) {
        try {
            // Extract notification data
            String merchantId = notification.get("merchant_id");
            String orderId = notification.get("order_id");
            String paymentId = notification.get("payment_id");
            String payhereAmount = notification.get("payhere_amount");
            String payhereCurrency = notification.get("payhere_currency");
            String statusCode = notification.get("status_code");
            String md5sig = notification.get("md5sig");

            // Verify the signature
            if (verifyPayHereSignature(merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig)) {
                // Process the payment based on status code
                if ("2".equals(statusCode)) { // Success
                    // Update subscription status in database
                    subscriptionService.updateSubscriptionStatus(orderId, "ACTIVE");
                    return ResponseEntity.ok("OK");
                } else {
                    // Payment failed
                    subscriptionService.updateSubscriptionStatus(orderId, "FAILED");
                    return ResponseEntity.ok("OK");
                }
            } else {
                // Invalid signature
                return ResponseEntity.badRequest().body("Invalid signature");
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing notification");
        }
    }

    private boolean verifyPayHereSignature(String merchantId, String orderId, String amount,
                                         String currency, String statusCode, String md5sig) {
        try {
            String dataToHash = merchantId + orderId + amount + currency + statusCode +
                              MERCHANT_SECRET.toUpperCase();

            Mac mac = Mac.getInstance("HmacMD5");
            SecretKeySpec secretKeySpec = new SecretKeySpec(MERCHANT_SECRET.getBytes(StandardCharsets.UTF_8), "HmacMD5");
            mac.init(secretKeySpec);

            byte[] hashBytes = mac.doFinal(dataToHash.getBytes(StandardCharsets.UTF_8));
            String computedHash = Base64.getEncoder().encodeToString(hashBytes);

            return computedHash.equals(md5sig);
        } catch (Exception e) {
            return false;
        }
    }

    @GetMapping("/status/{email}")
    public ResponseEntity<ApiResponse> getSubscriptionStatus(@PathVariable String email) {
        ApiResponse response = subscriptionService.getSubscriptionStatus(email);
        return ResponseEntity.ok(response);
    }
}