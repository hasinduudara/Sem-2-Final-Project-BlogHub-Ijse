package lk.ijse.gdse.backend.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GPTClient {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.model}")
    private String model;

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_DELAY_MS = 1000; // 1 second

    public String generateArticleContent(String title) {
        return generateArticleContentWithRetry(title, 0);
    }

    private String generateArticleContentWithRetry(String title, int attempt) {
        try {
            URI uri = URI.create(apiUrl);
            HttpURLConnection con = (HttpURLConnection) uri.toURL().openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Authorization", "Bearer " + apiKey);
            con.setRequestProperty("Content-Type", "application/json");
            // Optional: Site URL for rankings on openrouter.ai. Replace with your actual site URL.
            con.setRequestProperty("HTTP-Referer", "https://your-site-url.com");
            // Optional: Site title for rankings on openrouter.ai. Replace with your actual site name.
            con.setRequestProperty("X-Title", "Your Site Name");
            con.setDoOutput(true);

            // ✅ Use configured model
            String json = "{ \"model\": \"" + model + "\", " +
                    "\"messages\": [{\"role\": \"user\", " +
                    "\"content\": \"Write a full article with the title: " + title + "\"}]}";

            try (OutputStream os = con.getOutputStream()) {
                byte[] input = json.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Check response code first
            int responseCode = con.getResponseCode();

            if (responseCode == 200) {
                // Read the successful API response
                try (BufferedReader br = new BufferedReader(
                        new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder response = new StringBuilder();
                    String responseLine;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    return response.toString(); // return raw JSON
                }
            } else if (responseCode == 429) {
                // Rate limit hit - implement exponential backoff
                if (attempt < MAX_RETRIES) {
                    long delay = INITIAL_DELAY_MS * (long) Math.pow(2, attempt);
                    System.out.println("Rate limit hit (429). Retrying in " + delay + "ms. Attempt: " + (attempt + 1));

                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return "Error: Request interrupted during retry delay";
                    }

                    return generateArticleContentWithRetry(title, attempt + 1);
                } else {
                    return "Error: Rate limit exceeded. Please try again later.";
                }
            } else {
                // Read error response
                String errorMessage = readErrorResponse(con);
                return "Error: HTTP " + responseCode + " - " + errorMessage;
            }

        } catch (Exception e) {
            if (attempt < MAX_RETRIES) {
                // Retry on network errors
                long delay = INITIAL_DELAY_MS * (long) Math.pow(2, attempt);
                System.out.println("Network error occurred. Retrying in " + delay + "ms. Attempt: " + (attempt + 1));

                try {
                    Thread.sleep(delay);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    return "Error: Request interrupted during retry delay";
                }

                return generateArticleContentWithRetry(title, attempt + 1);
            } else {
                System.err.println("Error generating content after " + MAX_RETRIES + " attempts: " + e.getMessage());
                return "Error generating content after " + MAX_RETRIES + " attempts: " + e.getMessage();
            }
        }
    }

    private static String readErrorResponse(HttpURLConnection con) {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(con.getErrorStream(), StandardCharsets.UTF_8))) {
            StringBuilder response = new StringBuilder();
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
            return response.toString();
        } catch (Exception e) {
            return "Unable to read error response";
        }
    }
}
