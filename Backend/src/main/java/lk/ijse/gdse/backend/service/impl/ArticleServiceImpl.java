package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.ArticleDTO;
import lk.ijse.gdse.backend.dto.PagedResponse;
import lk.ijse.gdse.backend.entity.ArticleEntity;
import lk.ijse.gdse.backend.entity.ArticleStatus;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.repository.ArticleRepository;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.util.ImgBBClient;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ArticleServiceImpl implements lk.ijse.gdse.backend.service.ArticleService {

    private final ArticleRepository articleRepo;
    private final UserRepository userRepo;
    private final ImgBBClient imgBBClient;

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

//    @Override
//    @Transactional(readOnly = true)
//    public PagedResponse<ArticleDTO> listPublished(int page, int size) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishAt"));
//        Page<ArticleEntity> pg = articleRepo.findByStatusOrderByPublishAtDesc(ArticleStatus.PUBLISHED, pageable);
//        return toPaged(pg);
//    }

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
}