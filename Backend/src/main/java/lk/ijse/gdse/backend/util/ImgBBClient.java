package lk.ijse.gdse.backend.util;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.util.Base64;

@Component
@RequiredArgsConstructor
public class ImgBBClient {

    private final WebClient webClient;

    @Value("${imgbb.api.key}")
    private String apiKey;

    /**
     * Uploads image file to ImgBB and returns the 'data.url'
     */
    public String uploadToImgBB(MultipartFile file) {
        try {
            // Convert to base64 as required by imgbb
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());

            MultiValueMap<String, String> data = new LinkedMultiValueMap<>();
            data.add("image", base64);

            JsonNode node = webClient.post()
                    .uri("https://api.imgbb.com/1/upload?expiration=0&key=" + apiKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(data))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .onErrorResume(ex -> Mono.error(new RuntimeException("ImgBB upload failed", ex)))
                    .block();

            if (node == null || !node.has("data")) {
                throw new RuntimeException("ImgBB invalid response");
            }
            return node.get("data").get("url").asText();
        } catch (Exception e) {
            throw new RuntimeException("Image upload error: " + e.getMessage(), e);
        }
    }
}