package lk.ijse.gdse.backend.util;

import org.springframework.stereotype.Component;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Component
public class GPTClient {

    // Your new OpenRouter API Key
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

            // Construct the JSON payload based on the provided Gemini API code
            String json = "{ \"model\": \"google/gemma-3n-e2b-it:free\", \"messages\": [{\"role\": \"user\", \"content\": \"Write a full article with the title: " + title + "\"}]}";

            try(OutputStream os = con.getOutputStream()) {
                byte[] input = json.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            // Read the API response
            try(BufferedReader br = new BufferedReader(
                    new InputStreamReader(con.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                // The response will be a JSON string. You'll likely need to parse this JSON
                // to extract the actual article content. For now, it returns the raw JSON.
                return response.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating content: " + e.getMessage();
        }
    }
}
