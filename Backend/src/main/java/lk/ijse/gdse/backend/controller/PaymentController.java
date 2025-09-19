package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.service.impl.PayHereServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PayHereServiceImpl payHereServiceImpl;


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
}