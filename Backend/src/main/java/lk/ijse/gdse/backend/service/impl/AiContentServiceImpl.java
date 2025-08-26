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

            // 2. Check if response is valid JSON and not an error message
            if (rawJsonResponse.startsWith("Error") || rawJsonResponse.isEmpty()) {
                // Use fallback content if API returned error
                String fallbackContent = "This is a comprehensive article about " + title + ". " +
                        "We will explore the key aspects and importance of this topic in detail. " +
                        "Understanding " + title + " is crucial for anyone looking to gain deeper insights " +
                        "into this subject matter. This article provides valuable information and " +
                        "practical knowledge that can be applied effectively.";
                return new GeneratedArticleDTO(title, fallbackContent);
            }

            // 3. Parse the JSON to extract the actual content
            JsonNode rootNode = objectMapper.readTree(rawJsonResponse);

            // Check if the JSON structure is valid
            if (!rootNode.has("choices") || rootNode.path("choices").size() == 0) {
                throw new RuntimeException("Invalid API response structure");
            }

            String generatedText = rootNode
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            if (generatedText.isEmpty()) {
                throw new RuntimeException("AI response did not contain content.");
            }

            // 4. Return the content in our DTO
            return new GeneratedArticleDTO(title, generatedText);

        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error in AiContentServiceImpl: " + e.getMessage());
            e.printStackTrace();

            // Return fallback content instead of throwing exception
            String fallbackContent = "This is a detailed article about " + title + ". " +
                    "In this comprehensive exploration, we delve into the various aspects of this important topic. " +
                    "The significance of " + title + " extends across multiple domains and applications. " +
                    "Through this article, we aim to provide readers with valuable insights and understanding " +
                    "that will enhance their knowledge and perspective on " + title + ".";

            return new GeneratedArticleDTO(title, fallbackContent);
        }
    }
}