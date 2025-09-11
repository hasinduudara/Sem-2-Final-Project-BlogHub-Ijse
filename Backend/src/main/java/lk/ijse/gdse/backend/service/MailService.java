package lk.ijse.gdse.backend.service;

public interface MailService {
    void sendEmail(String to, String subject, String body);
}
