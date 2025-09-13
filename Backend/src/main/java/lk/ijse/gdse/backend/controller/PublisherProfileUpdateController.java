package lk.ijse.gdse.backend.controller;

import lk.ijse.gdse.backend.dto.ApiResponse;
import lk.ijse.gdse.backend.dto.PublisherUpdateDTO;
import lk.ijse.gdse.backend.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/publishers")
@RequiredArgsConstructor
public class PublisherProfileUpdateController {

    private final PublisherService publisherService;

    @GetMapping("/profile/{email}")
    public ResponseEntity<ApiResponse> getProfile(@PathVariable String email) {
        return ResponseEntity.ok(new ApiResponse(200, "Profile loaded",
                publisherService.getPublisherProfile(email)));
    }

    @PutMapping("/profile/{email}")
    public ResponseEntity<ApiResponse> updateProfile(
            @PathVariable String email,
            @RequestBody PublisherUpdateDTO updateDTO) {
        return ResponseEntity.ok(new ApiResponse(200, "Profile updated",
                publisherService.updatePublisherProfile(email, updateDTO)));
    }

    @PostMapping("/profile/{email}/upload-logo")
    public ResponseEntity<ApiResponse> uploadLogo(
            @PathVariable String email,
            @RequestParam("image") MultipartFile imageFile) {
        String url = publisherService.uploadPublisherLogo(email, imageFile);
        return ResponseEntity.ok(new ApiResponse(200, "Logo uploaded", url));
    }
}
