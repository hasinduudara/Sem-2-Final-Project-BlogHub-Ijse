package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.MailService;
import lk.ijse.gdse.backend.service.impl.OtpStore;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Random;

@RestController
@RequestMapping("/api/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final MailService mailService;
    private final OtpStore otpStore;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/find-email/{username}")
    public ResponseEntity<?> findEmailByUsername(@PathVariable String username) {
        UserEntity user = userRepository.findAll()
                .stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .findFirst()
                .orElse(null);

        if (user == null) return ResponseEntity.badRequest().body("User not found");

        return ResponseEntity.ok(user.getEmail());
    }

    @GetMapping("/validate-email/{email}")
    public ResponseEntity<?> validateEmail(@PathVariable String email) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok("Email found");
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStore.saveOtp(email, otp);
        mailService.sendEmail(email, "Password Reset OTP",
                "<p>Your OTP code is: <b>" + otp + "</b></p>");
        return ResponseEntity.ok("OTP sent to email");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        boolean valid = otpStore.verifyOtp(email, otp);
        return valid ? ResponseEntity.ok("OTP verified")
                : ResponseEntity.badRequest().body("Invalid or expired OTP");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully");
    }
}
