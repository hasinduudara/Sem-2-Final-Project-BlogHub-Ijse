package lk.ijse.gdse.backend.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class PayHereServiceImpl {

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    public String generatePaymentHash(String orderId, String amount, String currency) throws NoSuchAlgorithmException {
        // ✅ Ensure amount is always 2 decimals
        String formattedAmount = String.format("%.2f", Double.parseDouble(amount));

        // ✅ Step 1: MD5 hash the merchant secret
        String hashedSecret = md5(merchantSecret).toUpperCase();

        // ✅ Step 2: Build raw string (merchantId + orderId + amount + currency + hashedSecret)
        String rawData = merchantId + orderId + formattedAmount + currency + hashedSecret;


        System.out.println("Merchant ID: " + merchantId);
        System.out.println("Order ID: " + orderId);
        System.out.println("Amount: " + formattedAmount);
        System.out.println("Currency: " + currency);
        System.out.println("Merchant Secret (raw): " + merchantSecret);
        System.out.println("Hashed Secret: " + hashedSecret);
        System.out.println("Raw Data for MD5: " + rawData);

        // ✅ Step 3: MD5 hash the raw data
        return md5(rawData).toUpperCase();
    }

    private String md5(String input) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

}