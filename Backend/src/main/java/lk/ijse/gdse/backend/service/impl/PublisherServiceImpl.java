package lk.ijse.gdse.backend.service.impl;

import lk.ijse.gdse.backend.dto.PublisherUpdateDTO;
import lk.ijse.gdse.backend.dto.PublisherProfileResponseDTO;
import lk.ijse.gdse.backend.entity.UserEntity;
import lk.ijse.gdse.backend.repository.UserRepository;
import lk.ijse.gdse.backend.service.PublisherService;
import lk.ijse.gdse.backend.util.ImgBBClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class PublisherServiceImpl implements PublisherService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImgBBClient imgBBClient;

    @Override
    public PublisherProfileResponseDTO getPublisherProfile(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Publisher not found with email: " + email));

        return new PublisherProfileResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImageUrl()
        );
    }

    @Override
    public PublisherProfileResponseDTO updatePublisherProfile(String email, PublisherUpdateDTO updateDTO) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Publisher not found with email: " + email));

        // 🔒 validate current password
        if (!passwordEncoder.matches(updateDTO.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        // ✅ update fields
        if (updateDTO.getPublisherName() != null && !updateDTO.getPublisherName().isBlank()) {
            user.setUsername(updateDTO.getPublisherName());
        }
        if (updateDTO.getEmail() != null && !updateDTO.getEmail().isBlank()) {
            user.setEmail(updateDTO.getEmail());
        }
        if (updateDTO.getNewPassword() != null && !updateDTO.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updateDTO.getNewPassword()));
        }
        if (updateDTO.getLogoUrl() != null && !updateDTO.getLogoUrl().isBlank()) {
            user.setProfileImageUrl(updateDTO.getLogoUrl());
        }

        userRepository.save(user);

        return new PublisherProfileResponseDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getProfileImageUrl()
        );
    }

    @Override
    public String uploadPublisherLogo(String email, MultipartFile file) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Publisher not found with email: " + email));

        String imageUrl = imgBBClient.uploadToImgBB(file);
        user.setProfileImageUrl(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }
}
