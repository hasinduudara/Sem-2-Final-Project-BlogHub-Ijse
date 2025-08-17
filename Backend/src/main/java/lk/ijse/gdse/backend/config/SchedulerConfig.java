package lk.ijse.gdse.backend.config;

import lk.ijse.gdse.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class SchedulerConfig {

    private final ArticleService articleService;

    // Runs every 30 seconds to publish due scheduled articles
    @Scheduled(fixedRate = 30_000)
    public void publishDueArticles() {
        articleService.runSchedulerOnce();
    }
}
