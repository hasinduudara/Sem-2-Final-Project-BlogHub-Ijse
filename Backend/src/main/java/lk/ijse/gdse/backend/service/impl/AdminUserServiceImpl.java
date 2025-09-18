package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.UserDTO;
import lk.ijse.gdse.backend.entity.ArticleEntity;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.entity.UserRole;
import lk.ijse.gdse.backend.repository.ArticleRepository;
import lk.ijse.gdse.backend.repository.CommentRepository;
import lk.ijse.gdse.backend.repository.LikeRepository;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.AdminUserService;
import lk.ijse.gdse.backend.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final MailService mailService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    @Override
    public List<UserDTO> getUsersByRole(String role) {
        return userRepository.findByRole(UserRole.valueOf(role.toUpperCase())).stream()
                .map(user -> new UserDTO(
                        user.getId(),          // id
                        user.getName(),        // username
                        user.getEmail(),       // email
                        null,                  // password (not available from UserEntity)
                        user.getRole().name()  // role
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void removeUser(Long userId, String reason) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // 🔹 Get all articles created by this user
        List<ArticleEntity> userArticles = articleRepository.findAll().stream()
                .filter(article -> article.getPublisher().getId().equals(userId))
                .toList();

        for (ArticleEntity article : userArticles) {
            // 1. Delete likes of the article
            likeRepository.deleteByArticleId(article.getId());

            // 2. Delete comments of the article
            commentRepository.deleteByArticleId(article.getId());
        }

        // 3. Delete the articles themselves
        if (!userArticles.isEmpty()) {
            articleRepository.deleteAll(userArticles);
        }

        // 4. Send specific email based on user role
        String subject;
        String body;

        if (user.getRole() == UserRole.ADMIN) {
            // ✅ Enhanced email for admin removal
            subject = "Admin Account Removal Notification";
            body = "<html><body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 28px;'>Admin Account Removal</h1>"
                    + "</div>"
                    + "<div style='padding: 30px; background: #f8f9fa;'>"
                    + "<p style='font-size: 18px; margin-bottom: 20px;'>Dear <strong style='color: #495057;'>" + user.getName() + "</strong>,</p>"
                    + "<div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;'>"
                    + "<p style='color: #856404; margin: 0; font-size: 16px;'><strong>⚠️ Important Notice:</strong></p>"
                    + "<p style='color: #856404; margin: 10px 0 0 0;'>Your administrator account has been <strong>removed</strong> by another administrator.</p>"
                    + "</div>"
                    + "<div style='background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;'>"
                    + "<h3 style='color: #dc3545; margin: 0 0 10px 0;'>Removal Reason:</h3>"
                    + "<p style='margin: 0; font-size: 16px; color: #495057;'>" + reason + "</p>"
                    + "</div>"
                    + "<div style='background: #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0;'>"
                    + "<h3 style='color: #495057; margin: 0 0 15px 0;'>What this means:</h3>"
                    + "<ul style='color: #6c757d; line-height: 1.6; margin: 0; padding-left: 20px;'>"
                    + "<li>Your admin privileges have been revoked immediately</li>"
                    + "<li>You no longer have access to the admin panel</li>"
                    + "<li>All your admin-related data has been securely removed</li>"
                    + "<li>Any content you published has been handled according to our policies</li>"
                    + "</ul>"
                    + "</div>"
                    + "<p style='color: #6c757d; line-height: 1.6;'>If you believe this action was taken in error or if you have any questions regarding this decision, please contact our support team immediately.</p>"
                    + "<hr style='border: none; border-top: 1px solid #dee2e6; margin: 30px 0;'>"
                    + "<p style='color: #6c757d; font-size: 14px; margin: 0;'>This is an automated notification. Please do not reply to this email.</p>"
                    + "</div>"
                    + "<div style='background: #343a40; padding: 20px; text-align: center;'>"
                    + "<p style='color: #adb5bd; margin: 0; font-size: 14px;'>Best regards,<br><strong style='color: #fff;'>Administration Team</strong></p>"
                    + "</div>"
                    + "</body></html>";
        } else {
            // ✅ Enhanced email for regular user removal
            subject = "Account Removal Notification";
            body = "<html><body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;'>"
                    + "<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;'>"
                    + "<h1 style='color: white; margin: 0; font-size: 28px;'>Account Removal Notification</h1>"
                    + "</div>"
                    + "<div style='padding: 30px; background: #f8f9fa;'>"
                    + "<p style='font-size: 18px; margin-bottom: 20px;'>Dear <strong style='color: #495057;'>" + user.getName() + "</strong>,</p>"
                    + "<div style='background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;'>"
                    + "<p style='color: #856404; margin: 0; font-size: 16px;'><strong>⚠️ Account Status Update:</strong></p>"
                    + "<p style='color: #856404; margin: 10px 0 0 0;'>Your account has been <strong>removed</strong> by an administrator.</p>"
                    + "</div>"
                    + "<div style='background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;'>"
                    + "<h3 style='color: #dc3545; margin: 0 0 10px 0;'>Reason for Removal:</h3>"
                    + "<p style='margin: 0; font-size: 16px; color: #495057;'>" + reason + "</p>"
                    + "</div>"
                    + "<p style='color: #6c757d; line-height: 1.6;'>If you believe this action was taken in error, please contact our support team for assistance.</p>"
                    + "<hr style='border: none; border-top: 1px solid #dee2e6; margin: 30px 0;'>"
                    + "<p style='color: #6c757d; font-size: 14px; margin: 0;'>This is an automated notification. Please do not reply to this email.</p>"
                    + "</div>"
                    + "<div style='background: #343a40; padding: 20px; text-align: center;'>"
                    + "<p style='color: #adb5bd; margin: 0; font-size: 14px;'>Best regards,<br><strong style='color: #fff;'>Administration Team</strong></p>"
                    + "</div>"
                    + "</body></html>";
        }

        // 5. Send the email
        try {
            mailService.sendEmail(user.getEmail(), subject, body);
            System.out.println("✅ Email notification sent successfully to: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("❌ Failed to send email notification to: " + user.getEmail());
            System.err.println("Error: " + e.getMessage());
            // Continue with user deletion even if email fails
        }

        // 6. Finally delete the user
        userRepository.delete(user);
    }

}
