package lk.ijse.gdse.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.ijse.gdse.backend.dto.GeneratedArticleDTO;
import lk.ijse.gdse.backend.service.AiContentService;
import lk.ijse.gdse.backend.util.GPTClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiContentServiceImpl implements AiContentService {

    private final GPTClient gptClient;
    private final ObjectMapper objectMapper = new ObjectMapper(); // For parsing JSON response

    @Override
    public GeneratedArticleDTO generateArticleContent(String title) {
        try {
            // 1. Get the raw JSON response from the GPT client
            String rawJsonResponse = gptClient.generateArticleContent(title);

            // 2. Parse the JSON to extract the actual content
            JsonNode rootNode = objectMapper.readTree(rawJsonResponse);
            String generatedText = rootNode
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            if (generatedText.isEmpty()) {
                throw new RuntimeException("AI response did not contain content.");
            }

            // 3. Return the content in our new DTO
            return new GeneratedArticleDTO(title, generatedText);

        } catch (Exception e) {
            // Log the error for debugging
            e.printStackTrace();
            throw new RuntimeException("Failed to generate or parse AI content: " + e.getMessage(), e);
        }
    }
}