package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.ArticleDTO;
import lk.ijse.gdse.backend.dto.PagedResponse;
import lk.ijse.gdse.backend.entity.ArticleEntity;
import lk.ijse.gdse.backend.entity.ArticleStatus;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.repository.ArticleRepository;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.repository.CommentRepository;
import lk.ijse.gdse.backend.repository.LikeRepository;
import lk.ijse.gdse.backend.service.MailService;
import lk.ijse.gdse.backend.util.ImgBBClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleServiceImpl implements lk.ijse.gdse.backend.service.ArticleService {

    private final ArticleRepository articleRepo;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;
    private final LikeRepository likeRepo;
    private final ImgBBClient imgBBClient;
    private final MailService mailService;

    @Override
    public ArticleDTO createArticle(Long publisherId, String title, String content, String category,
                                    LocalDateTime publishDate, MultipartFile image) {

        UserEntity publisher = userRepo.findById(publisherId)
                .orElseThrow(() -> new RuntimeException("Publisher not found"));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = imgBBClient.uploadToImgBB(image);
        }

        LocalDateTime now = LocalDateTime.now();
        ArticleStatus status;
        LocalDateTime scheduleAt = null, publishAt = null;

        if (publishDate == null || !publishDate.isAfter(now)) {
            status = ArticleStatus.PUBLISHED;
            publishAt = now;
        } else {
            status = ArticleStatus.SCHEDULED;
            scheduleAt = publishDate;
        }

        ArticleEntity saved = articleRepo.save(
                ArticleEntity.builder()
                        .title(title)
                        .content(content)
                        .category(category)
                        .imageUrl(imageUrl)
                        .status(status)
                        .scheduleAt(scheduleAt)
                        .publishAt(publishAt)
                        .publisher(publisher)
                        .build()
        );

        return toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ArticleDTO> listMine(Long publisherId, String statusStr, int page, int size) {
        ArticleStatus status = ArticleStatus.valueOf(statusStr.toUpperCase());
        UserEntity publisher = userRepo.findById(publisherId)
                .orElseThrow(() -> new RuntimeException("Publisher not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ArticleEntity> pg = articleRepo.findByPublisherAndStatus(publisher, status, pageable);
        return toPaged(pg);
    }

    @Override
    @Transactional(readOnly = true)
    public ArticleDTO getOne(Long id) {
        ArticleEntity e = articleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        return toDTO(e);
    }

    @Override
    public void runSchedulerOnce() {
        List<ArticleEntity> due = articleRepo.findByStatusAndScheduleAtLessThanEqual(
                ArticleStatus.SCHEDULED, LocalDateTime.now());

        for (ArticleEntity a : due) {
            a.setStatus(ArticleStatus.PUBLISHED);
            a.setPublishAt(LocalDateTime.now());
            a.setScheduleAt(null);
        }
        // save all automatically via transactional dirty checking
    }

    private PagedResponse<ArticleDTO> toPaged(Page<ArticleEntity> pg) {
        List<ArticleDTO> list = pg.getContent().stream().map(this::toDTO).toList();
        return PagedResponse.<ArticleDTO>builder()
                .content(list)
                .page(pg.getNumber())
                .size(pg.getSize())
                .totalElements(pg.getTotalElements())
                .totalPages(pg.getTotalPages())
                .last(pg.isLast())
                .build();
    }

    private ArticleDTO toDTO(ArticleEntity e) {
        String plain = e.getContent() == null ? "" : e.getContent().replaceAll("\\<.*?\\>", "");
        String excerpt = plain.length() <= 200 ? plain : plain.substring(0, 200) + "...";
        return ArticleDTO.builder()
                .id(e.getId())
                .title(e.getTitle())
                .imageUrl(e.getImageUrl())
                .content(e.getContent())
                .category(e.getCategory())
                .excerpt(excerpt)
                .status(e.getStatus().name())
                .scheduleAt(e.getScheduleAt())
                .publishAt(e.getPublishAt())
                .createdAt(e.getCreatedAt())
                .publisherName(e.getPublisher() != null ? e.getPublisher().getName() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleDTO> listAllPublished() {
        List<ArticleEntity> articles = articleRepo.findByStatusOrderByPublishAtDesc(ArticleStatus.PUBLISHED, Pageable.unpaged()).getContent();
        return articles.stream().map(this::toDTO).toList();
    }

    @Override
    public ArticleDTO updateArticle(Long publisherId, Long articleId, String title, String content,
                                    String category, LocalDateTime publishDate, MultipartFile image) {

        ArticleEntity article = articleRepo.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        if (!article.getPublisher().getId().equals(publisherId)) {
            throw new RuntimeException("You are not allowed to edit this article");
        }

        if (title != null) article.setTitle(title);
        if (content != null) article.setContent(content);
        if (category != null) article.setCategory(category);

        if (image != null && !image.isEmpty()) {
            String imageUrl = imgBBClient.uploadToImgBB(image);
            article.setImageUrl(imageUrl);
        }

        LocalDateTime now = LocalDateTime.now();
        if (publishDate == null || !publishDate.isAfter(now)) {
            article.setStatus(ArticleStatus.PUBLISHED);
            article.setPublishAt(now);
            article.setScheduleAt(null);
        } else {
            article.setStatus(ArticleStatus.SCHEDULED);
            article.setScheduleAt(publishDate);
            article.setPublishAt(null);
        }

        return toDTO(article);
    }

    @Override
    public void deleteArticle(Long publisherId, Long articleId) {
        ArticleEntity article = articleRepo.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        if (!article.getPublisher().getId().equals(publisherId)) {
            throw new RuntimeException("You are not allowed to delete this article");
        }

        // Delete related data first to avoid foreign key constraint violations
        // Delete all comments for this article
        commentRepo.deleteByArticleId(articleId);

        // Delete all likes for this article
        likeRepo.deleteByArticleId(articleId);

        // Now we can safely delete the article
        articleRepo.delete(article);
    }

    @Override
    public List<ArticleDTO> getAllPublishedArticles() {
        return articleRepo.findByStatusOrderByPublishAtDesc(ArticleStatus.PUBLISHED, Pageable.unpaged())
                .stream()
                .map(this::toDTO) // map entity -> DTO
                .collect(Collectors.toList());
    }

    @Override
    public void deleteArticleByAdmin(Long id, String reason) {
        ArticleEntity article = articleRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        String publisherEmail = article.getPublisher().getEmail();

        String subject = "Article Removal Notification";

        String body = "<html><body style='font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;'>"
                + "<div style='background: linear-gradient(135deg, #ff6a00 0%, #ee0979 100%); padding: 30px; text-align: center;'>"
                + "<h1 style='color: white; margin: 0; font-size: 26px;'>Article Removal Notification</h1>"
                + "</div>"

                + "<div style='padding: 25px; background: #f8f9fa;'>"
                + "<p style='font-size: 16px;'>Dear <strong>" + article.getPublisher().getName() + "</strong>,</p>"
                + "<p>We regret to inform you that your article titled <em>\"" + article.getTitle() + "\"</em> has been <strong>removed</strong> by an administrator.</p>"

                + "<div style='background: #fff3cd; border: 1px solid #ffeeba; border-radius: 6px; padding: 15px; margin: 20px 0;'>"
                + "<p style='margin: 0; color: #856404;'><strong>Reason for Removal:</strong></p>"
                + "<p style='margin: 8px 0 0 0; color: #495057;'>" + reason + "</p>"
                + "</div>"

                + "<p style='color: #6c757d; line-height: 1.6;'>If you believe this action was taken in error or would like more details, "
                + "please reply to this email or contact our support team at <a href='mailto:support@bloghub.com'>support@bloghub.com</a>.</p>"

                + "<p>Thank you for your contributions to BlogHub.</p>"
                + "<p style='margin-top: 20px;'>Best regards,<br><strong>The BlogHub Team</strong></p>"
                + "<hr style='border: none; border-top: 1px solid #dee2e6; margin: 30px 0;'>"
                + "<p style='color: #6c757d; font-size: 13px; margin: 0;'>This is an automated notification. Please do not reply directly to this message.</p>"
                + "</div>"

                + "<div style='background: #343a40; padding: 18px; text-align: center;'>"
                + "<p style='color: #adb5bd; margin: 0; font-size: 14px;'>© 2025 BlogHub Team</p>"
                + "</div>"
                + "</body></html>";

        try {
            mailService.sendEmail(publisherEmail, subject, body);
            System.out.println("✅ Removal email sent to: " + publisherEmail);
        } catch (Exception e) {
            System.err.println("❌ Failed to send removal email to: " + publisherEmail);
            System.err.println("Error: " + e.getMessage());
        }

        // Delete related data first to avoid foreign key constraint violations
        commentRepo.deleteByArticleId(id);
        likeRepo.deleteByArticleId(id);

        // Now we can safely delete the article
        articleRepo.delete(article);
    }
    
}