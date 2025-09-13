package lk.ijse.gdse.backend.service;

import lk.ijse.gdse.backend.dto.PublisherUpdateDTO;
import lk.ijse.gdse.backend.dto.PublisherProfileResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface PublisherService {

    PublisherProfileResponseDTO getPublisherProfile(String email);

    PublisherProfileResponseDTO updatePublisherProfile(String email, PublisherUpdateDTO updateDTO);

    String uploadPublisherLogo(String email, MultipartFile file);
}
