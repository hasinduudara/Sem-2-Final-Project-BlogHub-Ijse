package lk.ijse.gdse.backend.service.impl;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {
    private final Map<String, OtpEntry> otpMap = new ConcurrentHashMap<>();

    public void saveOtp(String email, String otp) {
        otpMap.put(email, new OtpEntry(otp, LocalDateTime.now().plusMinutes(5)));
    }

    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpMap.get(email);
        if (entry == null) return false;
        if (entry.expiry.isBefore(LocalDateTime.now())) {
            otpMap.remove(email);
            return false;
        }
        boolean valid = entry.otp.equals(otp);
        if (valid) otpMap.remove(email); // use once
        return valid;
    }

    private record OtpEntry(String otp, LocalDateTime expiry) {}
}
