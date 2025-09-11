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

        // 4. Send HTML email with reason
        String subject = "Account Removal Notification";
        String body = "<html><body style='font-family: Arial, sans-serif; color: #333;'>"
                + "<h2 style='color: #d9534f;'>Account Removed</h2>"
                + "<p>Dear <b>" + user.getName() + "</b>,</p>"
                + "<p>Your account has been <b style='color:red;'>removed</b> by an administrator.</p>"
                + "<p><b>Reason:</b> " + reason + "</p>"
                + "<p>If you believe this was a mistake, please contact our support team.</p>"
                + "<br><p>Regards,<br><b>Admin Team</b></p>"
                + "</body></html>";

        mailService.sendEmail(user.getEmail(), subject, body);

        // 5. Finally delete the user
        userRepository.delete(user);
    }

}
