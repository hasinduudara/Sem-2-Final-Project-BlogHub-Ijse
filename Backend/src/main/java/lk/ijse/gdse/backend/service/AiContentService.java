package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.GeneratedArticleDTO;

public interface AiContentService {

    GeneratedArticleDTO generateArticleContent(String title);
}