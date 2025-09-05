package lk.ijse.gdse.backend.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

import org.springframework.stereotype.Component;

@Component
public class GPTClient {

    // ✅ Use your new OpenRouter API Key
    private static final String API_KEY = "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";

    public static String generateArticleContent(String title) {
        try {
            URL url = new URL("https://openrouter.ai/api/v1/chat/completions");
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Authorization", "Bearer " + API_KEY);
            con.setRequestProperty("Content-Type", "application/json");
            // Optional: Site URL for rankings on openrouter.ai. Replace with your actual site URL.
            con.setRequestProperty("HTTP-Referer", "https://your-site-url.com");
            // Optional: Site title for rankings on openrouter.ai. Replace with your actual site name.
            con.setRequestProperty("X-Title", "Your Site Name");
            con.setDoOutput(true);

            // ✅ Use DeepSeek R1 (Free) model
            String json = "{ \"model\": \"deepseek/deepseek-r1:free\", " +
                    "\"messages\": [{\"role\": \"user\", " +
                    "\"content\": \"Write a full article with the title: " + title + "\"}]}";

            try (OutputStream os = con.getOutputStream()) {
                byte[] input = json.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Read the API response
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                return response.toString(); // return raw JSON
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating content: " + e.getMessage();
        }
    }
}
