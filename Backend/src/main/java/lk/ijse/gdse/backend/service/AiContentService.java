package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.GeneratedArticleDTO;

public interface AiContentService {
    /**
     * Generates article content based on a title using an AI model.
     * This method does NOT save anything to the database.
     * @param title The title/topic for the article.
     * @return A DTO containing the generated content.
     */
    GeneratedArticleDTO generateArticleContent(String title);
}